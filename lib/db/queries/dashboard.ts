import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { dashboardSnapshots, industryEnum } from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type DashboardSnapshot = InferSelectModel<typeof dashboardSnapshots>;

// TODO: upsertSnapshot requires a unique index on (industry, region, snapshot_date).
// This migration must be applied before upsertSnapshot works at runtime:
//   CREATE UNIQUE INDEX ON dashboard_snapshots (industry, region, snapshot_date);
// Flag to schema owner (p1-fred-registry / schema migration branch) before merging.

export const UpsertSnapshotInput = z.object({
  industry: z.enum(industryEnum.enumValues),
  region: z.string().min(1),
  snapshotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataJson: z.unknown(),
});
export type UpsertSnapshotInput = z.infer<typeof UpsertSnapshotInput>;

export async function getSnapshot(
  industry: (typeof industryEnum.enumValues)[number],
  region: string,
  date: string,
): Promise<DashboardSnapshot | undefined> {
  const [row] = await db
    .select()
    .from(dashboardSnapshots)
    .where(
      and(
        eq(dashboardSnapshots.industry, industry),
        eq(dashboardSnapshots.region, region),
        eq(dashboardSnapshots.snapshotDate, date),
      ),
    )
    .limit(1);
  return row;
}

export async function upsertSnapshot(
  input: UpsertSnapshotInput,
): Promise<DashboardSnapshot> {
  const parsed = UpsertSnapshotInput.parse(input);
  const [row] = await db
    .insert(dashboardSnapshots)
    .values(parsed)
    .onConflictDoUpdate({
      target: [
        dashboardSnapshots.industry,
        dashboardSnapshots.region,
        dashboardSnapshots.snapshotDate,
      ],
      set: { dataJson: parsed.dataJson, createdAt: new Date() },
    })
    .returning();
  if (!row) throw new Error('Upsert did not return a row');
  return row;
}
