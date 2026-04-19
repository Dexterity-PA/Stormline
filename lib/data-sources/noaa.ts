import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

/**
 * NOAA adapter — spans two NOAA APIs:
 *
 * 1. National Weather Service (NWS) active alerts
 *    https://api.weather.gov/alerts/active
 *    - No API key. User-Agent header required (NWS rejects anonymous UAs).
 *    - Published rate guidance: no hard limit but "reasonable and respectful".
 *
 * 2. NCEI Climate Data Online (CDO)
 *    https://www.ncei.noaa.gov/cdo-web/api/v2
 *    - Free token required (NOAA_NCEI_TOKEN) — sent as `token` header.
 *    - Rate limits: 5 requests/second AND 10,000 requests/day per token.
 *
 * INTERFACE-FIT NOTE: NWS active-alerts is a snapshot, not a time series.
 * fetchSeries returns a single IndicatorPoint with observedAt = fetchedAt and
 * value = count of matching alerts. Callers should treat this sourceId as a
 * "current state" signal, not a historical series. For true history, NCEI
 * series are used (token required).
 *
 * sourceId scheme:
 *   NWS:ALERTS:ACTIVE:ALL                    — total US active alerts
 *   NWS:ALERTS:ACTIVE:{event}                — alerts filtered by event name
 *     e.g., NWS:ALERTS:ACTIVE:Hurricane Warning
 *   NCEI:{datasetId}:{stationId}:{datatype}  — NCEI daily series
 *     e.g., NCEI:GHCND:USW00023174:TMAX       (LAX, daily max temp)
 */
const NWS_BASE_URL = "https://api.weather.gov";
const NCEI_BASE_URL = "https://www.ncei.noaa.gov/cdo-web/api/v2";
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 20_000;
const NCEI_PAGE_LIMIT = 1_000;
const NCEI_MAX_PAGES = 5;

const nwsAlertSchema = z.object({
  properties: z.object({
    event: z.string().optional(),
    severity: z.string().optional(),
    onset: z.string().nullable().optional(),
  }),
});

const nwsResponseSchema = z.object({
  features: z.array(nwsAlertSchema),
});

const nceiResultSchema = z.object({
  date: z.string(),
  value: z.number(),
  datatype: z.string().optional(),
});

