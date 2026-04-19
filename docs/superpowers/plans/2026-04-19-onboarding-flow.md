# Onboarding Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 5-step onboarding wizard that collects industry, region, and business profile, runs a Claude profiler to recommend indicators, then guards `/app/*` routes behind a completion check.

**Architecture:** Multi-step wizard in `app/onboarding/` (server shell + `'use client'` wizard component). Wizard state persisted to `onboarding_state` table via Server Actions after each step. Claude profiler fires non-blocking after Step 3 profile write; Step 4 shows retry button if AI recs haven't arrived yet. Middleware in `proxy.ts` redirects incomplete users to `/onboarding`, using a `sl-ob` cookie to skip the DB check on repeat visits.

**Tech Stack:** Next.js 16 App Router, Drizzle + Neon HTTP, Clerk (`@clerk/nextjs/server`), Anthropic SDK (`@anthropic-ai/sdk`), Tailwind v4 + `--sl-*` tokens. No new npm dependencies.

**Spec:** `docs/superpowers/specs/2026-04-19-onboarding-flow-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/db/queries/onboarding.ts` | Create | DB read/write for `onboarding_state` + `industry_profile_schemas` |
| `scripts/seed-industry-profiles.ts` | Create | Authoritative seed for `industry_profile_schemas` |
| `lib/llm/prompts/onboarding-profiler-v1.ts` | Create | Versioned prompt: system prompt + user prompt builder |
| `lib/onboarding/profiler.ts` | Create | `runProfiler()` — Anthropic tool-use call |
| `lib/onboarding/actions.ts` | Create | Server Actions: upsert state, run profiler, complete onboarding |
| `components/onboarding/DynamicProfileForm.tsx` | Create | Renders jsonb field schema; handles validation |
| `components/onboarding/OnboardingWizard.tsx` | Create | Client wizard: all 5 steps + helper components |
| `app/onboarding/page.tsx` | Create | Server shell: fetches state + schemas, renders wizard |
| `proxy.ts` | Modify | Add onboarding guard after Clerk auth protect |

---

## Task 1: DB Queries

**Files:**
- Create: `lib/db/queries/onboarding.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/db/queries/onboarding.ts
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { industryProfileSchemas, onboardingState } from '@/lib/db/schema';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type OnboardingState = InferSelectModel<typeof onboardingState>;
export type IndustryProfileSchema = InferSelectModel<typeof industryProfileSchemas>;
export type OnboardingPatch = Omit<
  Partial<InferInsertModel<typeof onboardingState>>,
  'orgId'
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
  return db.select().from(industryProfileSchemas);
}

export async function getIndustryProfileSchema(
  industry: 'restaurant' | 'construction' | 'retail',
): Promise<IndustryProfileSchema | undefined> {
  const [row] = await db
    .select()
    .from(industryProfileSchemas)
    .where(eq(industryProfileSchemas.industry, industry))
    .limit(1);
  return row;
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db/queries/onboarding.ts
git commit -m "feat(onboarding): db queries for onboarding_state and industry_profile_schemas"
```

---

## Task 2: Seed Script

**Files:**
- Create: `scripts/seed-industry-profiles.ts`

- [ ] **Step 1: Create the file**

