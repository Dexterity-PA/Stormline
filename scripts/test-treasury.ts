/**
 * One-off verification script for the Treasury FiscalData adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-treasury.ts [seriesId]
 *
 * Default: debt_to_penny. Also supported: tga_operating_balance.
 * Prints the 5 most recent observations.
 */
import { TreasuryAdapter } from "@/lib/data-sources/treasury";

async function main(): Promise<void> {
  const seriesId = process.argv[2] ?? "debt_to_penny";

  const adapter = new TreasuryAdapter();
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
  console.error("Treasury fetch failed:", err);
  process.exit(1);
});
