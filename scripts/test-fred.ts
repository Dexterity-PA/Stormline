/**
 * One-off verification script for the FRED adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-fred.ts [seriesId]
 *
 * Default series: PBEEFUSDM (Global Price of Beef, monthly).
 * Prints the 5 most recent observations.
 */
import { FredAdapter } from "@/lib/data-sources/fred";

async function main(): Promise<void> {
  const seriesId = process.argv[2] ?? "PBEEFUSDM";

  if (!process.env.FRED_API_KEY) {
    console.error(
      "FRED_API_KEY is not set. Add it to .env.local and re-run with:\n" +
        "  node --env-file=.env.local scripts/test-fred.ts",
    );
    process.exit(1);
  }

  const adapter = new FredAdapter();
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
  console.error("FRED fetch failed:", err);
  process.exit(1);
});
