import { and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  briefingDeliveries,
  briefings,
  briefingStatusEnum,
  industryEnum,
} from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Briefing = InferSelectModel<typeof briefings>;
export type BriefingDelivery = InferSelectModel<typeof briefingDeliveries>;

const CursorSchema = z.object({ createdAt: z.string(), id: z.string() });

export const CreateDraftBriefingInput = z.object({
  industry: z.enum(industryEnum.enumValues),
  regionState: z.string().min(2).max(2).nullable(),
  regionMetro: z.string().nullable().optional(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  headline: z.string().min(1),
  bodyMd: z.string().min(1),
  generatedBy: z.string().min(1),
});
export type CreateDraftBriefingInput = z.infer<typeof CreateDraftBriefingInput>;

export const ListBriefingsInput = z.object({
  industry: z.enum(industryEnum.enumValues).optional(),
  regionState: z.string().min(2).max(2).optional(),
  status: z.enum(briefingStatusEnum.enumValues).optional(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  cursor: CursorSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListBriefingsInput = z.infer<typeof ListBriefingsInput>;

export async function createDraftBriefing(
  input: CreateDraftBriefingInput,
): Promise<Briefing> {
  const parsed = CreateDraftBriefingInput.parse(input);
  const [row] = await db
    .insert(briefings)
    .values({ ...parsed, status: 'draft' })
    .returning();
  if (!row) throw new Error('Insert did not return a row');
  return row;
}

export async function getBriefingById(
  id: string,
): Promise<Briefing | undefined> {
  const [row] = await db
    .select()
    .from(briefings)
    .where(eq(briefings.id, id))
    .limit(1);
  return row;
}

export async function listBriefings(input: Partial<ListBriefingsInput> = {}): Promise<{
  data: Briefing[];
  nextCursor: { createdAt: string; id: string } | null;
}> {
  const { industry, regionState, status, weekStart, cursor, limit } =
    ListBriefingsInput.parse(input);

  const rows = await db
    .select()
    .from(briefings)
    .where(
      and(
        industry ? eq(briefings.industry, industry) : undefined,
        regionState ? eq(briefings.regionState, regionState) : undefined,
        status ? eq(briefings.status, status) : undefined,
        weekStart ? eq(briefings.weekStart, weekStart) : undefined,
        cursor
          ? or(
              lt(briefings.createdAt, new Date(cursor.createdAt)),
              and(
                eq(briefings.createdAt, new Date(cursor.createdAt)),
                gt(briefings.id, cursor.id),
              ),
            )
          : undefined,
      ),
    )
    .orderBy(desc(briefings.createdAt), asc(briefings.id))
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

export async function publishBriefing(
  id: string,
  reviewedBy: string,
): Promise<Briefing> {
  const [row] = await db
    .update(briefings)
    .set({
      status: 'published',
      publishedAt: new Date(),
      reviewedBy,
      updatedAt: new Date(),
    })
    .where(eq(briefings.id, id))
    .returning();
  if (!row) throw new Error(`Briefing ${id} not found`);
  return row;
}

export async function updateBriefingBody(
  id: string,
  bodyMd: string,
): Promise<Briefing> {
  const [row] = await db
    .update(briefings)
    .set({ bodyMd, updatedAt: new Date() })
    .where(eq(briefings.id, id))
    .returning();
  if (!row) throw new Error(`Briefing ${id} not found`);
  return row;
}

export async function listDeliveries(
  briefingId: string,
): Promise<BriefingDelivery[]> {
  return db
    .select()
    .from(briefingDeliveries)
    .where(eq(briefingDeliveries.briefingId, briefingId))
    .orderBy(asc(briefingDeliveries.sentAt));
}
