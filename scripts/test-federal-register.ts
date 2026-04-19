/**
 * One-off verification script for the Federal Register adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-federal-register.ts [searchTerm]
 *
 * Default: "tariff". Prints the 5 most recent weekly buckets.
 */
import { FederalRegisterAdapter } from "@/lib/data-sources/federal-register";

async function main(): Promise<void> {
  const term = process.argv[2] ?? "tariff";
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 1);

  const adapter = new FederalRegisterAdapter();
  const result = await adapter.fetchSeries(term, { since });

  console.log(`Search term: ${result.sourceId}`);
  console.log(`Weekly buckets: ${result.points.length}`);
  console.log(`Fetched at: ${result.fetchedAt.toISOString()}`);
  console.log("Most recent 5 weekly buckets (week start → doc count):");

  const recent = result.points.slice(-5);
  for (const point of recent) {
    const date = point.observedAt.toISOString().slice(0, 10);
    console.log(`  ${date}  ${point.value}`);
  }
}

main().catch((err: unknown) => {
  console.error("Federal Register fetch failed:", err);
  process.exit(1);
});
