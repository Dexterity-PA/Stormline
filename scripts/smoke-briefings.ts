import {
  createDraftBriefing,
  getBriefingById,
  listBriefings,
  listDeliveries,
  publishBriefing,
} from '@/lib/db/queries/briefings';

async function main() {
  const draft = await createDraftBriefing({
    industry: 'restaurant',
    regionState: 'TX',
    regionMetro: null,
    weekStart: '2026-04-14',
    weekEnd: '2026-04-20',
    headline: 'Smoke test headline',
    bodyMd: '## Smoke\n\nTest body.',
    generatedBy: 'claude-sonnet-4@prompt-v0.0',
  });
  console.log('createDraftBriefing:', draft.id, 'status:', draft.status);
  if (draft.status !== 'draft') throw new Error('status should be draft');

  const byId = await getBriefingById(draft.id);
  if (byId?.id !== draft.id) throw new Error('getBriefingById mismatch');

  const { data } = await listBriefings({ industry: 'restaurant', status: 'draft' });
  if (!data.some((b) => b.id === draft.id)) throw new Error('listBriefings missing row');

  const published = await publishBriefing(draft.id, 'smoke_clerk_user_001');
  if (published.status !== 'published') throw new Error('publishBriefing failed');
  if (!published.publishedAt) throw new Error('publishedAt not set');

  const deliveries = await listDeliveries(draft.id);
  console.log('listDeliveries count:', deliveries.length);

  console.log('smoke-briefings: PASSED');
}

main().catch((err) => {
  console.error('smoke-briefings: FAILED', err);
  process.exit(1);
});
