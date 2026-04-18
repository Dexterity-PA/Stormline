/**
 * One-off verification script for the EIA adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-eia.ts [seriesId]
 *
 * Default series: PET.EMD_EPD2D_PTE_NUS_DPG.W (Weekly US Diesel Retail Price).
 * Prints the 5 most recent observations.
 */
import { EiaAdapter } from "@/lib/data-sources/eia";

async function main(): Promise<void> {
  const seriesId = process.argv[2] ?? "PET.EMD_EPD2D_PTE_NUS_DPG.W";

  if (!process.env.EIA_API_KEY) {
    console.error(
      "EIA_API_KEY is not set. Add it to .env.local and re-run with:\n" +
        "  node --env-file=.env.local scripts/test-eia.ts",
    );
    process.exit(1);
  }

  const adapter = new EiaAdapter();
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
  console.error("EIA fetch failed:", err);
  process.exit(1);
});
