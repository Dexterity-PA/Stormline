import { db } from '@/lib/db';
import {
  createOrg,
  getOrgById,
  getOrgByClerkId,
  listOrgs,
  updateOrgTier,
} from '@/lib/db/queries/organizations';

async function main() {
  const clerkOrgId = `smoke_org_${Date.now()}`;

  const org = await createOrg({
    clerkOrgId,
    name: 'Smoke Test Restaurant',
    industry: 'restaurant',
    regionState: 'TX',
  });
  console.log('createOrg:', org.id);

  const byId = await getOrgById(org.id);
  if (byId?.id !== org.id) throw new Error('getOrgById mismatch');

  const byClerk = await getOrgByClerkId(clerkOrgId);
  if (byClerk?.id !== org.id) throw new Error('getOrgByClerkId mismatch');

  const updated = await updateOrgTier(org.id, 'core');
  if (updated.subscriptionTier !== 'core') throw new Error('updateOrgTier failed');

  const { data, nextCursor } = await listOrgs({ limit: 5 });
  if (!data.some((o) => o.id === org.id)) throw new Error('listOrgs missing row');
  console.log('listOrgs length:', data.length, 'nextCursor:', nextCursor);

  console.log('smoke-organizations: PASSED');
}

main().catch((err) => {
  console.error('smoke-organizations: FAILED', err);
  process.exit(1);
});
