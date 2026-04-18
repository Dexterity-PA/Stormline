import { db } from '@/lib/db';
import { organizations, members } from '@/lib/db/schema';
import {
  getMember,
  getMemberByClerkAndOrg,
  listMembersByOrg,
  updateNotificationPrefs,
} from '@/lib/db/queries/members';

async function main() {
  // Seed org + member directly (bypassing query layer to isolate members smoke)
  const [org] = await db
    .insert(organizations)
    .values({
      clerkOrgId: `smoke_org_members_${Date.now()}`,
      name: 'Smoke Org',
      industry: 'restaurant',
      regionState: 'TX',
    })
    .returning();
  if (!org) throw new Error('org seed failed');

  const clerkUserId = `smoke_user_${Date.now()}`;
  const [member] = await db
    .insert(members)
    .values({ orgId: org.id, clerkUserId, role: 'owner' })
    .returning();
  if (!member) throw new Error('member seed failed');

  const byId = await getMember(member.id);
  if (byId?.id !== member.id) throw new Error('getMember mismatch');

  const byClerk = await getMemberByClerkAndOrg(clerkUserId, org.id);
  if (byClerk?.id !== member.id) throw new Error('getMemberByClerkAndOrg mismatch');

  const list = await listMembersByOrg(org.id);
  if (!list.some((m) => m.id === member.id)) throw new Error('listMembersByOrg missing row');

  const updated = await updateNotificationPrefs(member.id, {
    smsAlerts: true,
    phone: '+15551234567',
  });
  if (!updated.smsAlerts) throw new Error('updateNotificationPrefs failed');

  console.log('smoke-members: PASSED');
}

main().catch((err) => {
  console.error('smoke-members: FAILED', err);
  process.exit(1);
});