```typescript
// scripts/seed-industry-profiles.ts
/**
 * Seeds industry_profile_schemas with declarative form field definitions.
 * Idempotent: re-running overwrites fields and bumps schema_version (authoritative).
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/seed-industry-profiles.ts
 */
import { db } from '@/lib/db';
import { industryProfileSchemas } from '@/lib/db/schema';

type FieldType = 'text' | 'select' | 'multiselect' | 'number' | 'bool';

interface ProfileField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  helper?: string;
}

const RESTAURANT_FIELDS: ProfileField[] = [
  { key: 'cuisine_type', label: 'Cuisine type', type: 'text', required: true },
  {
    key: 'service_model',
    label: 'Service model',
    type: 'select',
    options: ['fast_casual', 'full_service', 'qsr', 'fine_dining'],
    required: true,
  },
  { key: 'seats', label: 'Seats', type: 'number' },
  { key: 'locations_count', label: 'Number of locations', type: 'number', required: true },
  { key: 'avg_check', label: 'Average check ($)', type: 'number' },
  {
    key: 'primary_proteins',
    label: 'Primary proteins',
    type: 'multiselect',
    options: ['beef', 'chicken', 'pork', 'seafood', 'plant_based', 'other'],
  },
  {
    key: 'primary_produce',
    label: 'Primary produce',
    type: 'multiselect',
    options: ['lettuce', 'tomatoes', 'avocado', 'citrus', 'root_veg', 'other'],
  },
  { key: 'alcohol_license', label: 'Alcohol license', type: 'bool' },
  { key: 'delivery_share_pct', label: 'Delivery % of sales', type: 'number' },
  {
    key: 'labor_model',
    label: 'Labor model',
    type: 'select',
    options: ['tipped', 'no_tip', 'hybrid'],
    required: true,
  },
  {
    key: 'peak_meal_periods',
    label: 'Peak meal periods',
    type: 'multiselect',
    options: ['breakfast', 'lunch', 'dinner', 'late_night'],
  },
];

const CONSTRUCTION_FIELDS: ProfileField[] = [
  { key: 'trade_type', label: 'Trade / specialty', type: 'text', required: true },
  {
    key: 'project_types',
    label: 'Project types',
    type: 'multiselect',
    options: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
  },
  { key: 'crew_size', label: 'Crew size', type: 'number' },
  { key: 'union_status', label: 'Union', type: 'bool' },
  { key: 'bonded', label: 'Bonded', type: 'bool' },
  {
    key: 'primary_materials',
    label: 'Primary materials',
    type: 'multiselect',
    options: ['lumber', 'steel', 'concrete', 'copper', 'pvc', 'drywall', 'roofing', 'other'],
  },
  { key: 'equipment_fleet_size', label: 'Equipment fleet size', type: 'number' },
  {
    key: 'typical_project_value_range',
    label: 'Typical project value range',
    type: 'select',
    options: ['under_50k', '50k_250k', '250k_1m', 'over_1m'],
  },
];

const RETAIL_FIELDS: ProfileField[] = [
  {
    key: 'format',
    label: 'Store format',
    type: 'select',
    options: ['brick_and_mortar', 'online_only', 'hybrid'],
    required: true,
  },
  { key: 'category', label: 'Product category', type: 'text', required: true },
  { key: 'locations_count', label: 'Number of locations', type: 'number', required: true },
  {
    key: 'sqft_range',
    label: 'Store sq ft',
    type: 'select',
    options: ['under_1k', '1k_5k', '5k_20k', 'over_20k'],
  },
  {
    key: 'price_tier',
    label: 'Price tier',
    type: 'select',
    options: ['budget', 'mid', 'premium'],
  },
  { key: 'import_share_pct', label: 'Import % of inventory', type: 'number' },
  {
    key: 'primary_sourcing_countries',
    label: 'Primary sourcing countries',
    type: 'multiselect',
    options: ['usa', 'china', 'mexico', 'vietnam', 'india', 'other'],
  },
  {
    key: 'seasonal_peaks',
    label: 'Seasonal peaks',
    type: 'multiselect',
    options: ['holiday', 'back_to_school', 'summer', 'spring'],
  },
  { key: 'pos_system', label: 'POS system', type: 'text' },
  { key: 'loyalty_program', label: 'Loyalty program', type: 'bool' },
];

const ROWS = [
  { industry: 'restaurant' as const, schemaVersion: 1, fields: RESTAURANT_FIELDS },
  { industry: 'construction' as const, schemaVersion: 1, fields: CONSTRUCTION_FIELDS },
  { industry: 'retail' as const, schemaVersion: 1, fields: RETAIL_FIELDS },
];

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('Seeding industry_profile_schemas...\n');

  for (const row of ROWS) {
    await db
      .insert(industryProfileSchemas)
      .values(row)
      .onConflictDoUpdate({
        target: industryProfileSchemas.industry,
        set: { fields: row.fields, schemaVersion: row.schemaVersion },
      });
    console.log(
      `  ${row.industry}: ${row.fields.length} fields (schema_version=${row.schemaVersion})`,
    );
  }

  console.log('\nDone.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Run against the DB**

```bash
node --env-file=.env.local --import tsx scripts/seed-industry-profiles.ts
```

Expected output:
```
Seeding industry_profile_schemas...

  restaurant: 11 fields (schema_version=1)
  construction: 8 fields (schema_version=1)
  retail: 10 fields (schema_version=1)

Done.
```

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-industry-profiles.ts
git commit -m "feat(onboarding): seed industry_profile_schemas for all three industries"
```

---

## Task 3: Profiler (Prompt + Function)

**Files:**
- Create: `lib/llm/prompts/onboarding-profiler-v1.ts`
- Create: `lib/onboarding/profiler.ts`

- [ ] **Step 1: Create the prompt file**

```typescript
// lib/llm/prompts/onboarding-profiler-v1.ts
export const PROMPT_VERSION = 'onboarding-profiler-v1';

export const SYSTEM_PROMPT = `You are an economic intelligence analyst specializing in input cost analysis for small and mid-sized businesses.

Your role: given a business profile, identify which economic indicators from a provided candidate list are most relevant to that business's input costs and operating environment.

