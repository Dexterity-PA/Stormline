import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

const NASS_BASE_URL = "https://quickstats.nass.usda.gov/api/api_GET/";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 30_000;
// NASS returns decades of rows by default, which can time out. When no `since`
// is supplied, cap history to this many years back to keep requests bounded.
const DEFAULT_HISTORY_YEARS = 10;

// Maps compact sourceId keys to NASS QuickStats query parameters.
// To add a new series, add an entry here and a registry entry in lib/indicators/registry.ts.
const NASS_SERIES: Readonly<Record<string, Readonly<Record<string, string>>>> =
  {
    EGGS_TABLE_PRICE_MONTHLY: {
      commodity_desc: "EGGS",
      statisticcat_desc: "PRICE RECEIVED",
      unit_desc: "$ / DOZEN",
      freq_desc: "MONTHLY",
      agg_level_desc: "NATIONAL",
    },
    MILK_PRICE_MONTHLY: {
      commodity_desc: "MILK",
      statisticcat_desc: "PRICE RECEIVED",
      unit_desc: "$ / CWT",
      freq_desc: "MONTHLY",
      agg_level_desc: "NATIONAL",
    },
    CORN_PRICE_MONTHLY: {
      commodity_desc: "CORN",
      statisticcat_desc: "PRICE RECEIVED",
      unit_desc: "$ / BU",
      freq_desc: "MONTHLY",
      agg_level_desc: "NATIONAL",
    },
    BROILERS_PRICE_MONTHLY: {
      commodity_desc: "CHICKENS",
      statisticcat_desc: "PRICE RECEIVED",
      unit_desc: "$ / LB",
      freq_desc: "MONTHLY",
      agg_level_desc: "NATIONAL",
    },
    SOYBEANS_PRICE_MONTHLY: {
      commodity_desc: "SOYBEANS",
      statisticcat_desc: "PRICE RECEIVED",
      unit_desc: "$ / BU",
      freq_desc: "MONTHLY",
      agg_level_desc: "NATIONAL",
    },
    WHEAT_PRICE_MONTHLY: {
      commodity_desc: "WHEAT",
      statisticcat_desc: "PRICE RECEIVED",
      unit_desc: "$ / BU",
      freq_desc: "MONTHLY",
      agg_level_desc: "NATIONAL",
    },
  };

const nassDataPointSchema = z.object({
  year: z.string(),
  period_desc: z.string(),
  Value: z.string(),
});

const nassResponseSchema = z.object({
  data: z.array(nassDataPointSchema),
});

const MONTH_OF: Readonly<Record<string, number>> = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
  YEAR: 1,
};

export interface UsdaAdapterOptions {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class UsdaAdapter implements DataSourceAdapter {
  readonly source = "usda" as const;

  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: UsdaAdapterOptions = {}) {
    const apiKey = options.apiKey ?? process.env.USDA_NASS_API_KEY;
    if (!apiKey) {
      throw new DataSourceError(
        "USDA_NASS_API_KEY is not set — cannot construct UsdaAdapter. " +
          "Register for a free key at https://quickstats.nass.usda.gov/api",
        "usda",
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
    const params = NASS_SERIES[sourceId];
    if (!params) {
      throw new DataSourceError(
        `Unknown USDA NASS sourceId "${sourceId}". Add it to NASS_SERIES in usda.ts`,
        "usda",
      );
    }

    const since =
      options.since ?? yearsAgo(DEFAULT_HISTORY_YEARS);
    const url = this.buildUrl(params, since);
    const payload = await this.fetchJsonWithRetry(url, options.signal);

    const parsed = nassResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new DataSourceError(
        `USDA NASS returned unexpected payload for series ${sourceId}`,
        "usda",
        parsed.error,
      );
    }

    const points = parsed.data.data.reduce<IndicatorPoint[]>((acc, row) => {
      const value = parseNassValue(row.Value);
      if (value === null) return acc;
      const observedAt = parseNassDate(row.year, row.period_desc);
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

  private buildUrl(
    params: Readonly<Record<string, string>>,
    since: Date,
  ): string {
    const qs = new URLSearchParams({ key: this.apiKey, format: "JSON" });
    for (const [k, v] of Object.entries(params)) {
      qs.set(k, v);
    }
    qs.set("year__GE", String(since.getUTCFullYear()));
    return `${NASS_BASE_URL}?${qs.toString()}`;
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
            `USDA NASS request failed: ${response.status} ${response.statusText} — ${body}`,
            "usda",
          );
        }

        lastError = new DataSourceError(
          `USDA NASS request failed: ${response.status} ${response.statusText}`,
          "usda",
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
      `USDA NASS request exhausted ${this.maxRetries + 1} attempts`,
      "usda",
      lastError,
    );
  }
}

// NASS Value field may include "(D)" (withheld), "(NA)", commas in numbers.
function parseNassValue(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned.startsWith("(")) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseNassDate(year: string, periodDesc: string): Date | null {
  const y = Number(year);
  if (!Number.isFinite(y) || y < 1900) return null;
  const m = MONTH_OF[periodDesc.toUpperCase()] ?? null;
  if (m === null) return null;
  const date = new Date(Date.UTC(y, m - 1, 1));
  return Number.isNaN(date.getTime()) ? null : date;
}

function yearsAgo(years: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear() - years,
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
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
