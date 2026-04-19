import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

/**
 * OpenFEMA API (https://www.fema.gov/api/open).
 *
 * No API key required. Per-request $top capped at 1000; FEMA does not
 * publish a hard rate limit but recommends paginating responsibly. We
 * page up to MAX_PAGES and apply exponential backoff on 429/5xx.
 *
 * Adapter returns monthly counts of disaster declarations. sourceId scheme:
 *   DECLARATIONS:MONTHLY:US       — all states
 *   DECLARATIONS:MONTHLY:{STATE}  — per state (e.g., DECLARATIONS:MONTHLY:FL)
 *   DECLARATIONS:MONTHLY:US:{INCIDENT_TYPE} — filtered by incident type
 *     e.g., DECLARATIONS:MONTHLY:US:Hurricane
 */
const FEMA_BASE_URL =
  "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries";
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 20_000;
const PAGE_SIZE = 1_000;
const MAX_PAGES = 10;

const recordSchema = z.object({
  declarationDate: z.string(),
  state: z.string().optional(),
  incidentType: z.string().optional(),
});

const responseSchema = z.object({
  DisasterDeclarationsSummaries: z.array(recordSchema),
  metadata: z
    .object({
      count: z.number().optional(),
      skip: z.number().optional(),
      top: z.number().optional(),
    })
    .optional(),
});

interface ParsedSourceId {
  state: string | null;
  incidentType: string | null;
}

function parseSourceId(sourceId: string): ParsedSourceId {
  const parts = sourceId.split(":");
  if (parts.length < 3 || parts[0] !== "DECLARATIONS" || parts[1] !== "MONTHLY") {
    throw new DataSourceError(
      `Unsupported FEMA sourceId '${sourceId}'. Expected 'DECLARATIONS:MONTHLY:{US|STATE}[:INCIDENT_TYPE]'`,
      "fema",
    );
  }
  const stateToken = parts[2];
  const state = stateToken === "US" ? null : stateToken;
  const incidentType = parts[3] ?? null;
  return { state, incidentType };
}

export interface FemaAdapterOptions {
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
  maxPages?: number;
}

export class FemaAdapter implements DataSourceAdapter {
  readonly source = "fema" as const;

  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;
  private readonly maxPages: number;

  constructor(options: FemaAdapterOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxPages = options.maxPages ?? MAX_PAGES;
  }

  async fetchSeries(
    sourceId: string,
    options: FetchSeriesOptions = {},
  ): Promise<IndicatorFetch> {
    const { state, incidentType } = parseSourceId(sourceId);
    const dates: string[] = [];

    for (let page = 0; page < this.maxPages; page++) {
      const url = this.buildUrl(state, incidentType, options.since, page);
      const payload = await this.fetchJsonWithRetry(url, options.signal);
      const parsed = responseSchema.safeParse(payload);
      if (!parsed.success) {
        throw new DataSourceError(
          `FEMA returned unexpected payload shape for '${sourceId}'`,
          "fema",
          parsed.error,
        );
      }
      const records = parsed.data.DisasterDeclarationsSummaries;
      for (const rec of records) dates.push(rec.declarationDate);
      if (records.length < PAGE_SIZE) break;
    }

    const points = bucketByMonth(dates);

    return {
      source: this.source,
      sourceId,
      points,
      fetchedAt: new Date(),
    };
  }

  private buildUrl(
    state: string | null,
    incidentType: string | null,
    since: Date | undefined,
    page: number,
  ): string {
    const filterParts: string[] = [];
    if (state) filterParts.push(`state eq '${escapeOdataValue(state)}'`);
    if (incidentType)
      filterParts.push(
        `incidentType eq '${escapeOdataValue(incidentType)}'`,
      );
    if (since) {
      filterParts.push(`declarationDate ge '${since.toISOString()}'`);
    }
    const params = new URLSearchParams();
    params.set("$select", "declarationDate,state,incidentType");
    params.set("$orderby", "declarationDate");
    params.set("$top", String(PAGE_SIZE));
    params.set("$skip", String(page * PAGE_SIZE));
    if (filterParts.length > 0) {
      params.set("$filter", filterParts.join(" and "));
    }
    return `${FEMA_BASE_URL}?${params.toString()}`;
  }

  private async fetchJsonWithRetry(
    url: string,
    externalSignal?: AbortSignal,
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
        const response = await this.fetchImpl(url, {
          signal,
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        });

        if (response.ok) {
          return await response.json();
        }

        if (response.status !== 429 && response.status < 500) {
          const body = await safeReadText(response);
          throw new DataSourceError(
            `FEMA request failed: ${response.status} ${response.statusText} — ${body}`,
            "fema",
          );
        }

        lastError = new DataSourceError(
          `FEMA request failed: ${response.status} ${response.statusText}`,
          "fema",
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
      `FEMA request exhausted ${this.maxRetries + 1} attempts`,
      "fema",
      lastError,
    );
  }

  private backoffMs(attempt: number): number {
    const jitter = Math.random() * this.baseBackoffMs;
    return this.baseBackoffMs * 2 ** attempt + jitter;
  }
}

function escapeOdataValue(value: string): string {
  // OData single-quote escaping: double the quote.
  return value.replace(/'/g, "''");
}

function bucketByMonth(dates: string[]): IndicatorPoint[] {
  const buckets = new Map<number, number>();
  for (const iso of dates) {
    const date = parseIsoDate(iso);
    if (!date) continue;
    const monthStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    );
    const key = monthStart.getTime();
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([ts, count]) => ({ observedAt: new Date(ts), value: count }));
}

function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
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
