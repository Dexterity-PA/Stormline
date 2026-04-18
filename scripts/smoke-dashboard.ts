import { getSnapshot, upsertSnapshot } from '@/lib/db/queries/dashboard';

async function main() {
  const date = '2026-04-18';
  const tileData = {
    tiles: [{ code: 'FRED:PBEEFUSDM', value: '5.41', delta1w: 0.03 }],
  };

  // NOTE: upsertSnapshot will fail at runtime until the unique index is added to
  // dashboard_snapshots (industry, region, snapshot_date). See dashboard.ts TODO.
  const snap = await upsertSnapshot({
    industry: 'restaurant',
    region: 'TX',
    snapshotDate: date,
    dataJson: tileData,
  });
  console.log('upsertSnapshot:', snap.id);

  // Idempotent re-upsert — only valid after unique index migration
  const snap2 = await upsertSnapshot({
    industry: 'restaurant',
    region: 'TX',
    snapshotDate: date,
    dataJson: { ...tileData, updated: true },
  });
  if (snap2.id !== snap.id) throw new Error('upsert changed id on conflict');

  const fetched = await getSnapshot('restaurant', 'TX', date);
  if (fetched?.id !== snap.id) throw new Error('getSnapshot mismatch');

  console.log('smoke-dashboard: PASSED');
}

main().catch((err) => {
  console.error('smoke-dashboard: FAILED', err);
  process.exit(1);
});
