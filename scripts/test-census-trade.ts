/**
 * One-off verification script for the Census International Trade adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-census-trade.ts [sourceId]
 *
 * Default: IMPORTS:HS2:02 (monthly meat imports, USD).
 * Works without a key (rate-limited to 500/day). With CENSUS_API_KEY
 * effectively uncapped.
 */
import { CensusTradeAdapter } from "@/lib/data-sources/census-trade";

async function main(): Promise<void> {
  const sourceId = process.argv[2] ?? "IMPORTS:HS2:02";

  if (!process.env.CENSUS_API_KEY) {
    console.warn(
      "CENSUS_API_KEY not set — proceeding with anonymous request (500/day IP cap).",
    );
  }

  const adapter = new CensusTradeAdapter();
  const result = await adapter.fetchSeries(sourceId);

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
  console.error("Census Trade fetch failed:", err);
  process.exit(1);
});
