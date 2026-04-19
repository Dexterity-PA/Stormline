import { and, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { feedback, feedbackTargetEnum } from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Feedback = InferSelectModel<typeof feedback>;
export type FeedbackTarget = (typeof feedbackTargetEnum.enumValues)[number];

export const SubmitFeedbackInput = z.object({
  orgId: z.string().uuid(),
  memberId: z.string().uuid(),
  targetType: z.enum(feedbackTargetEnum.enumValues),
  targetId: z.string().uuid(),
  helpful: z.boolean(),
  comment: z.string().nullable().optional(),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackInput>;

export async function submitFeedback(
  input: SubmitFeedbackInput,
): Promise<Feedback> {
  const parsed = SubmitFeedbackInput.parse(input);
  const [row] = await db.insert(feedback).values(parsed).returning();
  if (!row) throw new Error('Insert did not return a row');
  return row;
}

export async function aggregateFeedback(
  targetType: FeedbackTarget,
  targetId: string,
): Promise<{ helpful: number; notHelpful: number; total: number }> {
  const rows = await db
    .select({ helpful: feedback.helpful, count: count() })
    .from(feedback)
    .where(
      and(
        eq(feedback.targetType, targetType),
        eq(feedback.targetId, targetId),
      ),
    )
    .groupBy(feedback.helpful);

  let helpfulCount = 0;
  let notHelpfulCount = 0;
  for (const row of rows) {
    if (row.helpful) helpfulCount = Number(row.count);
    else notHelpfulCount = Number(row.count);
  }
  return {
    helpful: helpfulCount,
    notHelpful: notHelpfulCount,
    total: helpfulCount + notHelpfulCount,
  };
}
