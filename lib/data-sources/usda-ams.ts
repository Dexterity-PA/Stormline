import { z } from "zod";

import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

/**
 * USDA AMS — Livestock, Poultry, Grain Market News
 * Endpoint: https://mpr.datamart.ams.usda.gov/services/v1.1/reports
 *
 * Distinct from the existing USDA NASS adapter (lib/data-sources/usda.ts):
 *   - NASS   → state/national agricultural statistics (prices received by farmers)
 *   - AMS    → daily livestock/meat/dairy wholesale market news (LMR)
 *
 * No API key required on the MPR datamart. Published rate guidance from AMS
 * is "reasonable use" (no hard cap documented); we keep a 25s timeout and
 * exponential backoff for transient 5xx.
 *
 * AMS returns report-shaped JSON that varies per report slug and section.
 * The adapter uses an internal AMS_SERIES map declaring slug, section,
 * dateField, and valueField for each supported series. Adding a series only
 * requires extending this map — no adapter code changes.
 *
 * sourceId is an internal key from AMS_SERIES (e.g.
 * "NATIONAL_BOXED_BEEF_CHOICE_DAILY"). Underlying AMS slug IDs rarely
 * change but are audited here at authoring time.
 */
const AMS_BASE_URL = "https://mpr.datamart.ams.usda.gov/services/v1.1/reports";
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 25_000;

interface AmsSeriesSpec {
  slug: string;
  section: string;
  dateField: string;
  valueField: string;
}

const AMS_SERIES: Record<string, AmsSeriesSpec> = {
  NATIONAL_BOXED_BEEF_CHOICE_DAILY: {
    // National Daily Boxed Beef Cutout & Boxed Beef Cuts - Negotiated Sales (LM_XB403)
    slug: "2453",
    section: "Current Cutout Values",
    dateField: "report_date",
    valueField: "choice_600_900_current",
  },
  NATIONAL_BOXED_BEEF_SELECT_DAILY: {
    slug: "2453",
    section: "Current Cutout Values",
    dateField: "report_date",
    valueField: "select_600_900_current",
  },
  NATIONAL_BONELESS_PROCESSING_BEEF_DAILY: {
    // National/Regional Daily Boneless Processing Beef/Beef Trimmings (LM_XB401)
    slug: "2451",
    section: "National",
    dateField: "report_date",
    valueField: "weighted_avg_price",
  },
  NATIONAL_DAILY_HOG_PURCHASED_SWINE: {
    // National Daily Direct Hog Prior Day Report - Slaughtered Swine (LM_HG201)
    slug: "2498",
    section: "Barrows and Gilts - Producer Sold",
    dateField: "report_date",
    valueField: "wtd_avg_net_price",
  },
};

const responseSchema = z.object({
  reportSection: z.string().optional(),
  results: z.array(z.record(z.string(), z.unknown())),
});

export interface UsdaAmsAdapterOptions {
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class UsdaAmsAdapter implements DataSourceAdapter {
  readonly source = "usda_ams" as const;

  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: UsdaAmsAdapterOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async fetchSeries(
    sourceId: string,
    options: FetchSeriesOptions = {},
  ): Promise<IndicatorFetch> {
    const spec = AMS_SERIES[sourceId];
    if (!spec) {
      throw new DataSourceError(
        `Unknown USDA AMS series '${sourceId}'. Known: ${Object.keys(AMS_SERIES).join(", ")}`,
        "usda_ams",
      );
    }

    const url = this.buildUrl(spec);
    const payload = await this.fetchJsonWithRetry(url, options.signal);
    const parsed = responseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new DataSourceError(
        `USDA AMS returned unexpected payload shape for '${sourceId}'`,
        "usda_ams",
        parsed.error,
      );
    }

    const points: IndicatorPoint[] = [];
    for (const row of parsed.data.results) {
      const rawDate = row[spec.dateField];
      const rawValue = row[spec.valueField];
      const observedAt =
        typeof rawDate === "string" ? parseFlexibleDate(rawDate) : null;
      if (!observedAt) continue;
      if (options.since && observedAt < options.since) continue;
      const valueNum =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string" && rawValue !== ""
            ? Number(rawValue)
            : NaN;
      if (!Number.isFinite(valueNum)) continue;
      points.push({ observedAt, value: valueNum });
    }

    points.sort((a, b) => a.observedAt.getTime() - b.observedAt.getTime());

    return {
      source: this.source,
      sourceId,
      points,
      fetchedAt: new Date(),
    };
  }

  private buildUrl(spec: AmsSeriesSpec): string {
    return `${AMS_BASE_URL}/${spec.slug}/${encodeURIComponent(spec.section)}`;
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
            `USDA AMS request failed: ${response.status} ${response.statusText} — ${body}`,
            "usda_ams",
          );
        }

        lastError = new DataSourceError(
          `USDA AMS request failed: ${response.status} ${response.statusText}`,
          "usda_ams",
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
      `USDA AMS request exhausted ${this.maxRetries + 1} attempts`,
      "usda_ams",
      lastError,
    );
  }

  private backoffMs(attempt: number): number {
    const jitter = Math.random() * this.baseBackoffMs;
    return this.baseBackoffMs * 2 ** attempt + jitter;
  }
}

/**
 * AMS reports use MM/DD/YYYY dates; handle ISO as fallback for safety.
 */
function parseFlexibleDate(token: string): Date | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(token);
  if (iso) {
    const [, y, m, d] = iso;
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(token);
  if (slash) {
    const [, m, d, y] = slash;
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
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
