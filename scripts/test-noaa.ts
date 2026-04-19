/**
 * One-off verification script for the NOAA adapter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-noaa.ts [sourceId]
 *
 * Defaults to NWS:ALERTS:ACTIVE:ALL (keyless, returns current count).
 * If you pass an NCEI: sourceId, NOAA_NCEI_TOKEN must be set.
 */
import { NoaaAdapter } from "@/lib/data-sources/noaa";

async function main(): Promise<void> {
  const sourceId = process.argv[2] ?? "NWS:ALERTS:ACTIVE:ALL";

  if (sourceId.startsWith("NCEI:") && !process.env.NOAA_NCEI_TOKEN) {
    console.error(
      "NOAA_NCEI_TOKEN is not set. Add it to .env.local and re-run, or pass an NWS:* sourceId to test the keyless path.",
    );
    process.exit(0);
  }

  const adapter = new NoaaAdapter();
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
  console.error("NOAA fetch failed:", err);
  process.exit(1);
});
