/**
 * One-off verification script for the BLS adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-bls.ts [seriesId]
 *
 * Default series: CUSR0000SAF11 (CPI: Food at Home, not seasonally adjusted).
 * Prints the 5 most recent observations.
 *
 * BLS_API_KEY is optional (public series work without it, up to 500 req/day).
 * Register for a free key at https://data.bls.gov/registrationEngine/
 */
import { BlsAdapter } from "@/lib/data-sources/bls";

async function main(): Promise<void> {
  const seriesId = process.argv[2] ?? "CUSR0000SAF11";

  const adapter = new BlsAdapter();
  const result = await adapter.fetchSeries(seriesId);

  console.log(`Series: ${result.sourceId}`);
  console.log(`Points fetched: ${result.points.length}`);
  console.log(`Fetched at: ${result.fetchedAt.toISOString()}`);
  console.log("Most recent 5 observations:");

  const recent = result.points.slice(-5);
  for (const point of recent) {
    const date = point.observedAt.toISOString().slice(0, 10);
    console.log(`  ${date}  ${point.value}`);
  }
}

main().catch((err: unknown) => {
  console.error("BLS fetch failed:", err);
  process.exit(1);
});
