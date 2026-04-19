/**
 * One-off verification script for the USDA AMS adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-usda-ams.ts [sourceId]
 *
 * Default: NATIONAL_BOXED_BEEF_CHOICE_DAILY
 * Prints the 5 most recent observations.
 */
import { UsdaAmsAdapter } from "@/lib/data-sources/usda-ams";

async function main(): Promise<void> {
  const sourceId = process.argv[2] ?? "NATIONAL_BOXED_BEEF_CHOICE_DAILY";
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - 2);

  const adapter = new UsdaAmsAdapter();
  const result = await adapter.fetchSeries(sourceId, { since });

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
  console.error("USDA AMS fetch failed:", err);
  process.exit(1);
});
