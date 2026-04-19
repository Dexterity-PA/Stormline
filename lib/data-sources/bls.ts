import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

// BLS Public Data API v2 — no registration key needed for public series
// (500 req/day unauthenticated; set BLS_API_KEY for higher limits).
const BLS_BASE_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 15_000;
// Years of history to fetch when no `since` is given.
const DEFAULT_HISTORY_YEARS = 10;

const blsDataPointSchema = z.object({
  year: z.string(),
  period: z.string(),
  value: z.string(),
  footnotes: z.array(z.unknown()).optional(),
});

const blsSeriesSchema = z.object({
  seriesID: z.string(),
  data: z.array(blsDataPointSchema),
});

const blsResponseSchema = z.object({
  status: z.string(),
  message: z.array(z.string()).optional(),
  Results: z.object({
    series: z.array(blsSeriesSchema),
  }),
});

export interface BlsAdapterOptions {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class BlsAdapter implements DataSourceAdapter {
  readonly source = "bls" as const;

  private readonly apiKey: string | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: BlsAdapterOptions = {}) {
    // BLS_API_KEY is optional — public series work without it.
    this.apiKey = options.apiKey ?? process.env.BLS_API_KEY;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async fetchSeries(
    sourceId: string,
    options: FetchSeriesOptions = {},
  ): Promise<IndicatorFetch> {
    const currentYear = new Date().getUTCFullYear();
    const startYear = options.since
      ? options.since.getUTCFullYear()
      : currentYear - DEFAULT_HISTORY_YEARS;

    const body = this.buildBody(sourceId, startYear, currentYear);
    const payload = await this.fetchJsonWithRetry(body, options.signal);

    const parsed = blsResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new DataSourceError(
        `BLS returned unexpected payload for series ${sourceId}`,
        "bls",
        parsed.error,
      );
    }

    if (parsed.data.status !== "REQUEST_SUCCEEDED") {
      const messages = parsed.data.message?.join("; ") ?? "";
      // BLS surfaces rate-limit in the message field at HTTP 200.
      const isRateLimit = /rate.limit|quota|exceeded/i.test(messages);
      throw new DataSourceError(
        `BLS request failed (${parsed.data.status}): ${messages}`,
        "bls",
        isRateLimit ? "rate-limit" : undefined,
      );
    }

    const series = parsed.data.Results.series[0];
    if (!series) {
      throw new DataSourceError(
        `BLS returned no series for sourceId ${sourceId}`,
        "bls",
      );
    }

    const points = series.data.reduce<IndicatorPoint[]>((acc, row) => {
      const value = parseBlsValue(row.value);
      if (value === null) return acc;
      const observedAt = parseBlsPeriod(row.year, row.period);
      if (!observedAt) return acc;
      acc.push({ observedAt, value });
      return acc;
    }, []);

    points.sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime());

    return {
      source: this.source,
      sourceId,
      points,
      fetchedAt: new Date(),
    };
  }

  private buildBody(
    sourceId: string,
    startYear: number,
    endYear: number,
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {
      seriesid: [sourceId],
      startyear: String(startYear),
      endyear: String(endYear),
    };
    if (this.apiKey) {
      body["registrationkey"] = this.apiKey;
    }
    return body;
  }

  private async fetchJsonWithRetry(
    body: Record<string, unknown>,
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
        const response = await this.fetchImpl(BLS_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal,
        });

        if (response.ok) {
          const json = await response.json();
          // BLS API may return HTTP 200 with a rate-limit status in the body;
          // let the caller check json.status.
          return json;
        }

        if (response.status !== 429 && response.status < 500) {
          const text = await safeReadText(response);
          throw new DataSourceError(
            `BLS request failed: ${response.status} ${response.statusText} — ${text}`,
            "bls",
          );
        }

        lastError = new DataSourceError(
          `BLS request failed: ${response.status} ${response.statusText}`,
          "bls",
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
        await sleep(backoffMs(this.baseBackoffMs, attempt));
      }
    }

    throw new DataSourceError(
      `BLS request exhausted ${this.maxRetries + 1} attempts`,
      "bls",
      lastError,
    );
  }
}

// BLS period formats:
//   M01–M12  — monthly
//   Q01–Q04  — quarterly (use first month of the quarter)
//   A01      — annual
//   S01–S02  — semi-annual (Jan, Jul)
function parseBlsPeriod(year: string, period: string): Date | null {
  const y = Number(year);
  if (!Number.isFinite(y)) return null;

  if (period.startsWith("M")) {
    const m = Number(period.slice(1));
    if (m < 1 || m > 12) return null;
    return utcDate(y, m, 1);
  }
  if (period.startsWith("Q")) {
    const q = Number(period.slice(1));
    if (q < 1 || q > 4) return null;
    return utcDate(y, (q - 1) * 3 + 1, 1);
  }
  if (period.startsWith("A")) {
    return utcDate(y, 1, 1);
  }
  if (period.startsWith("S")) {
    const s = Number(period.slice(1));
    return utcDate(y, s === 1 ? 1 : 7, 1);
  }
  return null;
}

function parseBlsValue(raw: string): number | null {
  if (raw === "-" || raw === "" || raw === "N/A") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function utcDate(y: number, m: number, d: number): Date | null {
  const date = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(base: number, attempt: number): number {
  return base * 2 ** attempt + Math.random() * base;
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "<unreadable body>";
  }
}

function isRetryableError(err: DataSourceError): boolean {
  return /429|5\d\d|rate.limit/i.test(err.message);
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
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
    });
  }
  return controller.signal;
}