Rules:
- You MUST only recommend indicator codes from the provided candidate list. Never invent codes.
- Frame all reasoning using "historical patterns indicate," "operators in similar conditions have," or "trends suggest." Never use prescriptive language ("you should," "you must," "do X").
- Recommend 8–15 indicators. Prioritize specificity to this business over broad macro coverage.
- aiProfileTags should be 3–8 concise strings describing the business (e.g., "full-service", "beef-heavy", "tipped-labor", "multi-location").`;

export function buildUserPrompt(input: {
  industry: string;
  industryProfile: Record<string, unknown>;
  businessDescription: string;
  keyInputs: string[];
  region: string;
  candidateCodes: Array<{ code: string; name: string; costBucket: string | null }>;
}): string {
  return `Business profile:
Industry: ${input.industry}
Region: ${input.region}
Description: ${input.businessDescription || '(not provided)'}
Key self-reported inputs: ${input.keyInputs.length > 0 ? input.keyInputs.join(', ') : '(none listed)'}
Profile fields:
${JSON.stringify(input.industryProfile, null, 2)}

Candidate indicators (you MUST only pick codes from this list — ${input.candidateCodes.length} available):
${input.candidateCodes
  .map((c) => `${c.code} — ${c.name}${c.costBucket ? ` [${c.costBucket}]` : ''}`)
  .join('\n')}

Call submit_profile_analysis with your recommendations.`;
}
```

- [ ] **Step 2: Create the profiler function**

```typescript
// lib/onboarding/profiler.ts
import Anthropic from '@anthropic-ai/sdk';
import { listIndicatorsByIndustry } from '@/lib/db/queries/indicators';
import {
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  buildUserPrompt,
} from '@/lib/llm/prompts/onboarding-profiler-v1';
import type { Industry } from '@/lib/indicators/types';

export const PROFILER_GENERATED_BY = `profiler@${PROMPT_VERSION}`;

export interface ProfilerInput {
  industry: Industry;
  industryProfile: Record<string, unknown>;
  businessDescription: string;
  keyInputs: string[];
  region: string;
}

export interface ProfilerOutput {
  aiProfileTags: string[];
  aiRecommendedIndicators: string[];
  reasoning: string;
}

const TOOL_NAME = 'submit_profile_analysis';

export async function runProfiler(input: ProfilerInput): Promise<ProfilerOutput> {
  const indicators = await listIndicatorsByIndustry(input.industry);
  const candidateCodes = indicators.map((i) => ({
    code: i.code,
    name: i.name,
    costBucket: i.costBucket,
  }));
  const candidateCodeSet = new Set(candidateCodes.map((c) => c.code));

  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-sonnet-4',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt({ ...input, candidateCodes }) }],
    tools: [
      {
        name: TOOL_NAME,
        description: 'Submit the profile analysis result',
        input_schema: {
          type: 'object' as const,
          properties: {
            aiProfileTags: {
              type: 'array',
              items: { type: 'string' },
              description: '3–8 concise profile tags describing this business',
            },
            aiRecommendedIndicators: {
              type: 'array',
              items: { type: 'string' },
              description: 'Indicator codes from the candidate list only — 8 to 15 items',
            },
            reasoning: {
              type: 'string',
              description:
                'Brief reasoning using "historical patterns indicate" / "operators in similar conditions have" framing',
            },
          },
          required: ['aiProfileTags', 'aiRecommendedIndicators', 'reasoning'],
        },
      },
    ],
    tool_choice: { type: 'any' as const },
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === TOOL_NAME,
  );
  if (!toolUse) {
    throw new Error('Profiler: Claude did not call submit_profile_analysis');
  }

  const raw = toolUse.input as {
    aiProfileTags: unknown;
    aiRecommendedIndicators: unknown;
    reasoning: unknown;
  };

  if (
    !Array.isArray(raw.aiProfileTags) ||
    !Array.isArray(raw.aiRecommendedIndicators) ||
    typeof raw.reasoning !== 'string'
  ) {
    throw new Error('Profiler: malformed tool input from Claude');
  }

  const aiProfileTags = raw.aiProfileTags.filter((t): t is string => typeof t === 'string');
  const aiRecommendedIndicators = (raw.aiRecommendedIndicators as unknown[]).filter(
    (c): c is string => typeof c === 'string' && candidateCodeSet.has(c),
  );

  return { aiProfileTags, aiRecommendedIndicators, reasoning: raw.reasoning };
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add lib/llm/prompts/onboarding-profiler-v1.ts lib/onboarding/profiler.ts
git commit -m "feat(onboarding): profiler prompt v1 + runProfiler (Claude tool-use)"
```

---

## Task 4: DynamicProfileForm Component

**Files:**
- Create: `components/onboarding/DynamicProfileForm.tsx`

- [ ] **Step 1: Create the file**

