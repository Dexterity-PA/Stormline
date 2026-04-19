/**
 * One-off verification script for the USDA adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-usda.ts [sourceId]
 *
 * Default series: EGGS_TABLE_PRICE_MONTHLY (Table Eggs, Price Received, $/dozen).
 * Prints the 5 most recent observations.
 *
 * Requires USDA_NASS_API_KEY in .env.local.
 * Free registration: https://quickstats.nass.usda.gov/api
 */
import { UsdaAdapter } from "@/lib/data-sources/usda";

async function main(): Promise<void> {
  const sourceId = process.argv[2] ?? "EGGS_TABLE_PRICE_MONTHLY";

  if (!process.env.USDA_NASS_API_KEY) {
    console.error(
      "USDA_NASS_API_KEY is not set. Register for a free key at:\n" +
        "  https://quickstats.nass.usda.gov/api\n" +
        "Then add it to .env.local and re-run with:\n" +
        "  node --env-file=.env.local scripts/test-usda.ts",
    );
    process.exit(1);
  }

  const adapter = new UsdaAdapter();
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
  console.error("USDA fetch failed:", err);
  process.exit(1);
});
