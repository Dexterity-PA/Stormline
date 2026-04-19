import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db";
import { indicators } from "../db/schema";
import { indicatorObservations } from "../db/schema/observations";

export interface ObservationPoint {
  date: string;
  value: number;
}

const GetObservationsOptionsSchema = z
  .object({
    months: z.number().int().positive().max(600).optional(),
  })
  .default({});

const IndicatorIdSchema = z.string().uuid();

const UpsertPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  value: z.number().refine(Number.isFinite, "value must be a finite number"),
});
const UpsertPointsSchema = z.array(UpsertPointSchema);

export type UpsertObservationPoint = z.infer<typeof UpsertPointSchema>;

function monthsAgoIso(months: number): string {
  const now = new Date();
  const d = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - months,
      now.getUTCDate(),
    ),
  );
  return d.toISOString().slice(0, 10);
}

function toNumber(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`observation value is not finite: ${raw}`);
  }
  return n;
}

export async function getObservations(
  indicatorId: string,
  options: { months?: number } = {},
): Promise<ObservationPoint[]> {
  const id = IndicatorIdSchema.parse(indicatorId);
  const { months } = GetObservationsOptionsSchema.parse(options);

  const whereClause = months
    ? and(
        eq(indicatorObservations.indicatorId, id),
        gte(indicatorObservations.obsDate, monthsAgoIso(months)),
      )
    : eq(indicatorObservations.indicatorId, id);

  const rows = await db
    .select({
      date: indicatorObservations.obsDate,
      value: indicatorObservations.value,
    })
    .from(indicatorObservations)
    .where(whereClause)
    .orderBy(asc(indicatorObservations.obsDate));

  return rows.map((r) => ({ date: r.date, value: toNumber(r.value) }));
}

export async function getLatestObservation(
  indicatorId: string,
): Promise<ObservationPoint | null> {
  const id = IndicatorIdSchema.parse(indicatorId);

  const [row] = await db
    .select({
      date: indicatorObservations.obsDate,
      value: indicatorObservations.value,
    })
    .from(indicatorObservations)
    .where(eq(indicatorObservations.indicatorId, id))
    .orderBy(desc(indicatorObservations.obsDate))
    .limit(1);

  return row ? { date: row.date, value: toNumber(row.value) } : null;
}

export async function getObservationsForCodes(
  codes: string[],
  months: number,
): Promise<Record<string, ObservationPoint[]>> {
  const parsedCodes = z
    .array(z.string().min(1))
    .min(0)
    .max(500)
    .parse(codes);
  const parsedMonths = z.number().int().positive().max(600).parse(months);

  const result: Record<string, ObservationPoint[]> = {};
  if (parsedCodes.length === 0) return result;
  for (const code of parsedCodes) result[code] = [];

  const since = monthsAgoIso(parsedMonths);

  const rows = await db
    .select({
      code: indicators.code,
      date: indicatorObservations.obsDate,
      value: indicatorObservations.value,
    })
    .from(indicatorObservations)
    .innerJoin(
      indicators,
      eq(indicatorObservations.indicatorId, indicators.id),
    )
    .where(
      and(
        inArray(indicators.code, parsedCodes),
        gte(indicatorObservations.obsDate, since),
      ),
    )
    .orderBy(asc(indicatorObservations.obsDate));

  for (const row of rows) {
    const bucket = result[row.code];
    if (!bucket) continue;
    bucket.push({ date: row.date, value: toNumber(row.value) });
  }
  return result;
}

export async function upsertObservations(
  indicatorId: string,
  points: UpsertObservationPoint[],
): Promise<{ inserted: number; skipped: number }> {
  const id = IndicatorIdSchema.parse(indicatorId);
  const parsed = UpsertPointsSchema.parse(points);
  if (parsed.length === 0) return { inserted: 0, skipped: 0 };

  const rows = parsed.map((p) => ({
    indicatorId: id,
    obsDate: p.date,
    value: String(p.value),
  }));

  const inserted = await db
    .insert(indicatorObservations)
    .values(rows)
    .onConflictDoNothing({
      target: [
        indicatorObservations.indicatorId,
        indicatorObservations.obsDate,
      ],
    })
    .returning({ id: indicatorObservations.id });

  return {
    inserted: inserted.length,
    skipped: rows.length - inserted.length,
  };
}
