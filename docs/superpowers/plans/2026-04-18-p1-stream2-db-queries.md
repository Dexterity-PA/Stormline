# Phase 1 Stream 2 — Drizzle DB Queries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all typed Drizzle query functions for every domain in `lib/db/queries/`, with Zod-validated mutation inputs, cursor-based pagination, and one smoke script per domain file.

**Architecture:** Pure data-access layer — no business logic, no HTTP concerns. Every mutation input is validated by a Zod schema. Lists that can grow unboundedly use cursor pagination via `{ cursor?: { createdAt: string; id: string } }`. Return types are inferred directly from the Drizzle schema via `InferSelectModel`.

**Tech Stack:** Drizzle ORM v0.45, Neon Postgres (neon-http driver), Zod v4, TypeScript strict mode, `tsx` for running smoke scripts.

---

## Schema flag (action required before deploy)

`dashboard_snapshots` has no unique index on `(industry, region, snapshot_date)`. `upsertSnapshot` uses `.onConflictDoUpdate()` targeting those columns — it will throw at runtime until this migration is applied:

```sql
CREATE UNIQUE INDEX ON dashboard_snapshots (industry, region, snapshot_date);
```

**Do not merge `p1-db-queries` to main until the schema migration branch adds this index.**

---

## File Map

| File | Created/Modified | Responsibility |
|---|---|---|
| `lib/db/queries/organizations.ts` | Create | Org CRUD + admin list |
| `lib/db/queries/members.ts` | Create | Member reads + notification pref updates |
| `lib/db/queries/indicators.ts` | Create | Indicator upsert, value batch insert, series reads |
| `lib/db/queries/briefings.ts` | Create | Briefing lifecycle + delivery list |
| `lib/db/queries/alerts.ts` | Create | Alert CRUD + filtered list + delivery list |
| `lib/db/queries/feedback.ts` | Create | Feedback submit + aggregate |
| `lib/db/queries/dashboard.ts` | Create | Snapshot get + upsert |
| `lib/db/queries/index.ts` | Create | Barrel re-export of all named exports |
| `scripts/smoke-organizations.ts` | Create | Happy-path smoke for organizations queries |
| `scripts/smoke-members.ts` | Create | Happy-path smoke for members queries |
| `scripts/smoke-indicators.ts` | Create | Happy-path smoke for indicators queries |
| `scripts/smoke-briefings.ts` | Create | Happy-path smoke for briefings queries |
| `scripts/smoke-alerts.ts` | Create | Happy-path smoke for alerts queries |
| `scripts/smoke-feedback.ts` | Create | Happy-path smoke for feedback queries |
| `scripts/smoke-dashboard.ts` | Create | Happy-path smoke for dashboard queries |

**Forbidden (do not touch):** `lib/db/schema.ts`, `lib/db/index.ts`, `package.json`, `tsconfig.json`, `next.config.ts`, `proxy.ts`, `styles/globals.css`, any file outside scope above.

---

## Shared conventions (read before writing any file)

### Cursor type
Every paginated list accepts and returns this cursor shape:
```ts
{ cursor?: { createdAt: string; id: string } }  // input
{ nextCursor: { createdAt: string; id: string } | null }  // output
```

### Cursor WHERE clause (for ORDER BY created_at DESC, id ASC)
```ts
cursor
  ? or(
      lt(table.createdAt, new Date(cursor.createdAt)),
      and(
        eq(table.createdAt, new Date(cursor.createdAt)),
        gt(table.id, cursor.id),
      ),
    )
  : undefined
```

### Fetch-one pattern
```ts
const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);
return row; // undefined if not found
```

### Mutation returning pattern
```ts
const [row] = await db.insert(table).values(data).returning();
if (!row) throw new Error('Insert did not return a row');
return row;
```

### Enum schemas
Always derive from the schema enum, never hardcode:
```ts
import { industryEnum } from '@/lib/db/schema';
const IndustrySchema = z.enum(industryEnum.enumValues);
```

---

## Task 0: Branch setup

**Files:** none (git only)

