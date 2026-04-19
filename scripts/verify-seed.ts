/**
 * Coverage report for seeded indicators vs. the registry.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/verify-seed.ts
 *
 * For every code in INDICATOR_REGISTRY, prints whether an indicator row exists
 * in the DB and how many observations are recorded for it. Summarises coverage
 * and highlights any codes that are in the registry but missing from the DB,
 * and any codes that have zero observations.
 */
import { count, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { indicators } from "@/lib/db/schema";
import { indicatorObservations } from "@/lib/db/schema/observations";
import { INDICATOR_REGISTRY } from "@/lib/indicators/registry";

interface Row {
  code: string;
  source: string;
  present: boolean;
  observations: number;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const codes = INDICATOR_REGISTRY.map((d) => d.code);
  const presentRows = await db
    .select({ id: indicators.id, code: indicators.code })
    .from(indicators)
    .where(inArray(indicators.code, codes));
  const byCode = new Map(presentRows.map((r) => [r.code, r.id]));

  // One aggregate query per indicator keeps this simple; registry is ~50 rows.
  const rows: Row[] = [];
  for (const def of INDICATOR_REGISTRY) {
    const id = byCode.get(def.code);
    if (!id) {
      rows.push({
        code: def.code,
        source: def.source,
        present: false,
        observations: 0,
      });
      continue;
    }
    const [{ count: n }] = await db
      .select({ count: count() })
      .from(indicatorObservations)
      .where(eq(indicatorObservations.indicatorId, id));
    rows.push({
      code: def.code,
      source: def.source,
      present: true,
      observations: n,
    });
  }

  console.log("code                                           source   present  observations");
  console.log("----                                           ------   -------  ------------");
  for (const r of rows) {
    console.log(
      `${r.code.padEnd(46)} ${r.source.padEnd(8)} ${
        r.present ? "yes" : "no "
      }      ${String(r.observations).padStart(6)}`,
    );
  }

  const perSource: Record<
    string,
    { total: number; seeded: number; withData: number; observations: number }
  > = {};
  for (const r of rows) {
    const bucket = (perSource[r.source] ??= {
      total: 0,
      seeded: 0,
      withData: 0,
      observations: 0,
    });
    bucket.total++;
    if (r.present) bucket.seeded++;
    if (r.observations > 0) bucket.withData++;
    bucket.observations += r.observations;
  }

  console.log("");
  console.log("source   total  seeded  withData  observations");
  console.log("------   -----  ------  --------  ------------");
  for (const [source, b] of Object.entries(perSource).sort(([a], [c]) =>
    a.localeCompare(c),
  )) {
    console.log(
      `${source.padEnd(8)} ${String(b.total).padStart(5)}  ${String(
        b.seeded,
      ).padStart(6)}  ${String(b.withData).padStart(8)}  ${String(
        b.observations,
      ).padStart(12)}`,
    );
  }

  const missing = rows.filter((r) => !r.present);
  const zero = rows.filter((r) => r.present && r.observations === 0);
  if (missing.length) {
    console.log("");
    console.log(`Missing from DB (${missing.length}):`);
    for (const r of missing) console.log(`  ${r.code}`);
  }
  if (zero.length) {
    console.log("");
    console.log(`Seeded but zero observations (${zero.length}):`);
    for (const r of zero) console.log(`  ${r.code}`);
  }
}

main().catch((err: unknown) => {
  console.error("verify-seed failed:", err);
  process.exit(1);
});
