/**
 * One-off verification script for the FEMA adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-fema.ts [sourceId]
 *
 * Default: DECLARATIONS:MONTHLY:US
 * Prints the 5 most recent monthly buckets.
 */
import { FemaAdapter } from "@/lib/data-sources/fema";

async function main(): Promise<void> {
  const sourceId = process.argv[2] ?? "DECLARATIONS:MONTHLY:US";
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 3);

  const adapter = new FemaAdapter();
  const result = await adapter.fetchSeries(sourceId, { since });

  console.log(`Series: ${result.sourceId}`);
  console.log(`Monthly buckets: ${result.points.length}`);
  console.log(`Fetched at: ${result.fetchedAt.toISOString()}`);
  console.log("Most recent 5 monthly buckets (month start → declaration count):");

  const recent = result.points.slice(-5);
  for (const point of recent) {
    const date = point.observedAt.toISOString().slice(0, 10);
    console.log(`  ${date}  ${point.value}`);
  }
}

main().catch((err: unknown) => {
  console.error("FEMA fetch failed:", err);
  process.exit(1);
});
