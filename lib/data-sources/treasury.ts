import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

/**
 * Treasury FiscalData API (https://fiscaldata.treasury.gov/services/api/fiscal_service).
 *
 * No API key required. Rate limits are not formally published; Treasury
 * guidance is "reasonable use" — we keep a 20s timeout and exponential
 * backoff to avoid hammering the edge in the rare cases it rate-limits.
 *
 * Stormline sourceId → Treasury series mapping:
 *   debt_to_penny            → /v2/accounting/od/debt_to_penny.tot_pub_debt_out_amt
 *   tga_operating_balance    → /v1/accounting/dts/dts_table_1.close_today_bal
 *                              (filter: account_type eq "Treasury General Account (TGA)")
 */
const TREASURY_BASE_URL =
  "https://api.fiscaldata.treasury.gov/services/api/fiscal_service";
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 20_000;
const PAGE_SIZE = 1_000;

interface TreasurySeriesSpec {
  path: string;
  dateField: string;
  valueField: string;
  extraFilter?: string;
}

const TREASURY_SERIES: Record<string, TreasurySeriesSpec> = {
  debt_to_penny: {
    path: "/v2/accounting/od/debt_to_penny",
    dateField: "record_date",
    valueField: "tot_pub_debt_out_amt",
  },
  tga_operating_balance: {
    path: "/v1/accounting/dts/dts_table_1",
    dateField: "record_date",
    valueField: "close_today_bal",
    extraFilter: "account_type:eq:Treasury General Account (TGA)",
  },
};

const responseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
  meta: z
    .object({
      "total-count": z.number().optional(),
      "total-pages": z.number().optional(),
    })
    .optional(),
});

export interface TreasuryAdapterOptions {
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class TreasuryAdapter implements DataSourceAdapter {
  readonly source = "treasury" as const;

  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: TreasuryAdapterOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async fetchSeries(
    sourceId: string,
    options: FetchSeriesOptions = {},
  ): Promise<IndicatorFetch> {
    const spec = TREASURY_SERIES[sourceId];
    if (!spec) {
      throw new DataSourceError(
        `Unknown Treasury series '${sourceId}'. Known: ${Object.keys(TREASURY_SERIES).join(", ")}`,
        "treasury",
      );
    }

    const url = this.buildUrl(spec, options.since);
    const payload = await this.fetchJsonWithRetry(url, options.signal);

    const parsed = responseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new DataSourceError(
        `Treasury returned unexpected payload shape for '${sourceId}'`,
        "treasury",
        parsed.error,
      );
    }

    const points = parsed.data.data.reduce<IndicatorPoint[]>((acc, row) => {
      const rawDate = row[spec.dateField];
      const rawValue = row[spec.valueField];
      if (typeof rawDate !== "string" || typeof rawValue !== "string") {
        return acc;
      }
      if (rawValue === "" || rawValue === "null") return acc;
      const value = Number(rawValue);
      if (!Number.isFinite(value)) return acc;
      const observedAt = parseIsoDate(rawDate);
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

  private buildUrl(spec: TreasurySeriesSpec, since?: Date): string {
    const params = new URLSearchParams({
      fields: `${spec.dateField},${spec.valueField}`,
      sort: `-${spec.dateField}`,
      "page[size]": String(PAGE_SIZE),
    });
    const filterParts: string[] = [];
    if (since) {
      filterParts.push(`${spec.dateField}:gte:${formatIsoDate(since)}`);
    }
    if (spec.extraFilter) {
      filterParts.push(spec.extraFilter);
    }
    if (filterParts.length > 0) {
      params.set("filter", filterParts.join(","));
    }
    return `${TREASURY_BASE_URL}${spec.path}?${params.toString()}`;
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
            `Treasury request failed: ${response.status} ${response.statusText} — ${body}`,
            "treasury",
          );
        }

        lastError = new DataSourceError(
          `Treasury request failed: ${response.status} ${response.statusText}`,
          "treasury",
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
      `Treasury request exhausted ${this.maxRetries + 1} attempts`,
      "treasury",
      lastError,
    );
  }

  private backoffMs(attempt: number): number {
    const jitter = Math.random() * this.baseBackoffMs;
    return this.baseBackoffMs * 2 ** attempt + jitter;
  }
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
