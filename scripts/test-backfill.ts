/**
 * One-off verification for indicator_observations backfill.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-backfill.ts [sourceId]
 *
 * Default: FRED series PBEEFUSDM (Global Price of Beef, monthly).
 *
 * Ensures the indicator row exists in the DB, fetches 10 years of FRED
 * observations, inserts with ON CONFLICT DO NOTHING, then prints counts and
 * first/last dates. Exits non-zero if fewer than 100 observations persist.
 *
 * Self-contained so it runs under plain `node --env-file` without a TS
 * path-alias loader or extensionless-resolution flag.
 */
import { neon } from "@neondatabase/serverless";
import { asc, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { indicators } from "../lib/db/schema.ts";
import { indicatorObservations } from "../lib/db/schema/observations.ts";

interface SeriesPoint {
  obsDate: string;
  value: number;
}

const DEFAULT_SOURCE_ID = "PBEEFUSDM";
const DEFAULT_CODE = "FRED:PBEEFUSDM";
const YEARS_BACK = 10;

async function fetchFredSeries(
  sourceId: string,
  since: Date,
): Promise<SeriesPoint[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) throw new Error("FRED_API_KEY is not set");

  const params = new URLSearchParams({
    series_id: sourceId,
    api_key: apiKey,
    file_type: "json",
    observation_start: toIsoDate(since),
  });
  const url = `https://api.stlouisfed.org/fred/series/observations?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FRED ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  const payload: unknown = await res.json();
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("observations" in payload)
  ) {
    throw new Error("unexpected FRED payload shape");
  }
  const raw = (payload as { observations: unknown }).observations;
  if (!Array.isArray(raw)) {
    throw new Error("FRED observations not an array");
  }

  const points: SeriesPoint[] = [];
  for (const item of raw) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("date" in item) ||
      !("value" in item)
    ) {
      continue;
    }
    const r = item as { date: unknown; value: unknown };
    if (typeof r.date !== "string" || typeof r.value !== "string") continue;
    if (r.value === "." || r.value === "") continue;
    const value = Number(r.value);
    if (!Number.isFinite(value)) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) continue;
    points.push({ obsDate: r.date, value });
  }
  return points;
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

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function main(): Promise<void> {
  const sourceId = process.argv[2] ?? DEFAULT_SOURCE_ID;
  const code = `FRED:${sourceId}`;

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  if (!process.env.FRED_API_KEY) {
    console.error("FRED_API_KEY is not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  // Ensure indicator row exists. For the default case we know the metadata;
  // for other codes we use placeholders that can be corrected later.
  let [row] = await db
    .select({ id: indicators.id })
    .from(indicators)
    .where(eq(indicators.code, code))
    .limit(1);
  if (!row) {
    const defaults =
      code === DEFAULT_CODE
        ? {
            name: "Global Price of Beef",
            unit: "USD/lb",
            industryTags: ["restaurant"] as string[],
            costBucket: "beef" as string | null,
            frequency: "monthly" as const,
          }
        : {
            name: `FRED ${sourceId}`,
            unit: "unknown",
            industryTags: [] as string[],
            costBucket: null as string | null,
            frequency: "monthly" as const,
          };
    const [inserted] = await db
      .insert(indicators)
      .values({
        code,
        source: "fred",
        sourceId,
        ...defaults,
      })
      .returning({ id: indicators.id });
    if (!inserted) throw new Error(`insert indicator ${code} returned no row`);
    row = inserted;
  }
  const indicatorId = row.id;

  const since = yearsAgo(YEARS_BACK);
  console.log(`Backfilling ${code} since ${toIsoDate(since)}`);

  const points = await fetchFredSeries(sourceId, since);
  const rows = points.map((p) => ({
    indicatorId,
    obsDate: p.obsDate,
    value: String(p.value),
  }));

  const insertedRows = rows.length
    ? await db
        .insert(indicatorObservations)
        .values(rows)
        .onConflictDoNothing({
          target: [
            indicatorObservations.indicatorId,
            indicatorObservations.obsDate,
          ],
        })
        .returning({ id: indicatorObservations.id })
    : [];

  console.log(
    `Result: fetched=${rows.length} inserted=${insertedRows.length} skipped=${rows.length - insertedRows.length}`,
  );

  const [{ count: rowCount }] = await db
    .select({ count: count() })
    .from(indicatorObservations)
    .where(eq(indicatorObservations.indicatorId, indicatorId));

  const [first] = await db
    .select({
      obsDate: indicatorObservations.obsDate,
      value: indicatorObservations.value,
    })
    .from(indicatorObservations)
    .where(eq(indicatorObservations.indicatorId, indicatorId))
    .orderBy(asc(indicatorObservations.obsDate))
    .limit(1);

  const [last] = await db
    .select({
      obsDate: indicatorObservations.obsDate,
      value: indicatorObservations.value,
    })
    .from(indicatorObservations)
    .where(eq(indicatorObservations.indicatorId, indicatorId))
    .orderBy(desc(indicatorObservations.obsDate))
    .limit(1);

  console.log(`DB row count for ${code}: ${rowCount}`);
  console.log(`First observation: ${first?.obsDate} = ${first?.value}`);
  console.log(`Last observation:  ${last?.obsDate} = ${last?.value}`);

  if (rowCount < 100) {
    console.error(
      `expected >100 observations for monthly series; got ${rowCount}`,
    );
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("test-backfill failed:", err);
  process.exit(1);
});
