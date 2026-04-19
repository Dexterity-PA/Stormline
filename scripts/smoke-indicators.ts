import {
  getIndicatorByCode,
  getLatestValues,
  getSeries,
  insertIndicatorValues,
  listIndicatorsByIndustry,
  upsertIndicator,
} from '@/lib/db/queries/indicators';

async function main() {
  const code = `SMOKE:TEST_${Date.now()}`;

  const indicator = await upsertIndicator({
    code,
    source: 'fred',
    sourceId: `SMOKE${Date.now()}`,
    name: 'Smoke Test Indicator',
    unit: 'USD/lb',
    industryTags: ['restaurant'],
    costBucket: 'beef',
    frequency: 'monthly',
  });
  console.log('upsertIndicator:', indicator.id);

  // Idempotent re-upsert
  const again = await upsertIndicator({ ...indicator, name: 'Smoke Updated' });
  if (again.id !== indicator.id) throw new Error('upsert changed id');
  if (again.name !== 'Smoke Updated') throw new Error('upsert did not update name');

  const byCode = await getIndicatorByCode(code);
  if (byCode?.id !== indicator.id) throw new Error('getIndicatorByCode mismatch');

  const byIndustry = await listIndicatorsByIndustry('restaurant');
  if (!byIndustry.some((i) => i.id === indicator.id))
    throw new Error('listIndicatorsByIndustry missing row');

  const now = new Date();
  const t1 = new Date(now.getTime() - 86400_000 * 2);
  const t2 = new Date(now.getTime() - 86400_000);

  await insertIndicatorValues([
    { indicatorId: indicator.id, observedAt: t1, value: '5.23' },
    { indicatorId: indicator.id, observedAt: t2, value: '5.41' },
  ]);
  // Second insert same rows — must not throw (onConflictDoNothing)
  await insertIndicatorValues([
    { indicatorId: indicator.id, observedAt: t1, value: '5.23' },
  ]);

  const latest = await getLatestValues([indicator.id]);
  if (latest[0]?.value !== '5.41') throw new Error('getLatestValues wrong value');

  const series = await getSeries(code, t1, now);
  if (series.length < 2) throw new Error('getSeries returned too few rows');

  console.log('smoke-indicators: PASSED');
}

main().catch((err) => {
  console.error('smoke-indicators: FAILED', err);
  process.exit(1);
});
