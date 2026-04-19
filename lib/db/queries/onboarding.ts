import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { industryEnum, industryProfileSchemas, onboardingState } from '@/lib/db/schema';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type OnboardingState = InferSelectModel<typeof onboardingState>;
export type IndustryProfileSchema = InferSelectModel<typeof industryProfileSchemas>;
export type OnboardingPatch = Omit<
  Partial<InferInsertModel<typeof onboardingState>>,
  'orgId' | 'completedAt'
>;

export async function getOnboardingState(
  orgId: string,
): Promise<OnboardingState | undefined> {
  const [row] = await db
    .select()
    .from(onboardingState)
    .where(eq(onboardingState.orgId, orgId))
    .limit(1);
  return row;
}

export async function upsertOnboardingState(
  orgId: string,
  patch: OnboardingPatch,
): Promise<OnboardingState> {
  const [row] = await db
    .insert(onboardingState)
    .values({ orgId, ...patch, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: onboardingState.orgId,
      set: { ...patch, updatedAt: new Date() },
    })
    .returning();
  if (!row) throw new Error(`upsertOnboardingState returned no row for org ${orgId}`);
  return row;
}

export async function completeOnboarding(orgId: string): Promise<OnboardingState> {
  const [row] = await db
    .update(onboardingState)
    .set({ step: 'complete', completedAt: new Date(), updatedAt: new Date() })
    .where(eq(onboardingState.orgId, orgId))
    .returning();
  if (!row) throw new Error(`Organization ${orgId} has no onboarding_state row`);
  return row;
}

export async function listIndustryProfileSchemas(): Promise<IndustryProfileSchema[]> {
  return db.select().from(industryProfileSchemas).orderBy(asc(industryProfileSchemas.industry));
}

export async function getIndustryProfileSchema(
  industry: (typeof industryEnum.enumValues)[number],
): Promise<IndustryProfileSchema | undefined> {
  const [row] = await db
    .select()
    .from(industryProfileSchemas)
    .where(eq(industryProfileSchemas.industry, industry))
    .limit(1);
  return row;
}
