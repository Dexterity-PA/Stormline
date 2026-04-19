import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

// EIA Open Data API v2 — backward-compatible seriesid endpoint.
// Series IDs use dot-notation, e.g. "PET.EMD_EPD2D_PTE_NUS_DPG.W".
const EIA_BASE_URL = "https://api.eia.gov/v2/seriesid";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 15_000;
// Sufficient to retrieve full history in one request for all current series.
const DEFAULT_PAGE_LENGTH = 5_000;

// EIA v2 data points vary by series: petroleum uses `value`, electricity uses `price`.
// Accept both; ignore all other series-specific fields.
const eiaDataPointSchema = z
  .object({
    period: z.string(),
    value: z.number().nullable().optional(),
    price: z.number().nullable().optional(),
  })
  .passthrough();

const eiaResponseSchema = z.object({
  response: z.object({
    data: z.array(eiaDataPointSchema),
  }),
});

export interface EiaAdapterOptions {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class EiaAdapter implements DataSourceAdapter {
  readonly source = "eia" as const;

  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: EiaAdapterOptions = {}) {
    const apiKey = options.apiKey ?? process.env.EIA_API_KEY;
    if (!apiKey) {
      throw new DataSourceError(
        "EIA_API_KEY is not set — cannot construct EiaAdapter",
        "eia",
      );
    }
    this.apiKey = apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async fetchSeries(
    sourceId: string,
    options: FetchSeriesOptions = {},
  ): Promise<IndicatorFetch> {
    const url = this.buildUrl(sourceId, options.since);
    const payload = await this.fetchJsonWithRetry(url, options.signal);

    const parsed = eiaResponseSchema.safeParse(payload);
    if (!parsed.success) {
      const apiError = extractEiaError(payload);
      throw new DataSourceError(
        `EIA returned unexpected payload for series ${sourceId}${apiError ? `: ${apiError}` : ""}`,
        "eia",
        parsed.error,
      );
    }

    const points = parsed.data.response.data.reduce<IndicatorPoint[]>(
      (acc, point) => {
        const value = point.value ?? point.price ?? null;
        if (value === null || !Number.isFinite(value)) return acc;
        const observedAt = parseEiaDate(point.period);
        if (!observedAt) return acc;
        acc.push({ observedAt, value });
        return acc;
      },
      [],
    );

    // EIA v2 returns newest-first; reverse to chronological order.
    points.reverse();

    return {
      source: this.source,
      sourceId,
      points,
      fetchedAt: new Date(),
    };
  }

  private buildUrl(sourceId: string, since?: Date): string {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      offset: "0",
      length: String(DEFAULT_PAGE_LENGTH),
    });
    if (since) {
      params.set("start", formatEiaDate(sourceId, since));
    }
    return `${EIA_BASE_URL}/${encodeURIComponent(sourceId)}?${params.toString()}`;
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
        const response = await this.fetchImpl(url, { signal });

        if (response.ok) {
          return await response.json();
        }

        if (response.status !== 429 && response.status < 500) {
          const body = await safeReadText(response);
          throw new DataSourceError(
            `EIA request failed: ${response.status} ${response.statusText} — ${body}`,
            "eia",
          );
        }

        lastError = new DataSourceError(
          `EIA request failed: ${response.status} ${response.statusText}`,
          "eia",
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
      `EIA request exhausted ${this.maxRetries + 1} attempts`,
      "eia",
      lastError,
    );
  }
}

// EIA v2 period formats: "YYYY-MM-DD" (daily/weekly), "YYYY-MM" (monthly).
function parseEiaDate(str: string): Date | null {
  // YYYY-MM-DD
  const daily = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (daily) {
    return utcDate(+daily[1], +daily[2], +daily[3]);
  }
  // YYYY-MM
  const monthly = /^(\d{4})-(\d{2})$/.exec(str);
  if (monthly) {
    return utcDate(+monthly[1], +monthly[2], 1);
  }
  return null;
}

// EIA v2 `start` param: "YYYY-MM" for monthly series, "YYYY-MM-DD" for weekly/daily.
function formatEiaDate(sourceId: string, date: Date): string {
  const freq = sourceId.split(".").pop()?.toUpperCase() ?? "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  if (freq === "M" || freq === "Q" || freq === "A") {
    return `${y}-${m}`;
  }
  return `${y}-${m}-${d}`;
}

function utcDate(y: number, m: number, d: number): Date | null {
  const date = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractEiaError(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const p = payload as Record<string, unknown>;
  if (typeof p["error"] === "string") return p["error"];
  const response = p["response"];
  if (typeof response === "object" && response !== null) {
    const r = response as Record<string, unknown>;
    if (typeof r["error"] === "string") return r["error"];
  }
  return null;
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
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
    });
  }
  return controller.signal;
}
