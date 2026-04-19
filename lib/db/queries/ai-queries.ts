import { and, count, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiQueries, industryEnum } from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type AiQuery = InferSelectModel<typeof aiQueries>;

export interface InsertAiQueryInput {
  orgId: string;
  userId: string;
  question: string;
  industry: (typeof industryEnum.enumValues)[number] | null;
  region: string | null;
  inputSnapshot: unknown;
  answer: string;
  citedIndicatorCodes: string[];
  model: string;
  tokensIn: number | null;
  tokensOut: number | null;
}

export async function insertAiQuery(input: InsertAiQueryInput): Promise<void> {
  await db.insert(aiQueries).values({
    orgId: input.orgId,
    userId: input.userId,
    question: input.question,
    industry: input.industry,
    region: input.region,
    inputSnapshot: input.inputSnapshot,
    answer: input.answer,
    citedIndicatorCodes: input.citedIndicatorCodes,
    model: input.model,
    tokensIn: input.tokensIn,
    tokensOut: input.tokensOut,
  });
}

export async function countAiQueriesInLastHour(userId: string): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db
    .select({ value: count() })
    .from(aiQueries)
    .where(
      and(
        eq(aiQueries.userId, userId),
        gte(aiQueries.createdAt, oneHourAgo),
      ),
    );
  return row?.value ?? 0;
}