```typescript
// components/onboarding/DynamicProfileForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';

export type FieldType = 'text' | 'select' | 'multiselect' | 'number' | 'bool';

export interface ProfileField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  helper?: string;
}

export interface DynamicProfileFormProps {
  fields: ProfileField[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  isPending: boolean;
}

export function DynamicProfileForm({
  fields,
  initialValues = {},
  onSubmit,
  isPending,
}: DynamicProfileFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setValue(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required) {
        const v = values[field.key];
        const isEmpty =
          v === undefined ||
          v === '' ||
          v === null ||
          (Array.isArray(v) && v.length === 0);
        if (isEmpty) newErrors[field.key] = `${field.label} is required`;
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fg">
            {field.label}
            {field.required && <span className="text-crit ml-1">*</span>}
          </label>
          {field.helper && <p className="text-xs text-fg-muted">{field.helper}</p>}
          <FieldInput
            field={field}
            value={values[field.key]}
            onChange={(v) => setValue(field.key, v)}
          />
          {errors[field.key] && (
            <p className="text-xs text-crit">{errors[field.key]}</p>
          )}
        </div>
      ))}
      <Button type="submit" variant="primary" size="md" disabled={isPending}>
        {isPending ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  );
}

interface FieldInputProps {
  field: ProfileField;
  value: unknown;
  onChange: (v: unknown) => void;
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const inputClass =
    'bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1.5 focus:outline-none focus:border-accent';

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : Number(e.target.value))
          }
          className={`${inputClass} w-36`}
        />
      );

    case 'select': {
      const options = (field.options ?? []).map((o) => ({
        value: o,
        label: o.replace(/_/g, ' '),
      }));
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          options={[{ value: '', label: '— select —' }, ...options]}
        />
      );
    }

    case 'multiselect': {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((opt) => {
            const checked = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(
                      checked
                        ? selected.filter((x) => x !== opt)
                        : [...selected, opt],
                    )
                  }
                  className="accent-[var(--sl-accent)]"
                />
                <span className="text-sm text-fg">{opt.replace(/_/g, ' ')}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case 'bool':
      return (
        <Toggle
          checked={value === true}
          onChange={onChange}
          label={value === true ? 'Yes' : 'No'}
        />
      );
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/onboarding/DynamicProfileForm.tsx
git commit -m "feat(onboarding): DynamicProfileForm — renders industry_profile_schemas.fields jsonb"
```

---

## Task 5: Server Actions

**Files:**
- Create: `lib/onboarding/actions.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/onboarding/actions.ts
'use server';

import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/queries/organizations';
import { getMemberByClerkAndOrg, updateNotificationPrefs } from '@/lib/db/queries/members';
import { listIndicatorsByIndustry } from '@/lib/db/queries/indicators';
import {
  completeOnboarding,
  getOnboardingState,
  upsertOnboardingState,
  type OnboardingPatch,
} from '@/lib/db/queries/onboarding';
import { runProfiler, type ProfilerInput } from '@/lib/onboarding/profiler';
import type { Indicator } from '@/lib/db/queries/indicators';

async function resolveOrgId(): Promise<string> {
  const { orgId: clerkOrgId } = await auth();
  if (!clerkOrgId) throw new Error('No active organization');
  const org = await getOrgByClerkId(clerkOrgId);
  if (!org) throw new Error(`Organization not found for clerkOrgId ${clerkOrgId}`);
  return org.id;
}

export async function upsertOnboardingStateAction(patch: OnboardingPatch): Promise<void> {
  const orgId = await resolveOrgId();
  await upsertOnboardingState(orgId, patch);
}

export async function runProfilerAction(input: ProfilerInput): Promise<string[]> {
  const orgId = await resolveOrgId();
  try {
    const result = await runProfiler(input);
    await upsertOnboardingState(orgId, {
      aiProfileTags: result.aiProfileTags,
      aiRecommendedIndicators: result.aiRecommendedIndicators,
    });
    return result.aiRecommendedIndicators;
  } catch (err) {
    console.error('[runProfilerAction] profiler failed:', err);
    return [];
  }
}

export async function getIndustryIndicatorsAction(
  industry: 'restaurant' | 'construction' | 'retail',
): Promise<Indicator[]> {
  return listIndicatorsByIndustry(industry);
}

export async function completeOnboardingAction(phone?: string): Promise<void> {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
  if (!clerkUserId || !clerkOrgId) throw new Error('Not authenticated');

  const orgId = await resolveOrgId();
  const state = await getOnboardingState(orgId);

  await completeOnboarding(orgId);

  if (state?.notificationChannels && state.notificationChannels.length > 0) {
    const member = await getMemberByClerkAndOrg(clerkUserId, orgId);
    if (member) {
      const ch = state.notificationChannels;
      await updateNotificationPrefs(member.id, {
        emailBriefing: ch.includes('email'),
        emailAlerts: ch.includes('email'),
        smsAlerts: ch.includes('sms'),
        ...(phone ? { phone } : {}),
      });
    }
  }

  // Set cookie so middleware skips the DB check on subsequent /app/* visits
  const cookieStore = await cookies();
  cookieStore.set('sl-ob', '1', {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add lib/onboarding/actions.ts
git commit -m "feat(onboarding): server actions — upsert state, run profiler, complete onboarding"
```

