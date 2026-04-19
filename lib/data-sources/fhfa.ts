import {
  DataSourceError,
  type DataSourceAdapter,
  type FetchSeriesOptions,
  type IndicatorFetch,
  type IndicatorPoint,
} from "./types";

/**
 * FHFA House Price Index (https://www.fhfa.gov/HPI).
 *
 * FHFA publishes HPI datasets as downloadable CSVs — there is no true JSON
 * API. The adapter fetches a single master CSV and filters by (hpi_flavor,
 * frequency, level, adjustment) to produce a time series.
 *
 * No API key required. FHFA does not publish a formal rate limit; the CSV
 * endpoint is a static file served via CloudFront. We keep the same retry
 * scaffolding for transient 5xx/timeouts.
 *
 * URL NOTE: FHFA has historically moved the master CSV between paths. The
 * default URL below was valid as of adapter authoring time. If it 404s,
 * construct the adapter with {csvUrl} pointing to the current location
 * listed on https://www.fhfa.gov/data/hpi/datasets.
 *
 * Stormline sourceId → FHFA filter mapping (see FHFA_SERIES below).
 */
const FHFA_DEFAULT_CSV_URL =
  "https://www.fhfa.gov/hpi/download/monthly/hpi_master.csv";
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_BACKOFF_MS = 500;
const DEFAULT_TIMEOUT_MS = 30_000;

interface FhfaSeriesSpec {
  hpi_flavor: string;
  frequency: "monthly" | "quarterly";
  /** Matches against the `place_id` column. "USA" = national rollup. */
  place_id: string;
  useSA: boolean;
}

const FHFA_SERIES: Record<string, FhfaSeriesSpec> = {
  HPI_PO_MONTHLY_USA_SA: {
    hpi_flavor: "purchase-only",
    frequency: "monthly",
    place_id: "USA",
    useSA: true,
  },
  HPI_PO_MONTHLY_USA_NSA: {
    hpi_flavor: "purchase-only",
    frequency: "monthly",
    place_id: "USA",
    useSA: false,
  },
  HPI_AT_QUARTERLY_USA_NSA: {
    hpi_flavor: "all-transactions",
    frequency: "quarterly",
    place_id: "USA",
    useSA: false,
  },
  HPI_EXP_QUARTERLY_USA_NSA: {
    hpi_flavor: "expanded-data",
    frequency: "quarterly",
    place_id: "USA",
    useSA: false,
  },
};

export interface FhfaAdapterOptions {
  fetchImpl?: typeof fetch;
  csvUrl?: string;
  maxRetries?: number;
  baseBackoffMs?: number;
  timeoutMs?: number;
}

export class FhfaAdapter implements DataSourceAdapter {
  readonly source = "fhfa" as const;

  private readonly fetchImpl: typeof fetch;
  private readonly csvUrl: string;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly timeoutMs: number;

  constructor(options: FhfaAdapterOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.csvUrl = options.csvUrl ?? FHFA_DEFAULT_CSV_URL;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = options.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async fetchSeries(
    sourceId: string,
    options: FetchSeriesOptions = {},
  ): Promise<IndicatorFetch> {
    const spec = FHFA_SERIES[sourceId];
    if (!spec) {
      throw new DataSourceError(
        `Unknown FHFA series '${sourceId}'. Known: ${Object.keys(FHFA_SERIES).join(", ")}`,
        "fhfa",
      );
    }

    const csv = await this.fetchTextWithRetry(this.csvUrl, options.signal);
    const rows = parseCsv(csv);
    if (rows.length === 0) {
      throw new DataSourceError(
        "FHFA CSV parse yielded zero rows — check csvUrl",
        "fhfa",
      );
    }
    const header = rows[0];
    const idx = {
      hpi_flavor: header.indexOf("hpi_flavor"),
      frequency: header.indexOf("frequency"),
      place_id: header.indexOf("place_id"),
      yr: header.indexOf("yr"),
      period: header.indexOf("period"),
      index_nsa: header.indexOf("index_nsa"),
      index_sa: header.indexOf("index_sa"),
    };
    for (const [name, i] of Object.entries(idx)) {
      if (i < 0) {
        throw new DataSourceError(
          `FHFA CSV missing expected column '${name}'. Found: ${header.join(",")}`,
          "fhfa",
        );
      }
    }

    const points: IndicatorPoint[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.length < header.length) continue;
      if (row[idx.hpi_flavor] !== spec.hpi_flavor) continue;
      if (row[idx.frequency] !== spec.frequency) continue;
      if (row[idx.place_id] !== spec.place_id) continue;
      const rawValue = spec.useSA ? row[idx.index_sa] : row[idx.index_nsa];
      if (!rawValue || rawValue === "") continue;
      const value = Number(rawValue);
      if (!Number.isFinite(value)) continue;
      const yr = Number(row[idx.yr]);
      const period = Number(row[idx.period]);
      if (!Number.isFinite(yr) || !Number.isFinite(period)) continue;
      const observedAt = periodToDate(yr, period, spec.frequency);
      if (!observedAt) continue;
      if (options.since && observedAt < options.since) continue;
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

  private async fetchTextWithRetry(
    url: string,
    externalSignal?: AbortSignal,
  ): Promise<string> {
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
          headers: { "User-Agent": USER_AGENT, Accept: "text/csv,*/*" },
        });

        if (response.ok) {
          return await response.text();
        }

        if (response.status !== 429 && response.status < 500) {
          const body = await safeReadText(response);
          throw new DataSourceError(
            `FHFA request failed: ${response.status} ${response.statusText} — ${body}`,
            "fhfa",
          );
        }

        lastError = new DataSourceError(
          `FHFA request failed: ${response.status} ${response.statusText}`,
          "fhfa",
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
      `FHFA request exhausted ${this.maxRetries + 1} attempts`,
      "fhfa",
      lastError,
    );
  }

  private backoffMs(attempt: number): number {
    const jitter = Math.random() * this.baseBackoffMs;
    return this.baseBackoffMs * 2 ** attempt + jitter;
  }
}

/**
 * Minimal RFC-4180-ish CSV parser. Handles:
 *   - quoted fields with embedded commas
 *   - escaped quotes via ""
 *   - LF or CRLF line endings
 * Does not support multiline quoted values (not needed for HPI_master.csv).
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line === "") continue;
    rows.push(parseCsvLine(line));
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let value = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          value += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          value += line[i];
          i++;
        }
      }
      fields.push(value);
      if (line[i] === ",") i++;
    } else {
      let end = line.indexOf(",", i);
      if (end === -1) end = line.length;
      fields.push(line.slice(i, end));
      i = end + 1;
      if (end === line.length) {
        return fields;
      }
    }
  }
  if (line.endsWith(",")) fields.push("");
  return fields;
}

function periodToDate(
  yr: number,
  period: number,
  frequency: "monthly" | "quarterly",
): Date | null {
  if (frequency === "monthly") {
    if (period < 1 || period > 12) return null;
    return new Date(Date.UTC(yr, period - 1, 1));
  }
  if (period < 1 || period > 4) return null;
  const month = (period - 1) * 3;
  return new Date(Date.UTC(yr, month, 1));
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
