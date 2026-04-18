import { and, arrayContains, asc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  frequencyEnum,
  indicatorSourceEnum,
  indicators,
  indicatorValues,
  industryEnum,
} from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Indicator = InferSelectModel<typeof indicators>;
export type IndicatorValue = InferSelectModel<typeof indicatorValues>;

export const UpsertIndicatorInput = z.object({
  code: z.string().min(1),
  source: z.enum(indicatorSourceEnum.enumValues),
  sourceId: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1),
  industryTags: z.array(z.string()),
  costBucket: z.string().nullable(),
  frequency: z.enum(frequencyEnum.enumValues),
});
export type UpsertIndicatorInput = z.infer<typeof UpsertIndicatorInput>;

export const InsertIndicatorValueInput = z.object({
  indicatorId: z.string().uuid(),
  observedAt: z.date(),
  value: z.string().refine((v) => !Number.isNaN(Number(v)), { message: 'value must be a numeric string' }),
});
export type InsertIndicatorValueInput = z.infer<typeof InsertIndicatorValueInput>;

export async function getIndicatorByCode(
  code: string,
): Promise<Indicator | undefined> {
  const [row] = await db
    .select()
    .from(indicators)
    .where(eq(indicators.code, code))
    .limit(1);
  return row;
}

export async function listIndicatorsByIndustry(
  industry: (typeof industryEnum.enumValues)[number],
): Promise<Indicator[]> {
  // industryTags is text[] — use array contains operator
  return db
    .select()
    .from(indicators)
    .where(arrayContains(indicators.industryTags, [industry]));
}

export async function upsertIndicator(
  input: UpsertIndicatorInput,
): Promise<Indicator> {
  const parsed = UpsertIndicatorInput.parse(input);
  const [row] = await db
    .insert(indicators)
    .values(parsed)
    .onConflictDoUpdate({
      target: indicators.code,
      set: {
        source: parsed.source,
        sourceId: parsed.sourceId,
        name: parsed.name,
        unit: parsed.unit,
        industryTags: parsed.industryTags,
        costBucket: parsed.costBucket,
        frequency: parsed.frequency,
      },
    })
    .returning();
  if (!row) throw new Error('Upsert did not return a row');
  return row;
}

export async function insertIndicatorValues(
  values: InsertIndicatorValueInput[],
): Promise<void> {
  if (values.length === 0) return;
  const parsed = z.array(InsertIndicatorValueInput).parse(values);
  await db.insert(indicatorValues).values(parsed).onConflictDoNothing();
}

export async function getLatestValues(
  indicatorIds: string[],
): Promise<Array<{ indicatorId: string; value: string; observedAt: Date }>> {
  if (indicatorIds.length === 0) return [];

  const subq = db
    .select({
      indicatorId: indicatorValues.indicatorId,
      maxObservedAt: sql<Date>`max(${indicatorValues.observedAt})`.as(
        'max_observed_at',
      ),
    })
    .from(indicatorValues)
    .where(inArray(indicatorValues.indicatorId, indicatorIds))
    .groupBy(indicatorValues.indicatorId)
    .as('latest');

  return db
    .select({
      indicatorId: indicatorValues.indicatorId,
      value: indicatorValues.value,
      observedAt: indicatorValues.observedAt,
    })
    .from(indicatorValues)
    .innerJoin(
      subq,
      and(
        eq(indicatorValues.indicatorId, subq.indicatorId),
        eq(indicatorValues.observedAt, subq.maxObservedAt),
      ),
    );
}

export async function getSeries(
  code: string,
  since: Date,
  until: Date,
): Promise<Array<{ observedAt: Date; value: string }>> {
  if (since > until) throw new Error('getSeries: since must be <= until');
  return db
    .select({
      observedAt: indicatorValues.observedAt,
      value: indicatorValues.value,
    })
    .from(indicatorValues)
    .innerJoin(indicators, eq(indicatorValues.indicatorId, indicators.id))
    .where(
      and(
        eq(indicators.code, code),
        gte(indicatorValues.observedAt, since),
        lte(indicatorValues.observedAt, until),
      ),
    )
    .orderBy(asc(indicatorValues.observedAt));
}