---

## Task 6: Wizard + Page Shell

**Files:**
- Create: `components/onboarding/OnboardingWizard.tsx`
- Create: `app/onboarding/page.tsx`

- [ ] **Step 1: Create the wizard component**

```typescript
// components/onboarding/OnboardingWizard.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import {
  DynamicProfileForm,
  type ProfileField,
} from '@/components/onboarding/DynamicProfileForm';
import {
  upsertOnboardingStateAction,
  runProfilerAction,
  getIndustryIndicatorsAction,
  completeOnboardingAction,
} from '@/lib/onboarding/actions';
import type { OnboardingState, IndustryProfileSchema } from '@/lib/db/queries/onboarding';
import type { Indicator } from '@/lib/db/queries/indicators';
import type { Industry } from '@/lib/indicators/types';

type Step = 'industry' | 'region' | 'profile' | 'indicators' | 'channels' | 'complete';

interface WizardProps {
  initialStep: Step;
  initialState: OnboardingState | null;
  profileSchemas: IndustryProfileSchema[];
}

export function OnboardingWizard({ initialStep, initialState, profileSchemas }: WizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>(initialStep);
  const [industry, setIndustry] = useState<Industry | null>(
    (initialState?.selectedIndustry as Industry | null) ?? null,
  );
  const [regionState, setRegionState] = useState<string>(
    initialState?.selectedRegions?.[0] ?? '',
  );
  const [regionMetro, setRegionMetro] = useState<string>(
    initialState?.selectedRegions?.[1] ?? '',
  );
  const [businessDescription, setBusinessDescription] = useState<string>(
    initialState?.businessDescription ?? '',
  );
  const [industryProfile, setIndustryProfile] = useState<Record<string, unknown>>(
    (initialState?.industryProfile as Record<string, unknown> | null) ?? {},
  );
  const [allIndicators, setAllIndicators] = useState<Indicator[]>([]);
  const [aiRecs, setAiRecs] = useState<string[]>(
    initialState?.aiRecommendedIndicators ?? [],
  );
  const [pinnedCodes, setPinnedCodes] = useState<string[]>(
    initialState?.pinnedIndicatorCodes ?? initialState?.aiRecommendedIndicators ?? [],
  );
  const [emailBriefing, setEmailBriefing] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [phone, setPhone] = useState('');
  const [inApp, setInApp] = useState(true);

  function handleIndustrySelect(ind: Industry) {
    startTransition(async () => {
      await upsertOnboardingStateAction({ step: 'region', selectedIndustry: ind });
      setIndustry(ind);
      setStep('region');
    });
  }

  function handleRegionNext() {
    if (!regionState) return;
    startTransition(async () => {
      const regions = regionMetro ? [regionState, regionMetro] : [regionState];
      await upsertOnboardingStateAction({ step: 'profile', selectedRegions: regions });
      setStep('profile');
    });
  }

  function handleProfileSubmit(values: Record<string, unknown>) {
    startTransition(async () => {
      await upsertOnboardingStateAction({
        step: 'indicators',
        businessDescription,
        industryProfile: values,
        keyInputs: [],
      });
      setIndustryProfile(values);

      // Fire profiler non-blocking — wizard advances immediately
      if (industry) {
        void runProfilerAction({
          industry,
          industryProfile: values,
          businessDescription,
          keyInputs: [],
          region: regionState,
        }).catch(console.error);
      }

      // Load full indicator list for step 4
      if (industry) {
        const inds = await getIndustryIndicatorsAction(industry);
        setAllIndicators(inds);
      }

      setStep('indicators');
    });
  }

  async function handleRetryProfiler(): Promise<void> {
    if (!industry) return;
    const recs = await runProfilerAction({
      industry,
      industryProfile,
      businessDescription,
      keyInputs: [],
      region: regionState,
    });
    if (recs.length > 0) {
      setAiRecs(recs);
      setPinnedCodes(recs);
    }
  }

  function handleIndicatorsNext() {
    startTransition(async () => {
      await upsertOnboardingStateAction({ step: 'channels', pinnedIndicatorCodes: pinnedCodes });
      setStep('channels');
    });
  }

  function handleChannelsNext() {
    startTransition(async () => {
      const channels: string[] = ['in_app'];
      if (emailBriefing) channels.push('email');
      if (smsAlerts) channels.push('sms');
      await upsertOnboardingStateAction({ step: 'complete', notificationChannels: channels });
      await completeOnboardingAction(smsAlerts ? phone : undefined);
      router.push('/app');
    });
  }

  const profileSchema = profileSchemas.find((s) => s.industry === industry);

  return (
    <div className="bg-bg-elev border border-border rounded-[var(--radius-lg)] p-8">
      <StepHeader step={step} />
      <div className="mt-6">
        {step === 'industry' && (
          <IndustryStep onSelect={handleIndustrySelect} isPending={isPending} />
        )}
        {step === 'region' && (
          <RegionStep
            regionState={regionState}
            regionMetro={regionMetro}
            onStateChange={setRegionState}
            onMetroChange={setRegionMetro}
            onNext={handleRegionNext}
            isPending={isPending}
          />
        )}
        {step === 'profile' && profileSchema && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-fg">
                Briefly describe your business
              </label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Fast casual taco restaurant, 2 locations, 40 seats each"
                className="bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1.5 focus:outline-none focus:border-accent resize-none w-full"
              />
            </div>
            <DynamicProfileForm
              fields={profileSchema.fields as ProfileField[]}
              initialValues={industryProfile}
              onSubmit={handleProfileSubmit}
              isPending={isPending}
            />
          </div>
        )}
        {step === 'indicators' && (
          <IndicatorsStep
            allIndicators={allIndicators}
            aiRecs={aiRecs}
            pinnedCodes={pinnedCodes}
            onToggle={(code) =>
              setPinnedCodes((prev) =>
                prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
              )
            }
            onRetry={handleRetryProfiler}
            onNext={handleIndicatorsNext}
            isPending={isPending}
          />
        )}
        {step === 'channels' && (
          <ChannelsStep
            emailBriefing={emailBriefing}
            onEmailChange={setEmailBriefing}
            smsAlerts={smsAlerts}
            onSmsChange={setSmsAlerts}
            phone={phone}
            onPhoneChange={setPhone}
            inApp={inApp}
            onInAppChange={setInApp}
            onNext={handleChannelsNext}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}

// ─── StepHeader ───────────────────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  industry: 'Your industry',
  region: 'Your region',
  profile: 'Business profile',
  indicators: 'Choose indicators',
  channels: 'Notifications',
};
const STEP_ORDER = ['industry', 'region', 'profile', 'indicators', 'channels'];

function StepHeader({ step }: { step: string }) {
  const idx = STEP_ORDER.indexOf(step);
  return (
    <div>
      <div className="flex gap-1 mb-4">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= idx ? 'bg-accent' : 'bg-border'}`}
          />
        ))}
      </div>
      <h1 className="text-xl font-semibold text-fg">{STEP_LABELS[step] ?? step}</h1>
    </div>
  );
}

