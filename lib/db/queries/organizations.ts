import { and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  industryEnum,
  organizations,
  subscriptionTierEnum,
} from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Organization = InferSelectModel<typeof organizations>;
export type SubscriptionTier = (typeof subscriptionTierEnum.enumValues)[number];

const CursorSchema = z.object({ createdAt: z.string(), id: z.string() });

export const CreateOrgInput = z.object({
  clerkOrgId: z.string().min(1),
  name: z.string().min(1),
  industry: z.enum(industryEnum.enumValues),
  regionState: z.string().min(2).max(2),
  regionMetro: z.string().optional(),
});
export type CreateOrgInput = z.infer<typeof CreateOrgInput>;

export const ListOrgsInput = z.object({
  cursor: CursorSchema.optional(),
  limit: z.number().int().min(1).max(100).default(50),
});
export type ListOrgsInput = z.infer<typeof ListOrgsInput>;

export async function getOrgById(
  id: string,
): Promise<Organization | undefined> {
  const [row] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  return row;
}

export async function getOrgByClerkId(
  clerkOrgId: string,
): Promise<Organization | undefined> {
  const [row] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.clerkOrgId, clerkOrgId))
    .limit(1);
  return row;
}

export async function createOrg(input: CreateOrgInput): Promise<Organization> {
  const parsed = CreateOrgInput.parse(input);
  const [row] = await db.insert(organizations).values(parsed).returning();
  if (!row) throw new Error('Insert did not return a row');
  return row;
}

export async function updateOrgTier(
  id: string,
  tier: SubscriptionTier,
): Promise<Organization> {
  const [row] = await db
    .update(organizations)
    .set({ subscriptionTier: tier, updatedAt: new Date() })
    .where(eq(organizations.id, id))
    .returning();
  if (!row) throw new Error(`Organization ${id} not found`);
  return row;
}

export async function listOrgs(input: Partial<ListOrgsInput> = {}): Promise<{
  data: Organization[];
  nextCursor: { createdAt: string; id: string } | null;
}> {
  const { cursor, limit } = ListOrgsInput.parse(input);
  const rows = await db
    .select()
    .from(organizations)
    .where(
      cursor
        ? or(
            lt(organizations.createdAt, new Date(cursor.createdAt)),
            and(
              eq(organizations.createdAt, new Date(cursor.createdAt)),
              gt(organizations.id, cursor.id),
            ),
          )
        : undefined,
    )
    .orderBy(desc(organizations.createdAt), asc(organizations.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const last = data[data.length - 1];
  const nextCursor =
    hasMore && last
      ? { createdAt: last.createdAt.toISOString(), id: last.id }
      : null;
  return { data, nextCursor };
}
