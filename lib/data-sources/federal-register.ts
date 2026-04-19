import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

/**
 * Federal Register API (https://www.federalregister.gov/developers/api/v1).
 *
 * No API key required. Published rate guidance is "reasonable use" — we keep
 * a 20s timeout and exponential backoff. Pagination uses per_page up to 1000.
 *
 * INTERFACE-FIT NOTE: Federal Register returns discrete documents, not a time
 * series. We bucket documents by ISO week (Monday UTC start) and emit one
 * IndicatorPoint per week with value = count of matching docs published that
 * week. This preserves the DataSourceAdapter shape without extending it.
 *
 * sourceId is the search term queried via `conditions[term]`:
 *   "tariff"        — tariff notices
 *   "import duty"   — duty-related actions
 *   "trade"         — broader trade actions
 * New search terms can be added to the registry without code changes here.
 */
const FEDERAL_REGISTER_BASE_URL = "https://www.federalregister.gov/api/v1";
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 20_000;
const PER_PAGE = 1_000;
const MAX_PAGES = 5;

const documentSchema = z.object({
  publication_date: z.string(),
});

const responseSchema = z.object({
  count: z.number(),
  total_pages: z.number().optional(),
  next_page_url: z.string().nullable().optional(),
  results: z.array(documentSchema),
});

export interface FederalRegisterAdapterOptions {
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
  maxPages?: number;
}

export class FederalRegisterAdapter implements DataSourceAdapter {
  readonly source = "federal_register" as const;

  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;
  private readonly maxPages: number;

  constructor(options: FederalRegisterAdapterOptions = {}) {
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
    const dates: string[] = [];
    let url: string | null = this.buildUrl(sourceId, options.since);
    let pagesFetched = 0;

    while (url && pagesFetched < this.maxPages) {
      const payload = await this.fetchJsonWithRetry(url, options.signal);
      const parsed = responseSchema.safeParse(payload);
      if (!parsed.success) {
        throw new DataSourceError(
          `Federal Register returned unexpected payload shape for term '${sourceId}'`,
          "federal_register",
          parsed.error,
        );
      }
      for (const doc of parsed.data.results) {
        dates.push(doc.publication_date);
      }
      url = parsed.data.next_page_url ?? null;
      pagesFetched += 1;
    }

    const points = bucketByWeek(dates);

    return {
      source: this.source,
      sourceId,
      points,
      fetchedAt: new Date(),
    };
  }

  private buildUrl(sourceId: string, since?: Date): string {
    const params = new URLSearchParams();
    params.set("conditions[term]", sourceId);
    params.set("per_page", String(PER_PAGE));
    params.set("order", "oldest");
    params.set("fields[]", "publication_date");
    if (since) {
      params.set("conditions[publication_date][gte]", formatIsoDate(since));
    }
    return `${FEDERAL_REGISTER_BASE_URL}/documents.json?${params.toString()}`;
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
            `Federal Register request failed: ${response.status} ${response.statusText} — ${body}`,
            "federal_register",
          );
        }

        lastError = new DataSourceError(
          `Federal Register request failed: ${response.status} ${response.statusText}`,
          "federal_register",
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
      `Federal Register request exhausted ${this.maxRetries + 1} attempts`,
      "federal_register",
      lastError,
    );
  }

  private backoffMs(attempt: number): number {
    const jitter = Math.random() * this.baseBackoffMs;
    return this.baseBackoffMs * 2 ** attempt + jitter;
  }
}

/**
 * Bucket publication dates into ISO weeks starting Monday UTC.
 * Returns one IndicatorPoint per week with value = document count.
 */
function bucketByWeek(dates: string[]): IndicatorPoint[] {
  const buckets = new Map<number, number>();
  for (const iso of dates) {
    const date = parseIsoDate(iso);
    if (!date) continue;
    const weekStart = startOfIsoWeek(date);
    const key = weekStart.getTime();
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([ts, count]) => ({ observedAt: new Date(ts), value: count }));
}

function startOfIsoWeek(date: Date): Date {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // getUTCDay: Sunday=0, Monday=1, ..., Saturday=6. ISO weeks start Monday.
  const day = utc.getUTCDay();
  const offset = (day + 6) % 7; // 0 if Monday, 6 if Sunday
  utc.setUTCDate(utc.getUTCDate() - offset);
  return utc;
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