// ─── Step 1: Industry ─────────────────────────────────────────────────────────

const INDUSTRY_CARDS = [
  { value: 'restaurant' as const, label: 'Restaurant', description: 'Food service operators, cafes, catering' },
  { value: 'construction' as const, label: 'Construction', description: 'Contractors, remodelers, specialty trades' },
  { value: 'retail' as const, label: 'Retail', description: 'Independent stores, specialty shops' },
];

function IndustryStep({ onSelect, isPending }: { onSelect: (ind: Industry) => void; isPending: boolean }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-fg-muted">Choose the industry that best describes your business.</p>
      {INDUSTRY_CARDS.map((card) => (
        <button
          key={card.value}
          type="button"
          disabled={isPending}
          onClick={() => onSelect(card.value)}
          className="w-full text-left p-4 bg-bg border border-border rounded-[var(--radius-md)] hover:border-accent hover:bg-spotlight transition-colors disabled:opacity-50"
        >
          <div className="font-medium text-fg">{card.label}</div>
          <div className="text-sm text-fg-muted mt-0.5">{card.description}</div>
        </button>
      ))}
    </div>
  );
}

// ─── Step 2: Region ───────────────────────────────────────────────────────────

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];

function RegionStep({
  regionState, regionMetro, onStateChange, onMetroChange, onNext, isPending,
}: {
  regionState: string; regionMetro: string;
  onStateChange: (v: string) => void; onMetroChange: (v: string) => void;
  onNext: () => void; isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-fg">State <span className="text-crit">*</span></label>
        <Select value={regionState} onChange={onStateChange}
          options={[{ value: '', label: '— select state —' }, ...US_STATES]} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-fg">
          Metro area <span className="text-fg-muted text-xs font-normal">(optional)</span>
        </label>
        <input type="text" value={regionMetro} onChange={(e) => onMetroChange(e.target.value)}
          placeholder="e.g. Denver, Colorado Springs"
          className="bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1.5 focus:outline-none focus:border-accent" />
      </div>
      <Button type="button" variant="primary" size="md" disabled={!regionState || isPending} onClick={onNext}>
        {isPending ? 'Saving…' : 'Continue'}
      </Button>
    </div>
  );
}

// ─── Step 4: Indicators ───────────────────────────────────────────────────────