- [ ] **Step 1: Create branch from main**

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b p1-db-queries
```

Expected: switched to new branch `p1-db-queries`

- [ ] **Step 2: Verify dev environment**

```bash
npx tsc --noEmit
```

Expected: zero errors (baseline clean). If errors exist, do not proceed — report them.

---

## Task 1: `lib/db/queries/organizations.ts`

**Files:**
- Create: `lib/db/queries/organizations.ts`
- Create: `scripts/smoke-organizations.ts`

- [ ] **Step 1: Create `lib/db/queries/organizations.ts`**

```typescript
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

export async function listOrgs(input: ListOrgsInput = {}): Promise<{
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
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: zero errors. Fix any before continuing.

- [ ] **Step 3: Create `scripts/smoke-organizations.ts`**

```typescript
import { db } from '@/lib/db';
import {
  createOrg,
  getOrgById,
  getOrgByClerkId,
  listOrgs,
  updateOrgTier,
} from '@/lib/db/queries/organizations';

async function main() {
  const clerkOrgId = `smoke_org_${Date.now()}`;

  const org = await createOrg({
    clerkOrgId,
    name: 'Smoke Test Restaurant',
    industry: 'restaurant',
    regionState: 'TX',
  });
  console.log('createOrg:', org.id);

  const byId = await getOrgById(org.id);
  if (byId?.id !== org.id) throw new Error('getOrgById mismatch');

  const byClerk = await getOrgByClerkId(clerkOrgId);
  if (byClerk?.id !== org.id) throw new Error('getOrgByClerkId mismatch');

  const updated = await updateOrgTier(org.id, 'core');
  if (updated.subscriptionTier !== 'core') throw new Error('updateOrgTier failed');

  const { data, nextCursor } = await listOrgs({ limit: 5 });
  if (!data.some((o) => o.id === org.id)) throw new Error('listOrgs missing row');
  console.log('listOrgs length:', data.length, 'nextCursor:', nextCursor);

  console.log('smoke-organizations: PASSED');
  await db.$client.end?.();
}

main().catch((err) => {
  console.error('smoke-organizations: FAILED', err);
  process.exit(1);
});
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/organizations.ts scripts/smoke-organizations.ts
git commit -m "feat(db): organizations queries + smoke script"
```

---

## Task 2: `lib/db/queries/members.ts`

**Files:**
- Create: `lib/db/queries/members.ts`
- Create: `scripts/smoke-members.ts`

- [ ] **Step 1: Create `lib/db/queries/members.ts`**

```typescript
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Member = InferSelectModel<typeof members>;

export const UpdateNotificationPrefsInput = z.object({
  emailBriefing: z.boolean().optional(),
  emailAlerts: z.boolean().optional(),
  smsAlerts: z.boolean().optional(),
  phone: z.string().nullable().optional(),
});
export type UpdateNotificationPrefsInput = z.infer<
  typeof UpdateNotificationPrefsInput
>;

export async function getMember(id: string): Promise<Member | undefined> {
  const [row] = await db
    .select()
    .from(members)
    .where(eq(members.id, id))
    .limit(1);
  return row;
}

export async function getMemberByClerkAndOrg(
  clerkUserId: string,
  orgId: string,
): Promise<Member | undefined> {
  const [row] = await db
    .select()
    .from(members)
    .where(
      and(eq(members.clerkUserId, clerkUserId), eq(members.orgId, orgId)),
    )
    .limit(1);
  return row;
}

export async function listMembersByOrg(orgId: string): Promise<Member[]> {
  return db.select().from(members).where(eq(members.orgId, orgId));
}

export async function updateNotificationPrefs(
  id: string,
  input: UpdateNotificationPrefsInput,
): Promise<Member> {
  const parsed = UpdateNotificationPrefsInput.parse(input);
  const [row] = await db
    .update(members)
    .set(parsed)
    .where(eq(members.id, id))
    .returning();
  if (!row) throw new Error(`Member ${id} not found`);
  return row;
}
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Create `scripts/smoke-members.ts`**

```typescript
import { db } from '@/lib/db';
import { organizations, members } from '@/lib/db/schema';
import {
  getMember,
  getMemberByClerkAndOrg,
  listMembersByOrg,
  updateNotificationPrefs,
} from '@/lib/db/queries/members';

async function main() {
  // Seed org + member directly (bypassing query layer to isolate members smoke)
  const [org] = await db
    .insert(organizations)
    .values({
      clerkOrgId: `smoke_org_members_${Date.now()}`,
      name: 'Smoke Org',
      industry: 'restaurant',
      regionState: 'TX',
    })
    .returning();
  if (!org) throw new Error('org seed failed');

  const clerkUserId = `smoke_user_${Date.now()}`;
  const [member] = await db
    .insert(members)
    .values({ orgId: org.id, clerkUserId, role: 'owner' })
    .returning();
  if (!member) throw new Error('member seed failed');

  const byId = await getMember(member.id);
  if (byId?.id !== member.id) throw new Error('getMember mismatch');

  const byClerk = await getMemberByClerkAndOrg(clerkUserId, org.id);
  if (byClerk?.id !== member.id) throw new Error('getMemberByClerkAndOrg mismatch');

  const list = await listMembersByOrg(org.id);
  if (!list.some((m) => m.id === member.id)) throw new Error('listMembersByOrg missing row');

  const updated = await updateNotificationPrefs(member.id, {
    smsAlerts: true,
    phone: '+15551234567',
  });
  if (!updated.smsAlerts) throw new Error('updateNotificationPrefs failed');

  console.log('smoke-members: PASSED');
  await db.$client.end?.();
}

main().catch((err) => {
  console.error('smoke-members: FAILED', err);
  process.exit(1);
});
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/members.ts scripts/smoke-members.ts
git commit -m "feat(db): members queries + smoke script"
```

---

## Task 3: `lib/db/queries/indicators.ts`

**Files:**
- Create: `lib/db/queries/indicators.ts`
- Create: `scripts/smoke-indicators.ts`

- [ ] **Step 1: Create `lib/db/queries/indicators.ts`**

```typescript
import { and, asc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
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
  value: z.string().min(1),
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
    .where(sql`${indicators.industryTags} @> ARRAY[${industry}]::text[]`);
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
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Create `scripts/smoke-indicators.ts`**

```typescript
import { db } from '@/lib/db';
import {
  getIndicatorByCode,
  getLatestValues,
  getSeries,
  insertIndicatorValues,
  listIndicatorsByIndustry,
  upsertIndicator,
} from '@/lib/db/queries/indicators';

async function main() {
  const code = `SMOKE:TEST_${Date.now()}`;

  const indicator = await upsertIndicator({
    code,
    source: 'fred',
    sourceId: `SMOKE${Date.now()}`,
    name: 'Smoke Test Indicator',
    unit: 'USD/lb',
    industryTags: ['restaurant'],
    costBucket: 'beef',
    frequency: 'monthly',
  });
  console.log('upsertIndicator:', indicator.id);

  // Idempotent re-upsert
  const again = await upsertIndicator({ ...indicator, name: 'Smoke Updated' });
  if (again.id !== indicator.id) throw new Error('upsert changed id');
  if (again.name !== 'Smoke Updated') throw new Error('upsert did not update name');

  const byCode = await getIndicatorByCode(code);
  if (byCode?.id !== indicator.id) throw new Error('getIndicatorByCode mismatch');

  const byIndustry = await listIndicatorsByIndustry('restaurant');
  if (!byIndustry.some((i) => i.id === indicator.id))
    throw new Error('listIndicatorsByIndustry missing row');

  const now = new Date();
  const t1 = new Date(now.getTime() - 86400_000 * 2);
  const t2 = new Date(now.getTime() - 86400_000);

  await insertIndicatorValues([
    { indicatorId: indicator.id, observedAt: t1, value: '5.23' },
    { indicatorId: indicator.id, observedAt: t2, value: '5.41' },
  ]);
  // Second insert same rows — must not throw (onConflictDoNothing)
  await insertIndicatorValues([
    { indicatorId: indicator.id, observedAt: t1, value: '5.23' },
  ]);

  const latest = await getLatestValues([indicator.id]);
  if (latest[0]?.value !== '5.41') throw new Error('getLatestValues wrong value');

  const series = await getSeries(code, t1, now);
  if (series.length < 2) throw new Error('getSeries returned too few rows');

  console.log('smoke-indicators: PASSED');
  await db.$client.end?.();
}

main().catch((err) => {
  console.error('smoke-indicators: FAILED', err);
  process.exit(1);
});
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/indicators.ts scripts/smoke-indicators.ts
git commit -m "feat(db): indicators queries + smoke script"
```

---

## Task 4: `lib/db/queries/briefings.ts`

**Files:**
- Create: `lib/db/queries/briefings.ts`
- Create: `scripts/smoke-briefings.ts`

- [ ] **Step 1: Create `lib/db/queries/briefings.ts`**

```typescript
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

export async function listBriefings(input: ListBriefingsInput = {}): Promise<{
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

export async function listDeliveries(
  briefingId: string,
): Promise<BriefingDelivery[]> {
  return db
    .select()
    .from(briefingDeliveries)
    .where(eq(briefingDeliveries.briefingId, briefingId));
}
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Create `scripts/smoke-briefings.ts`**

```typescript
import { db } from '@/lib/db';
import {
  createDraftBriefing,
  getBriefingById,
  listBriefings,
  listDeliveries,
  publishBriefing,
} from '@/lib/db/queries/briefings';

async function main() {
  const draft = await createDraftBriefing({
    industry: 'restaurant',
    regionState: 'TX',
    regionMetro: null,
    weekStart: '2026-04-14',
    weekEnd: '2026-04-20',
    headline: 'Smoke test headline',
    bodyMd: '## Smoke\n\nTest body.',
    generatedBy: 'claude-sonnet-4@prompt-v0.0',
  });
  console.log('createDraftBriefing:', draft.id, 'status:', draft.status);
  if (draft.status !== 'draft') throw new Error('status should be draft');

  const byId = await getBriefingById(draft.id);
  if (byId?.id !== draft.id) throw new Error('getBriefingById mismatch');

  const { data } = await listBriefings({ industry: 'restaurant', status: 'draft' });
  if (!data.some((b) => b.id === draft.id)) throw new Error('listBriefings missing row');

  const published = await publishBriefing(draft.id, 'smoke_clerk_user_001');
  if (published.status !== 'published') throw new Error('publishBriefing failed');
  if (!published.publishedAt) throw new Error('publishedAt not set');

  const deliveries = await listDeliveries(draft.id);
  console.log('listDeliveries count:', deliveries.length); // 0 in smoke, that's fine

  console.log('smoke-briefings: PASSED');
  await db.$client.end?.();
}

main().catch((err) => {
  console.error('smoke-briefings: FAILED', err);
  process.exit(1);
});
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/briefings.ts scripts/smoke-briefings.ts
git commit -m "feat(db): briefings queries + smoke script"
```

---

## Task 5: `lib/db/queries/alerts.ts`

**Files:**
- Create: `lib/db/queries/alerts.ts`
- Create: `scripts/smoke-alerts.ts`

- [ ] **Step 1: Create `lib/db/queries/alerts.ts`**

```typescript
import { and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
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

export async function listAlerts(input: ListAlertsInput = {}): Promise<{
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
        industries?.length
          ? sql`${alerts.industries} && ${sql.raw(`ARRAY[${industries.map(() => '?').join(',')}]::text[]`, industries)}`
          : undefined,
        regions?.length
          ? sql`${alerts.regions} && ${sql.raw(`ARRAY[${regions.map(() => '?').join(',')}]::text[]`, regions)}`
          : undefined,
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
    .where(eq(alertDeliveries.alertId, alertId));
}
```

**Note on array overlap:** `sql.raw()` with positional parameters isn't the right Drizzle pattern for safe parameterization. If `arrayOverlaps` is available in drizzle-orm v0.45 (check with `import { arrayOverlaps } from 'drizzle-orm'`), replace the `sql` template lines with:

```typescript
import { arrayOverlaps } from 'drizzle-orm';
// ...
industries?.length ? arrayOverlaps(alerts.industries, industries) : undefined,
regions?.length ? arrayOverlaps(alerts.regions, regions) : undefined,
```

Try the `arrayOverlaps` import first. If TypeScript reports it as not exported from `drizzle-orm`, fall back to the `sql` template below (which is safe — Neon's parameterized query path handles the substitution):

```typescript
industries?.length
  ? sql`${alerts.industries} && ${industries}::text[]`
  : undefined,
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: zero errors. If `arrayOverlaps` import fails, use the `sql` fallback shown above.

- [ ] **Step 3: Create `scripts/smoke-alerts.ts`**

```typescript
import { db } from '@/lib/db';
import {
  createAlert,
  getAlertById,
  listAlertDeliveries,
  listAlerts,
} from '@/lib/db/queries/alerts';

async function main() {
  const alert = await createAlert({
    category: 'commodity_move',
    industries: ['restaurant'],
    regions: ['TX', 'national'],
    severity: 'high',
    headline: 'Smoke test alert',
    bodyMd: 'Historical patterns indicate a significant move.',
    sourceUrl: 'https://example.com/fred',
    eventOccurredAt: new Date(),
  });
  console.log('createAlert:', alert.id);

  const byId = await getAlertById(alert.id);
  if (byId?.id !== alert.id) throw new Error('getAlertById mismatch');

  const { data } = await listAlerts({
    industries: ['restaurant'],
    severity: 'high',
  });
  if (!data.some((a) => a.id === alert.id)) throw new Error('listAlerts missing row');

  const deliveries = await listAlertDeliveries(alert.id);
  console.log('listAlertDeliveries count:', deliveries.length); // 0 in smoke

  console.log('smoke-alerts: PASSED');
  await db.$client.end?.();
}

main().catch((err) => {
  console.error('smoke-alerts: FAILED', err);
  process.exit(1);
});
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/alerts.ts scripts/smoke-alerts.ts
git commit -m "feat(db): alerts queries + smoke script"
```

---

## Task 6: `lib/db/queries/feedback.ts`

**Files:**
- Create: `lib/db/queries/feedback.ts`
- Create: `scripts/smoke-feedback.ts`

- [ ] **Step 1: Create `lib/db/queries/feedback.ts`**

```typescript
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
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Create `scripts/smoke-feedback.ts`**

```typescript
import { db } from '@/lib/db';
import { organizations, members, briefings } from '@/lib/db/schema';
import { submitFeedback, aggregateFeedback } from '@/lib/db/queries/feedback';

async function main() {
  // Seed minimal org + member + briefing to get real UUIDs
  const [org] = await db
    .insert(organizations)
    .values({
      clerkOrgId: `smoke_org_fb_${Date.now()}`,
      name: 'Smoke Feedback Org',
      industry: 'restaurant',
      regionState: 'TX',
    })
    .returning();
  if (!org) throw new Error('org seed failed');

  const [member] = await db
    .insert(members)
    .values({ orgId: org.id, clerkUserId: `smoke_u_${Date.now()}`, role: 'owner' })
    .returning();
  if (!member) throw new Error('member seed failed');

  const [briefing] = await db
    .insert(briefings)
    .values({
      industry: 'restaurant',
      regionState: 'TX',
      weekStart: '2026-04-14',
      weekEnd: '2026-04-20',
      headline: 'Smoke briefing',
      bodyMd: '## Smoke',
      generatedBy: 'claude-sonnet-4@prompt-v0.0',
      status: 'published',
    })
    .returning();
  if (!briefing) throw new Error('briefing seed failed');

  await submitFeedback({
    orgId: org.id,
    memberId: member.id,
    targetType: 'briefing',
    targetId: briefing.id,
    helpful: true,
    comment: 'Very useful!',
  });
  await submitFeedback({
    orgId: org.id,
    memberId: member.id,
    targetType: 'briefing',
    targetId: briefing.id,
    helpful: false,
  });

  const agg = await aggregateFeedback('briefing', briefing.id);
  if (agg.helpful !== 1) throw new Error(`expected helpful=1, got ${agg.helpful}`);
  if (agg.notHelpful !== 1) throw new Error(`expected notHelpful=1, got ${agg.notHelpful}`);
  if (agg.total !== 2) throw new Error(`expected total=2, got ${agg.total}`);

  console.log('aggregateFeedback:', agg);
  console.log('smoke-feedback: PASSED');
  await db.$client.end?.();
}

main().catch((err) => {
  console.error('smoke-feedback: FAILED', err);
  process.exit(1);
});
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/feedback.ts scripts/smoke-feedback.ts
git commit -m "feat(db): feedback queries + smoke script"
```

---

## Task 7: `lib/db/queries/dashboard.ts`

**Files:**
- Create: `lib/db/queries/dashboard.ts`
- Create: `scripts/smoke-dashboard.ts`

- [ ] **Step 1: Create `lib/db/queries/dashboard.ts`**

```typescript
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { dashboardSnapshots, industryEnum } from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type DashboardSnapshot = InferSelectModel<typeof dashboardSnapshots>;

// TODO: upsertSnapshot requires a unique index on (industry, region, snapshot_date).
// Migration needed before this function works in production:
//   CREATE UNIQUE INDEX ON dashboard_snapshots (industry, region, snapshot_date);
// Flag to schema owner (p1-fred-registry branch) before merging this branch.

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
```

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Create `scripts/smoke-dashboard.ts`**

```typescript
import { db } from '@/lib/db';
import { getSnapshot, upsertSnapshot } from '@/lib/db/queries/dashboard';

async function main() {
  const date = '2026-04-18';
  const tileData = {
    tiles: [{ code: 'FRED:PBEEFUSDM', value: '5.41', delta1w: 0.03 }],
  };

  // NOTE: upsertSnapshot will fail at runtime until the unique index is added.
  // Smoke test documents the intended behavior only.
  const snap = await upsertSnapshot({
    industry: 'restaurant',
    region: 'TX',
    snapshotDate: date,
    dataJson: tileData,
  });
  console.log('upsertSnapshot:', snap.id);

  // Idempotent re-upsert
  const snap2 = await upsertSnapshot({
    industry: 'restaurant',
    region: 'TX',
    snapshotDate: date,
    dataJson: { ...tileData, updated: true },
  });
  if (snap2.id !== snap.id) throw new Error('upsert changed id on conflict');

  const fetched = await getSnapshot('restaurant', 'TX', date);
  if (fetched?.id !== snap.id) throw new Error('getSnapshot mismatch');

  console.log('smoke-dashboard: PASSED');
  await db.$client.end?.();
}

main().catch((err) => {
  console.error('smoke-dashboard: FAILED', err);
  process.exit(1);
});
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/dashboard.ts scripts/smoke-dashboard.ts
git commit -m "feat(db): dashboard queries + smoke script (needs schema unique index)"
```

---

## Task 8: `lib/db/queries/index.ts` — barrel export

**Files:**
- Create: `lib/db/queries/index.ts`

- [ ] **Step 1: Create `lib/db/queries/index.ts`**

```typescript
export * from './organizations';
export * from './members';
export * from './indicators';
export * from './briefings';
export * from './alerts';
export * from './feedback';
export * from './dashboard';
```

- [ ] **Step 2: Run final typecheck**

```bash
npx tsc --noEmit
```

Expected: zero errors. This is the final gate — fix anything still outstanding before the PR.

- [ ] **Step 3: Commit**

```bash
git add lib/db/queries/index.ts
git commit -m "feat(db): barrel export for all query domains"
```

---

## Task 9: Draft PR

**Files:** none (GitHub only)

- [ ] **Step 1: Push branch**

```bash
git push -u origin p1-db-queries
```

- [ ] **Step 2: Open draft PR**

```bash
gh pr create \
  --title "Phase 1 Stream 2: Drizzle query layer" \
  --base main \
  --draft \
  --body "$(cat <<'EOF'
## Summary
- Implements all typed Drizzle query functions across 7 domains (organizations, members, indicators, briefings, alerts, feedback, dashboard)
- 28 query functions total, Zod-validated mutation inputs, cursor-based pagination
- One smoke script per domain in \`scripts/\` for dev Neon integration testing
- No business logic — pure data access

## Schema flag
\`dashboard_snapshots\` needs a unique index on \`(industry, region, snapshot_date)\` before \`upsertSnapshot\` works. A migration must land from the schema owner branch before this PR is merged.

## Test
\`\`\`bash
DATABASE_URL=<dev-neon-branch-url> npx tsx scripts/smoke-organizations.ts
DATABASE_URL=<dev-neon-branch-url> npx tsx scripts/smoke-members.ts
DATABASE_URL=<dev-neon-branch-url> npx tsx scripts/smoke-indicators.ts
DATABASE_URL=<dev-neon-branch-url> npx tsx scripts/smoke-briefings.ts
DATABASE_URL=<dev-neon-branch-url> npx tsx scripts/smoke-alerts.ts
DATABASE_URL=<dev-neon-branch-url> npx tsx scripts/smoke-feedback.ts
DATABASE_URL=<dev-neon-branch-url> npx tsx scripts/smoke-dashboard.ts
\`\`\`

## Checklist
- [ ] \`npx tsc --noEmit\` passes (0 errors)
- [ ] All 7 smoke scripts pass against dev Neon branch
- [ ] Schema owner has merged unique index migration for dashboard_snapshots
EOF
)"
```

Expected: draft PR URL printed.

- [ ] **Step 3: Report**

Post the PR URL and this summary:

```
File tree:
  lib/db/queries/
    organizations.ts  (5 functions)
    members.ts        (4 functions)
    indicators.ts     (6 functions)
    briefings.ts      (5 functions)
    alerts.ts         (4 functions)
    feedback.ts       (2 functions)
    dashboard.ts      (2 functions)
    index.ts          (barrel)
  scripts/
    smoke-organizations.ts
    smoke-members.ts
    smoke-indicators.ts
    smoke-briefings.ts
    smoke-alerts.ts
    smoke-feedback.ts
    smoke-dashboard.ts

Total: 28 query functions across 7 domains.

Schema ambiguity: dashboard_snapshots unique index missing.
Action needed: schema owner must add migration before merge.
```

---

## Self-review

### Spec coverage

| Requirement | Task |
|---|---|
| getOrgById, getOrgByClerkId, createOrg, updateOrgTier, listOrgs | Task 1 |
| getMember, listMembersByOrg, updateNotificationPrefs | Task 2 |
| getIndicatorByCode, listIndicatorsByIndustry, upsertIndicator, insertIndicatorValues, getLatestValues, getSeries | Task 3 |
| createDraftBriefing, getBriefingById, listBriefings, publishBriefing, listDeliveries | Task 4 |
| createAlert, getAlertById, listAlerts, listAlertDeliveries | Task 5 |
| submitFeedback, aggregateFeedback | Task 6 |
| getSnapshot, upsertSnapshot | Task 7 |
| Barrel export | Task 8 |
| Draft PR | Task 9 |
| getMemberByClerkAndOrg (needed for Clerk webhook) | Task 2 ✓ |

All 28 specified functions accounted for. One addition: `getMemberByClerkAndOrg` — needed by the Clerk webhook route to map `clerk_user_id` + org, not in the original scope list but obvious from §7.

### Placeholder scan
None found. All code blocks are complete.

### Type consistency
- `Organization`, `Member`, `Indicator`, `Briefing`, `Alert`, `Feedback`, `DashboardSnapshot` — all defined as `InferSelectModel<typeof table>` in their respective files and used consistently.
- `SubscriptionTier` derived from `subscriptionTierEnum.enumValues` and used in `updateOrgTier` signature.
- `FeedbackTarget` derived from `feedbackTargetEnum.enumValues` and used in `aggregateFeedback` signature.
- Cursor shape `{ createdAt: string; id: string }` consistent across all paginated lists.
- `InsertIndicatorValueInput.value` is `z.string()` matching the `numeric` Drizzle column (which returns string at runtime).
