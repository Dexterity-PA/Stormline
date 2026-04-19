import { and, arrayOverlaps, asc, desc, eq, gt, gte, lt, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  alertCategoryEnum,
  alertDeliveries,
  alerts,
  indicatorValues,
  severityEnum,
} from '@/lib/db/schema';
import {
  alertConditionEnum,
  alertEvents,
  alertRules,
} from '@/lib/db/schema/alert-rules';
import type { InferSelectModel } from 'drizzle-orm';
import type { AlertEvent, AlertRule } from '@/lib/db/schema/alert-rules';

export type Alert = InferSelectModel<typeof alerts>;
export type AlertDelivery = InferSelectModel<typeof alertDeliveries>;

const CursorSchema = z.object({ createdAt: z.string(), id: z.string() });

export const CreateAlertInput = z.object({
  category: z.enum(alertCategoryEnum.enumValues),
  industries: z.array(z.string()).min(1),
  regions: z.array(z.string()).min(1),
  severity: z.enum(severityEnum.enumValues),
  headline: z.string().min(1),
  bodyMd: z.string().min(1),
  sourceUrl: z.string().url(),
  eventOccurredAt: z.date(),
});
export type CreateAlertInput = z.infer<typeof CreateAlertInput>;

export const ListAlertsInput = z.object({
  industries: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  category: z.enum(alertCategoryEnum.enumValues).optional(),
  severity: z.enum(severityEnum.enumValues).optional(),
  cursor: CursorSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListAlertsInput = z.infer<typeof ListAlertsInput>;

export async function createAlert(input: CreateAlertInput): Promise<Alert> {
  const parsed = CreateAlertInput.parse(input);
  const [row] = await db.insert(alerts).values(parsed).returning();
  if (!row) throw new Error('Insert did not return a row');
  return row;
}

export async function getAlertById(id: string): Promise<Alert | undefined> {
  const [row] = await db
    .select()
    .from(alerts)
    .where(eq(alerts.id, id))
    .limit(1);
  return row;
}

export async function listAlerts(input: Partial<ListAlertsInput> = {}): Promise<{
  data: Alert[];
  nextCursor: { createdAt: string; id: string } | null;
}> {
  const { industries, regions, category, severity, cursor, limit } =
    ListAlertsInput.parse(input);

  const rows = await db
    .select()
    .from(alerts)
    .where(
      and(
        industries?.length ? arrayOverlaps(alerts.industries, industries) : undefined,
        regions?.length ? arrayOverlaps(alerts.regions, regions) : undefined,
        category ? eq(alerts.category, category) : undefined,
        severity ? eq(alerts.severity, severity) : undefined,
        cursor
          ? or(
              lt(alerts.createdAt, new Date(cursor.createdAt)),
              and(
                eq(alerts.createdAt, new Date(cursor.createdAt)),
                gt(alerts.id, cursor.id),
              ),
            )
          : undefined,
      ),
    )
    .orderBy(desc(alerts.createdAt), asc(alerts.id))
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

export async function listAlertDeliveries(
  alertId: string,
): Promise<AlertDelivery[]> {
  return db
    .select()
    .from(alertDeliveries)
    .where(eq(alertDeliveries.alertId, alertId))
    .orderBy(asc(alertDeliveries.sentAt));
}

// ── Alert Rules ──────────────────────────────────────────────────────────────

export { AlertEvent, AlertRule };

export const CreateAlertRuleInput = z.object({
  indicatorId: z.string().uuid(),
  name: z.string().min(1).max(200),
  condition: z.enum(alertConditionEnum.enumValues),
  threshold: z.string().refine((v) => !Number.isNaN(Number(v)), {
    message: 'threshold must be numeric',
  }),
  windowDays: z.number().int().min(1).max(3650).nullable(),
  channels: z.array(z.enum(['email', 'sms', 'in_app'])).min(1),
});
export type CreateAlertRuleInput = z.infer<typeof CreateAlertRuleInput>;

export const UpdateAlertRuleInput = z.object({
  name: z.string().min(1).max(200).optional(),
  condition: z.enum(alertConditionEnum.enumValues).optional(),
  threshold: z
    .string()
    .refine((v) => !Number.isNaN(Number(v)), { message: 'threshold must be numeric' })
    .optional(),
  windowDays: z.number().int().min(1).max(3650).nullable().optional(),
  channels: z.array(z.enum(['email', 'sms', 'in_app'])).min(1).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateAlertRuleInput = z.infer<typeof UpdateAlertRuleInput>;

export async function createAlertRule(
  orgId: string,
  createdBy: string,
  input: CreateAlertRuleInput,
): Promise<AlertRule> {
  const parsed = CreateAlertRuleInput.parse(input);
  const [row] = await db
    .insert(alertRules)
    .values({ orgId, createdBy, ...parsed })
    .returning();
  if (!row) throw new Error('Insert did not return a row');
  return row;
}

export async function updateAlertRule(
  id: string,
  orgId: string,
  input: UpdateAlertRuleInput,
): Promise<AlertRule> {
  const parsed = UpdateAlertRuleInput.parse(input);
  const [row] = await db
    .update(alertRules)
    .set({ ...parsed, updatedAt: new Date() })
    .where(and(eq(alertRules.id, id), eq(alertRules.orgId, orgId)))
    .returning();
  if (!row) throw new Error('Alert rule not found or access denied');
  return row;
}

export async function deleteAlertRule(id: string, orgId: string): Promise<void> {
  const result = await db
    .delete(alertRules)
    .where(and(eq(alertRules.id, id), eq(alertRules.orgId, orgId)));
  if (result.rowCount === 0) throw new Error('Alert rule not found or access denied');
}

export async function listAlertRules(orgId: string): Promise<AlertRule[]> {
  return db
    .select()
    .from(alertRules)
    .where(eq(alertRules.orgId, orgId))
    .orderBy(desc(alertRules.createdAt));
}

export async function listActiveAlertRules(): Promise<AlertRule[]> {
  return db
    .select()
    .from(alertRules)
    .where(eq(alertRules.isActive, true))
    .orderBy(asc(alertRules.createdAt));
}

export async function getAlertRuleById(
  id: string,
  orgId: string,
): Promise<AlertRule | undefined> {
  const [row] = await db
    .select()
    .from(alertRules)
    .where(and(eq(alertRules.id, id), eq(alertRules.orgId, orgId)))
    .limit(1);
  return row;
}

// ── Alert Events ─────────────────────────────────────────────────────────────

export async function createAlertEvent(input: {
  ruleId: string;
  triggeredValue: string;
  emailStatus?: string | null;
  smsStatus?: string | null;
  inAppStatus?: string | null;
}): Promise<AlertEvent> {
  const [row] = await db
    .insert(alertEvents)
    .values(input)
    .returning();
  if (!row) throw new Error('Insert did not return a row');
  return row;
}

export async function updateAlertEventStatus(
  id: string,
  patch: Partial<Pick<AlertEvent, 'emailStatus' | 'smsStatus' | 'inAppStatus'>>,
): Promise<void> {
  await db.update(alertEvents).set(patch).where(eq(alertEvents.id, id));
}

export async function listAlertEvents(ruleId: string, limit = 20): Promise<AlertEvent[]> {
  return db
    .select()
    .from(alertEvents)
    .where(eq(alertEvents.ruleId, ruleId))
    .orderBy(desc(alertEvents.triggeredAt))
    .limit(limit);
}

export async function getIndicatorSeries(
  indicatorId: string,
  windowDays: number,
): Promise<Array<{ value: string; observedAt: Date }>> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  return db
    .select({ value: indicatorValues.value, observedAt: indicatorValues.observedAt })
    .from(indicatorValues)
    .where(
      and(
        eq(indicatorValues.indicatorId, indicatorId),
        gte(indicatorValues.observedAt, since),
      ),
    )
    .orderBy(asc(indicatorValues.observedAt));
}
