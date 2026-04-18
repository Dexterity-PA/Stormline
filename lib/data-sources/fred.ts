import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

const FRED_BASE_URL = "https://api.stlouisfed.org/fred";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 15_000;

const observationSchema = z.object({
  date: z.string(),
  value: z.string(),
});

const observationsResponseSchema = z.object({
  observations: z.array(observationSchema),
});

export interface FredAdapterOptions {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class FredAdapter implements DataSourceAdapter {
  readonly source = "fred" as const;

  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: FredAdapterOptions = {}) {
    const apiKey = options.apiKey ?? process.env.FRED_API_KEY;
    if (!apiKey) {
      throw new DataSourceError(
        "FRED_API_KEY is not set — cannot construct FredAdapter",
        "fred",
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

    const parsed = observationsResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new DataSourceError(
        `FRED returned unexpected payload shape for series ${sourceId}`,
        "fred",
        parsed.error,
      );
    }

    const points = parsed.data.observations.reduce<IndicatorPoint[]>(
      (acc, obs) => {
        // FRED represents missing observations with ".".
        if (obs.value === "." || obs.value === "") return acc;
        const value = Number(obs.value);
        if (!Number.isFinite(value)) return acc;
        const observedAt = parseFredDate(obs.date);
        if (!observedAt) return acc;
        acc.push({ observedAt, value });
        return acc;
      },
      [],
    );

    return {
      source: this.source,
      sourceId,
      points,
      fetchedAt: new Date(),
    };
  }

  private buildUrl(sourceId: string, since?: Date): string {
    const params = new URLSearchParams({
      series_id: sourceId,
      api_key: this.apiKey,
      file_type: "json",
    });
    if (since) {
      params.set("observation_start", formatFredDate(since));
    }
    return `${FRED_BASE_URL}/series/observations?${params.toString()}`;
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

        // 429 and 5xx are retryable; 4xx other than 429 are terminal.
        if (response.status !== 429 && response.status < 500) {
          const body = await safeReadText(response);
          throw new DataSourceError(
            `FRED request failed: ${response.status} ${response.statusText} — ${body}`,
            "fred",
          );
        }

        lastError = new DataSourceError(
          `FRED request failed: ${response.status} ${response.statusText}`,
          "fred",
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
      `FRED request exhausted ${this.maxRetries + 1} attempts`,
      "fred",
      lastError,
    );
  }

  private backoffMs(attempt: number): number {
    const jitter = Math.random() * this.baseBackoffMs;
    return this.baseBackoffMs * 2 ** attempt + jitter;
  }
}

function parseFredDate(iso: string): Date | null {
  // FRED dates are YYYY-MM-DD. Interpret as UTC midnight.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatFredDate(date: Date): string {
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
  // Retryable means we didn't surface a terminal 4xx from upstream.
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
