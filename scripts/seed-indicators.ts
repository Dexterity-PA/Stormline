/**
 * Seed indicator rows from the registry.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/seed-indicators.ts
 *
 * Reads INDICATOR_REGISTRY and inserts any missing rows into the indicators
 * table. Existing rows (matched on unique code) are left untouched via
 * ON CONFLICT DO NOTHING. Prints a summary of inserted vs. existing counts
 * per source.
 */
import { db } from "@/lib/db";
import { indicators } from "@/lib/db/schema";
import { INDICATOR_REGISTRY } from "@/lib/indicators/registry";

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const rows = INDICATOR_REGISTRY.map((def) => ({
    code: def.code,
    source: def.source,
    sourceId: def.sourceId,
    name: def.name,
    unit: def.unit,
    industryTags: [...def.industryTags] as string[],
    costBucket: def.costBucket,
    frequency: def.frequency,
  }));

  console.log(`Seeding ${rows.length} indicators from registry...`);

  const inserted = await db
    .insert(indicators)
    .values(rows)
    .onConflictDoNothing({ target: indicators.code })
    .returning({ id: indicators.id, code: indicators.code });

  const insertedCodes = new Set(inserted.map((r) => r.code));
  const perSource: Record<string, { inserted: number; existing: number }> = {};
  for (const def of INDICATOR_REGISTRY) {
    const bucket = (perSource[def.source] ??= { inserted: 0, existing: 0 });
    if (insertedCodes.has(def.code)) bucket.inserted++;
    else bucket.existing++;
  }

  console.log("");
  console.log("source   inserted  existing");
  console.log("------   --------  --------");
  for (const [source, { inserted: ins, existing }] of Object.entries(
    perSource,
  ).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(
      `${source.padEnd(8)} ${String(ins).padStart(8)}  ${String(
        existing,
      ).padStart(8)}`,
    );
  }
  console.log("");
  console.log(
    `Total: ${inserted.length} inserted, ${
      rows.length - inserted.length
    } already present.`,
  );
}

main().catch((err: unknown) => {
  console.error("seed-indicators failed:", err);
  process.exit(1);
});
