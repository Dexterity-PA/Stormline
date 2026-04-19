/**
 * One-off verification script for the FHFA adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-fhfa.ts [sourceId]
 *
 * Default: HPI_PO_MONTHLY_USA_SA (Purchase-Only, Monthly, USA, seasonally
 * adjusted). Prints the 5 most recent observations.
 */
import { FhfaAdapter } from "@/lib/data-sources/fhfa";

async function main(): Promise<void> {
  const sourceId = process.argv[2] ?? "HPI_PO_MONTHLY_USA_SA";

  const adapter = new FhfaAdapter();
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
  console.error("FHFA fetch failed:", err);
  process.exit(1);
});