const nceiResponseSchema = z.object({
  metadata: z
    .object({
      resultset: z
        .object({
          offset: z.number().optional(),
          count: z.number().optional(),
          limit: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  results: z.array(nceiResultSchema).optional(),
});

export interface NoaaAdapterOptions {
  fetchImpl?: typeof fetch;
  nceiToken?: string;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class NoaaAdapter implements DataSourceAdapter {
  readonly source = "noaa" as const;

  private readonly fetchImpl: typeof fetch;
  private readonly nceiToken: string | null;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: NoaaAdapterOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.nceiToken = options.nceiToken ?? process.env.NOAA_NCEI_TOKEN ?? null;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async fetchSeries(
    sourceId: string,
    options: FetchSeriesOptions = {},
  ): Promise<IndicatorFetch> {
    if (sourceId.startsWith("NWS:ALERTS:ACTIVE")) {
      return this.fetchNwsActiveAlerts(sourceId, options.signal);
    }
    if (sourceId.startsWith("NCEI:")) {
      return this.fetchNcei(sourceId, options);
    }
    throw new DataSourceError(
      `Unsupported NOAA sourceId '${sourceId}'. Expected 'NWS:ALERTS:ACTIVE:{event|ALL}' or 'NCEI:{datasetId}:{stationId}:{datatype}'`,
      "noaa",
    );
  }

  private async fetchNwsActiveAlerts(
    sourceId: string,
    signal?: AbortSignal,
  ): Promise<IndicatorFetch> {
    const parts = sourceId.split(":");
    const eventFilter = parts.slice(3).join(":"); // may be "ALL" or a named event
    const params = new URLSearchParams();
    if (eventFilter && eventFilter !== "ALL") {
      params.set("event", eventFilter);
    }
    const qs = params.toString();
    const url = `${NWS_BASE_URL}/alerts/active${qs ? `?${qs}` : ""}`;

    const payload = await this.fetchJsonWithRetry(url, signal, {
      "User-Agent": USER_AGENT,
      Accept: "application/geo+json",
    });
    const parsed = nwsResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new DataSourceError(
        `NWS returned unexpected payload shape for '${sourceId}'`,
        "noaa",
        parsed.error,
      );
    }

    const fetchedAt = new Date();
    const point: IndicatorPoint = {
      observedAt: fetchedAt,
      value: parsed.data.features.length,
    };

    return {
      source: this.source,
      sourceId,
      points: [point],
      fetchedAt,
    };
  }

  private async fetchNcei(
    sourceId: string,
    options: FetchSeriesOptions,
  ): Promise<IndicatorFetch> {
    if (!this.nceiToken) {
      throw new DataSourceError(
        "NOAA_NCEI_TOKEN is not set — cannot fetch NCEI series. Get a free token at https://www.ncei.noaa.gov/cdo-web/token",
        "noaa",
      );
    }
    const parts = sourceId.split(":");
    if (parts.length < 4) {
      throw new DataSourceError(
        `Invalid NCEI sourceId '${sourceId}'. Expected 'NCEI:{datasetId}:{stationId}:{datatype}'`,
        "noaa",
      );
    }
    const [, datasetId, stationId, datatype] = parts;
    const since = options.since ?? oneYearAgoUtc();
    const endDate = new Date();

    const points: IndicatorPoint[] = [];
    for (let page = 0; page < NCEI_MAX_PAGES; page++) {
      const params = new URLSearchParams({
        datasetid: datasetId,
        stationid: stationId,
        datatypeid: datatype,
        startdate: formatIsoDate(since),
        enddate: formatIsoDate(endDate),
        limit: String(NCEI_PAGE_LIMIT),
        offset: String(page * NCEI_PAGE_LIMIT + 1),
        units: "standard",
      });
      const url = `${NCEI_BASE_URL}/data?${params.toString()}`;
      const payload = await this.fetchJsonWithRetry(url, options.signal, {
        "User-Agent": USER_AGENT,
        token: this.nceiToken,
        Accept: "application/json",
      });
      const parsed = nceiResponseSchema.safeParse(payload);
      if (!parsed.success) {
        throw new DataSourceError(
          `NCEI returned unexpected payload shape for '${sourceId}'`,
          "noaa",
          parsed.error,
        );
      }
      const results = parsed.data.results ?? [];
      for (const row of results) {
        const observedAt = parseIsoDate(row.date);
        if (!observedAt) continue;
        if (!Number.isFinite(row.value)) continue;
        points.push({ observedAt, value: row.value });
      }
      if (results.length < NCEI_PAGE_LIMIT) break;
    }

    points.sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime());

    return {
      source: this.source,
      sourceId,
      points,
      fetchedAt: new Date(),
    };
  }

  private async fetchJsonWithRetry(
    url: string,
    externalSignal: AbortSignal | undefined,
    headers: Record<string, string>,
  ): Promise<unknown> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(
        () => timeoutController.abort(),
        this.timeoutMs,
      );
      const signal = externalSignal
        ? anySignal([externalSignal, timeoutController.signal])
        : timeoutController.signal;

      try {
        const response = await this.fetchImpl(url, { signal, headers });

        if (response.ok) {
          return await response.json();
        }

        if (response.status !== 429 && response.status < 500) {
          const body = await safeReadText(response);
          throw new DataSourceError(
            `NOAA request failed: ${response.status} ${response.statusText} — ${body}`,
            "noaa",
          );
        }

        lastError = new DataSourceError(
          `NOAA request failed: ${response.status} ${response.statusText}`,
          "noaa",
        );
      } catch (err) {
        if (err instanceof DataSourceError && !isRetryableError(err)) {
          throw err;
        }
        lastError = err;
      } finally {
        clearTimeout(timeoutId);
      }

      if (attempt < this.maxRetries) {
        await sleep(this.backoffMs(attempt));
      }
    }

    throw new DataSourceError(
      `NOAA request exhausted ${this.maxRetries + 1} attempts`,
      "noaa",
      lastError,
    );
  }

  private backoffMs(attempt: number): number {
    const jitter = Math.random() * this.baseBackoffMs;
    return this.baseBackoffMs * 2 ** attempt + jitter;
  }
}

function oneYearAgoUtc(): Date {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  return d;
}

function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "<unreadable body>";
  }
}

function isRetryableError(err: DataSourceError): boolean {
  return /429|5\d\d/.test(err.message);
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener(
      "abort",
      () => controller.abort(signal.reason),
      { once: true },
    );
  }
  return controller.signal;
}
