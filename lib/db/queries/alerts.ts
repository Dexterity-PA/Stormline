import { and, arrayOverlaps, asc, desc, eq, gt, lt, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  alertCategoryEnum,
  alertDeliveries,
  alerts,
  severityEnum,
} from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

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
