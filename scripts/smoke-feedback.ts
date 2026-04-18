import { db } from '@/lib/db';
import { briefings, members, organizations } from '@/lib/db/schema';
import { aggregateFeedback, submitFeedback } from '@/lib/db/queries/feedback';

async function main() {
  const [org] = await db
    .insert(organizations)
    .values({
      clerkOrgId: `smoke_org_fb_${Date.now()}`,
      name: 'Smoke Feedback Org',
      industry: 'restaurant',
      regionState: 'TX',
    })
    .returning();
  if (!org) throw new Error('org seed failed');

  const [member] = await db
    .insert(members)
    .values({ orgId: org.id, clerkUserId: `smoke_u_${Date.now()}`, role: 'owner' })
    .returning();
  if (!member) throw new Error('member seed failed');

  const [briefing] = await db
    .insert(briefings)
    .values({
      industry: 'restaurant',
      regionState: 'TX',
      weekStart: '2026-04-14',
      weekEnd: '2026-04-20',
      headline: 'Smoke briefing',
      bodyMd: '## Smoke',
      generatedBy: 'claude-sonnet-4@prompt-v0.0',
      status: 'published',
    })
    .returning();
  if (!briefing) throw new Error('briefing seed failed');

  await submitFeedback({
    orgId: org.id,
    memberId: member.id,
    targetType: 'briefing',
    targetId: briefing.id,
    helpful: true,
    comment: 'Very useful!',
  });
  await submitFeedback({
    orgId: org.id,
    memberId: member.id,
    targetType: 'briefing',
    targetId: briefing.id,
    helpful: false,
  });

  const agg = await aggregateFeedback('briefing', briefing.id);
  if (agg.helpful !== 1) throw new Error(`expected helpful=1, got ${agg.helpful}`);
  if (agg.notHelpful !== 1) throw new Error(`expected notHelpful=1, got ${agg.notHelpful}`);
  if (agg.total !== 2) throw new Error(`expected total=2, got ${agg.total}`);

  console.log('aggregateFeedback:', agg);
  console.log('smoke-feedback: PASSED');
}

main().catch((err) => {
  console.error('smoke-feedback: FAILED', err);
  process.exit(1);
});