function IndicatorsStep({
  allIndicators, aiRecs, pinnedCodes, onToggle, onRetry, onNext, isPending,
}: {
  allIndicators: Indicator[]; aiRecs: string[]; pinnedCodes: string[];
  onToggle: (code: string) => void; onRetry: () => Promise<void>;
  onNext: () => void; isPending: boolean;
}) {
  const [retrying, startRetry] = useTransition();
  const recommended = allIndicators.filter((i) => aiRecs.includes(i.code));
  const others = allIndicators.filter((i) => !aiRecs.includes(i.code));
  const byBucket = others.reduce<Record<string, Indicator[]>>((acc, ind) => {
    const bucket = ind.costBucket ?? 'other';
    (acc[bucket] ??= []).push(ind);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {aiRecs.length === 0 ? (
        <div className="p-4 bg-bg border border-border rounded-[var(--radius-md)]">
          <p className="text-sm text-fg-muted">
            Recommendations are still loading.{' '}
            <button type="button" disabled={retrying}
              className="text-accent underline disabled:opacity-50"
              onClick={() => startRetry(async () => { await onRetry(); })}>
              {retrying ? 'Retrying…' : 'Retry'}
            </button>
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-fg-muted mb-2 uppercase tracking-wide font-medium">Recommended for your profile</p>
          <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
            {recommended.map((ind) => (
              <IndicatorRow key={ind.code} ind={ind} checked={pinnedCodes.includes(ind.code)} onToggle={onToggle} />
            ))}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <details className="group">
          <summary className="text-sm text-fg-muted cursor-pointer list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Add more indicators
          </summary>
          <div className="mt-3 space-y-4 max-h-64 overflow-y-auto pr-1">
            {Object.entries(byBucket).map(([bucket, inds]) => (
              <div key={bucket}>
                <p className="text-xs font-medium text-fg-dim uppercase tracking-wide mb-1">
                  {bucket.replace(/_/g, ' ')}
                </p>
                <div className="space-y-0.5">
                  {inds.map((ind) => (
                    <IndicatorRow key={ind.code} ind={ind} checked={pinnedCodes.includes(ind.code)} onToggle={onToggle} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
      <Button type="button" variant="primary" size="md" disabled={isPending} onClick={onNext}>
        {isPending ? 'Saving…' : 'Continue'}
      </Button>
    </div>
  );
}

function IndicatorRow({ ind, checked, onToggle }: { ind: Indicator; checked: boolean; onToggle: (code: string) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 hover:bg-bg-elev rounded-[var(--radius-sm)]">
      <input type="checkbox" checked={checked} onChange={() => onToggle(ind.code)}
        className="accent-[var(--sl-accent)] flex-shrink-0" />
      <span className="text-sm text-fg">{ind.name}</span>
      <span className="text-xs text-fg-dim ml-auto flex-shrink-0">{ind.unit}</span>
    </label>
  );
}

// ─── Step 5: Channels ─────────────────────────────────────────────────────────

function ChannelsStep({
  emailBriefing, onEmailChange, smsAlerts, onSmsChange,
  phone, onPhoneChange, inApp, onInAppChange, onNext, isPending,
}: {
  emailBriefing: boolean; onEmailChange: (v: boolean) => void;
  smsAlerts: boolean; onSmsChange: (v: boolean) => void;
  phone: string; onPhoneChange: (v: string) => void;
  inApp: boolean; onInAppChange: (v: boolean) => void;
  onNext: () => void; isPending: boolean;
}) {
  return (
    <div className="space-y-3">
      <ChannelRow title="Email briefings" description="Weekly briefing every Monday morning"
        checked={emailBriefing} onChange={onEmailChange} ariaLabel="Email briefings" />
      <div className="p-3 bg-bg border border-border rounded-[var(--radius-md)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg">SMS alerts</p>
            <p className="text-xs text-fg-muted">High-priority event alerts by text</p>
          </div>
          <Toggle checked={smsAlerts} onChange={onSmsChange} aria-label="SMS alerts" />
        </div>
        {smsAlerts && (
          <input type="tel" value={phone} onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="mt-2 w-full bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1.5 focus:outline-none focus:border-accent" />
        )}
      </div>
      <ChannelRow title="In-app notifications" description="Alerts visible in the dashboard"
        checked={inApp} onChange={onInAppChange} ariaLabel="In-app notifications" />
      <div className="pt-2">
        <Button type="button" variant="primary" size="md" disabled={isPending} onClick={onNext}>
          {isPending ? 'Finishing setup…' : 'Complete setup'}
        </Button>
      </div>
    </div>
  );
}

function ChannelRow({ title, description, checked, onChange, ariaLabel }: {
  title: string; description: string; checked: boolean;
  onChange: (v: boolean) => void; ariaLabel: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-bg border border-border rounded-[var(--radius-md)]">
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="text-xs text-fg-muted">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} aria-label={ariaLabel} />
    </div>
  );
}
```

- [ ] **Step 2: Create the page shell**

```typescript
// app/onboarding/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/queries/organizations';
import { getOnboardingState, listIndustryProfileSchemas } from '@/lib/db/queries/onboarding';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
  const { orgId: clerkOrgId } = await auth();
  if (!clerkOrgId) redirect('/sign-in');

  const org = await getOrgByClerkId(clerkOrgId);
  if (!org) redirect('/sign-in');

  const [state, schemas] = await Promise.all([
    getOnboardingState(org.id),
    listIndustryProfileSchemas(),
  ]);

  if (state?.step === 'complete') redirect('/app');

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-fg">Welcome to Stormline</h2>
          <p className="text-sm text-fg-muted mt-1">
            Set up your profile to get industry-specific intelligence.
          </p>
        </div>
        <OnboardingWizard
          initialStep={state?.step ?? 'industry'}
          initialState={state ?? null}
          profileSchemas={schemas}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add components/onboarding/OnboardingWizard.tsx app/onboarding/page.tsx
git commit -m "feat(onboarding): wizard (5 steps) + page shell"
```

---

## Task 7: Middleware Guard

**Files:**
- Modify: `proxy.ts`

Read the current `proxy.ts` before editing. It currently contains:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 1: Replace the contents of `proxy.ts`**

```typescript
// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { onboardingState, organizations } from "@/lib/db/schema";

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/admin(.*)",
  "/onboarding(.*)",
]);

const isOnboardingGuardedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isOnboardingGuardedRoute(req)) {
    // Fast path: cookie set by completeOnboardingAction
    if (req.cookies.has("sl-ob")) return NextResponse.next();

    const { orgId: clerkOrgId } = await auth();
    if (!clerkOrgId) return NextResponse.next();

    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    const [state] = await db
      .select({ step: onboardingState.step })
      .from(onboardingState)
      .where(eq(onboardingState.orgId, org.id))
      .limit(1);

    if (!state || state.step !== "complete") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Cache completed state to skip DB on future /app/* visits
    const res = NextResponse.next();
    res.cookies.set("sl-ob", "1", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat(onboarding): middleware guard — redirect /app/* to /onboarding if incomplete"
```

---

## Task 8: Final Typecheck + Draft PR

- [ ] **Step 1: Full typecheck**

```bash
pnpm typecheck
```

Expected: zero errors across entire codebase.

- [ ] **Step 2: Lint**

```bash
pnpm lint
```

Fix any errors before continuing.

- [ ] **Step 3: Push branch**

```bash
git push -u origin feat/onboarding-flow
```

- [ ] **Step 4: Open draft PR**

```bash
gh pr create \
  --title "feat(onboarding): 5-step wizard with AI indicator profiler" \
  --draft \
  --body "$(cat <<'EOF'
## Summary

- 5-step wizard (industry → region → profile → indicators → channels) persisted to \`onboarding_state\` via Server Actions after each step
- Claude profiler fires non-blocking after profile write; retry button shown if AI recs haven't arrived
- Middleware guard in \`proxy.ts\` redirects \`/app/*\` to \`/onboarding\` when \`step != 'complete'\`; \`sl-ob\` cookie skips DB check on repeat visits
- Seed script for \`industry_profile_schemas\` is authoritative on re-run

## Pre-merge checklist

- [ ] Run \`node --env-file=.env.local --import tsx scripts/seed-industry-profiles.ts\` against prod DB
- [ ] Walk through all 5 wizard steps end-to-end in a browser (fresh org)
- [ ] Verify \`/app\` redirects to \`/onboarding\` for a fresh org with no \`onboarding_state\` row
- [ ] Verify \`/app\` loads directly for a user whose \`onboarding_state.step = 'complete'\`
- [ ] Verify retry button appears if profiler fails (test by disconnecting \`ANTHROPIC_API_KEY\`)

## Notes

- Depends on schema PR #22 (merged to main)
- Does not touch schema.ts, package.json, tsconfig.json, next.config.ts, globals.css
- \`proxy.ts\`: added \`/onboarding(.*)\` to protected routes + onboarding guard for \`/app(.*)\`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Copy the PR URL and report it back**

---

## Self-review notes

- **Spec coverage:** All 6 deliverables covered (queries ✓, seed ✓, profiler ✓, form ✓, wizard + page ✓, middleware ✓). `lib/onboarding/actions.ts` added per design doc revision.
- **Type consistency:** `ProfileField` exported from `DynamicProfileForm`, imported by `OnboardingWizard`. `OnboardingState` / `IndustryProfileSchema` / `OnboardingPatch` exported from queries, used in actions + page. `ProfilerInput` / `ProfilerOutput` defined in profiler, imported by actions.
- **No placeholders:** All code is complete.
- **Model string:** `claude-sonnet-4` per user clarification.
- **Profiler sequencing:** `upsertOnboardingStateAction` awaited first; `runProfilerAction` fires non-blocking via `void`; retry path in `IndicatorsStep` awaits and updates local state directly via returned `string[]`.
- **Cookie:** Set by `completeOnboardingAction` (server action) via `next/headers`; read by middleware for the fast path.
