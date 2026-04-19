import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

/**
 * Census Bureau International Trade API
 * https://api.census.gov/data/timeseries/intltrade
 *
 * Free API key strongly recommended (CENSUS_API_KEY). Anonymous usage is
 * capped at 500 queries/day per IP; keyed usage is effectively uncapped for
 * normal usage. Sign up: https://api.census.gov/data/key_signup.html
 *
 * MVP sourceId scheme:
 *   IMPORTS:HS2:{code}   — monthly general imports value (USD), HS 2-digit
 *   EXPORTS:HS2:{code}   — monthly general exports value (USD), HS 2-digit
 * Example codes: 02 (meat), 10 (cereals), 27 (petroleum), 72 (iron/steel),
 *                87 (vehicles).
 */
const CENSUS_IMPORTS_URL =
  "https://api.census.gov/data/timeseries/intltrade/imports/hs";
const CENSUS_EXPORTS_URL =
  "https://api.census.gov/data/timeseries/intltrade/exports/hs";
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 25_000;

const responseSchema = z.array(z.array(z.string()));

interface ParsedSourceId {
  direction: "IMPORTS" | "EXPORTS";
  level: "HS2";
  code: string;
}

function parseSourceId(sourceId: string): ParsedSourceId {
  const parts = sourceId.split(":");
  if (parts.length !== 3) {
    throw new DataSourceError(
      `Invalid Census Trade sourceId '${sourceId}'. Expected '{IMPORTS|EXPORTS}:HS2:{code}'`,
      "census",
    );
  }
  const [direction, level, code] = parts;
  if (direction !== "IMPORTS" && direction !== "EXPORTS") {
    throw new DataSourceError(
      `Invalid direction '${direction}' in sourceId '${sourceId}'`,
      "census",
    );
  }
  if (level !== "HS2") {
    throw new DataSourceError(
      `Unsupported commodity level '${level}' in sourceId '${sourceId}'. MVP supports HS2 only.`,
      "census",
    );
  }
  if (!/^\d{2}$/.test(code)) {
    throw new DataSourceError(
      `Invalid HS2 code '${code}' in sourceId '${sourceId}'. Expected 2 digits.`,
      "census",
    );
  }
  return { direction, level, code };
}

export interface CensusTradeAdapterOptions {
  apiKey?: string | null;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class CensusTradeAdapter implements DataSourceAdapter {
  readonly source = "census" as const;

  private readonly apiKey: string | null;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: CensusTradeAdapterOptions = {}) {
    const apiKey =
      options.apiKey === undefined
        ? (process.env.CENSUS_API_KEY ?? null)
        : options.apiKey;
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
    const parsed = parseSourceId(sourceId);
    const url = this.buildUrl(parsed, options.since);
    const payload = await this.fetchJsonWithRetry(url, options.signal);
    const rows = responseSchema.safeParse(payload);
    if (!rows.success || rows.data.length === 0) {
      throw new DataSourceError(
        `Census returned unexpected payload shape for '${sourceId}'`,
        "census",
        rows.success ? undefined : rows.error,
      );
    }
    const header = rows.data[0];
    const valueField = parsed.direction === "IMPORTS" ? "GEN_VAL_MO" : "ALL_VAL_MO";
    const timeIdx = header.indexOf("time");
    const valueIdx = header.indexOf(valueField);
    if (timeIdx < 0 || valueIdx < 0) {
      throw new DataSourceError(
        `Census response missing required columns 'time' and '${valueField}'. Got: ${header.join(",")}`,
        "census",
      );
    }

    const points: IndicatorPoint[] = [];
    for (let r = 1; r < rows.data.length; r++) {
      const row = rows.data[r];
      const rawTime = row[timeIdx];
      const rawValue = row[valueIdx];
      const observedAt = parseCensusMonth(rawTime);
      if (!observedAt) continue;
      if (!rawValue || rawValue === "") continue;
      const value = Number(rawValue);
      if (!Number.isFinite(value)) continue;
      points.push({ observedAt, value });
    }

    points.sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime());

    return {
      source: this.source,
      sourceId,
      points,
      fetchedAt: new Date(),
    };
  }

  private buildUrl(parsed: ParsedSourceId, since?: Date): string {
    const base =
      parsed.direction === "IMPORTS" ? CENSUS_IMPORTS_URL : CENSUS_EXPORTS_URL;
    const commodityField =
      parsed.direction === "IMPORTS" ? "I_COMMODITY" : "E_COMMODITY";
    const valueField =
      parsed.direction === "IMPORTS" ? "GEN_VAL_MO" : "ALL_VAL_MO";
    const fromYear = since
      ? since.getUTCFullYear()
      : new Date().getUTCFullYear() - 3;
    const params = new URLSearchParams();
    params.set("get", `${commodityField},${valueField}`);
    params.set("COMM_LVL", parsed.level);
    params.set(commodityField, parsed.code);
    params.set("time", `from ${fromYear}`);
    if (this.apiKey) params.set("key", this.apiKey);
    return `${base}?${params.toString()}`;
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
            `Census request failed: ${response.status} ${response.statusText} — ${body}`,
            "census",
          );
        }

        lastError = new DataSourceError(
          `Census request failed: ${response.status} ${response.statusText}`,
          "census",
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
      `Census request exhausted ${this.maxRetries + 1} attempts`,
      "census",
      lastError,
    );
  }

  private backoffMs(attempt: number): number {
    const jitter = Math.random() * this.baseBackoffMs;
    return this.baseBackoffMs * 2 ** attempt + jitter;
  }
}

function parseCensusMonth(token: string | undefined): Date | null {
  if (!token) return null;
  // Census returns time as "YYYY-MM".
  const match = /^(\d{4})-(\d{2})$/.exec(token);
  if (!match) return null;
  const [, y, m] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
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
