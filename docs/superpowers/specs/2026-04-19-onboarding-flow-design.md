# Onboarding Flow — Design Spec

**Date:** 2026-04-19  
**Branch:** `feat/onboarding-flow`  
**Depends on:** schema PR #22 (merged — `onboarding_state`, `industry_profile_schemas`, `onboarding_step` enum)

---

## Overview

New users arrive with no context. The onboarding wizard collects their industry, region, and business profile, then uses Claude to recommend the indicators most relevant to their operation. On completion it writes `onboarding_state.step = 'complete'` and routes the user to `/app`.

Every unauthenticated `/app/*` request already hits Clerk. After this change, authenticated requests where the org's `onboarding_state.step != 'complete'` redirect to `/onboarding` instead.

---

## Files Delivered

| Path | Purpose |
|---|---|
| `scripts/seed-industry-profiles.ts` | Authoritative seed for `industry_profile_schemas` |
| `lib/onboarding/profiler.ts` | Claude call: profile → recommended indicators |
| `lib/llm/prompts/onboarding-profiler-v1.ts` | Versioned prompt |
| `components/onboarding/DynamicProfileForm.tsx` | Renders jsonb field schema |
| `components/onboarding/OnboardingWizard.tsx` | Client-side step controller |
| `app/onboarding/page.tsx` | Server shell: fetches state, renders wizard |
| `lib/db/queries/onboarding.ts` | DB queries for onboarding_state |
| `lib/onboarding/actions.ts` | Server Actions: upsertOnboardingState, runProfilerAction |
| `proxy.ts` (edit) | Adds onboarding guard after Clerk protect |

---

## 1. Data Layer — `lib/db/queries/onboarding.ts`

Three functions over `onboarding_state` (one row per org, `orgId` PK):

**`getOnboardingState(orgId: string)`** — returns the row or `undefined`.

**`upsertOnboardingState(orgId: string, patch: OnboardingPatch)`** — inserts or updates. On conflict (same `orgId`) updates only the supplied columns plus `updatedAt`. `OnboardingPatch` is a partial of `typeof onboardingState.$inferInsert` minus `orgId`. Never accepts `orgId` in the patch.

**`completeOnboarding(orgId: string)`** — sets `step = 'complete'` and `completedAt = now()`. Throws if the row does not exist.

---

## 2. Seed Script — `scripts/seed-industry-profiles.ts`

Usage: `node --env-file=.env.local --import tsx scripts/seed-industry-profiles.ts`

Follows the pattern of `scripts/seed-indicators.ts`. Builds one row per industry with the `fields` jsonb array below, then calls `db.insert(industryProfileSchemas).values(rows).onConflictDoUpdate(...)` targeting the `industry` primary key. On re-run it overwrites `fields` and bumps `schemaVersion`. **Seeds are authoritative.**

### Restaurant fields

| key | label | type | options | required |
|---|---|---|---|---|
| `cuisine_type` | Cuisine type | text | — | yes |
| `service_model` | Service model | select | fast_casual, full_service, qsr, fine_dining | yes |
| `seats` | Seats | number | — | no |
| `locations_count` | Number of locations | number | — | yes |
| `avg_check` | Average check ($) | number | — | no |
| `primary_proteins` | Primary proteins | multiselect | beef, chicken, pork, seafood, plant_based, other | no |
| `primary_produce` | Primary produce | multiselect | lettuce, tomatoes, avocado, citrus, root_veg, other | no |
| `alcohol_license` | Alcohol license | bool | — | no |
| `delivery_share_pct` | Delivery % of sales | number | — | no |
| `labor_model` | Labor model | select | tipped, no_tip, hybrid | yes |
| `peak_meal_periods` | Peak meal periods | multiselect | breakfast, lunch, dinner, late_night | no |

### Construction fields

| key | label | type | options | required |
|---|---|---|---|---|
| `trade_type` | Trade / specialty | text | — | yes |
| `project_types` | Project types | multiselect | residential, commercial, industrial, renovation, new_construction | no |
| `crew_size` | Crew size | number | — | no |
| `union_status` | Union | bool | — | no |
| `bonded` | Bonded | bool | — | no |
| `primary_materials` | Primary materials | multiselect | lumber, steel, concrete, copper, pvc, drywall, roofing, other | no |
| `equipment_fleet_size` | Equipment fleet size | number | — | no |
| `typical_project_value_range` | Typical project value range | select | under_50k, 50k_250k, 250k_1m, over_1m | no |

### Retail fields

| key | label | type | options | required |
|---|---|---|---|---|
| `format` | Store format | select | brick_and_mortar, online_only, hybrid | yes |
| `category` | Product category | text | — | yes |
| `locations_count` | Number of locations | number | — | yes |
| `sqft_range` | Store sq ft | select | under_1k, 1k_5k, 5k_20k, over_20k | no |
| `price_tier` | Price tier | select | budget, mid, premium | no |
| `import_share_pct` | Import % of inventory | number | — | no |
| `primary_sourcing_countries` | Primary sourcing countries | multiselect | usa, china, mexico, vietnam, india, other | no |
| `seasonal_peaks` | Seasonal peaks | multiselect | holiday, back_to_school, summer, spring | no |
| `pos_system` | POS system | text | — | no |
| `loyalty_program` | Loyalty program | bool | — | no |

---

## 3. Profiler — `lib/onboarding/profiler.ts`

```
Input:  { industry, industryProfile, businessDescription, keyInputs, region }
Output: { aiProfileTags, aiRecommendedIndicators: string[], reasoning }
```

**Model:** `claude-sonnet-4`

**Flow:**
1. Call `listIndicatorsByIndustry(industry)` to get the candidate set.
2. Build the prompt from `lib/llm/prompts/onboarding-profiler-v1.ts`. Pass the candidate codes so Claude picks from the list — it never invents codes.
3. Call Claude via tool use to enforce output shape (no free-text parsing).
4. Return typed output.

**Framing:** all reasoning uses "historical patterns indicate," "operators in similar conditions have" — never advice.

**Prompt version:** stored in file. Output consumers tag `generated_by = 'profiler@onboarding-profiler-v1'`.

---

## 4. Dynamic Form — `components/onboarding/DynamicProfileForm.tsx`

Client component. Props:

```ts
{ fields: ProfileField[], onSubmit: (values: Record<string, unknown>) => void, isPending: boolean }
```

Renders each field by `type`:
- `text` / `number` → `<input>`
- `select` → `<Select>` from `components/ui/Select.tsx`
- `multiselect` → checkbox group
- `bool` → `<Toggle>` from `components/ui/Toggle.tsx`

Validates `required` fields on submit (no form library — plain loop). Uses `--sl-*` tokens only. No hardcoded hex.

---

## 5. Wizard — `app/onboarding/page.tsx` + `components/onboarding/OnboardingWizard.tsx`

`app/onboarding/page.tsx` is a Server Component. It fetches `onboarding_state` for the current org and the `industryProfileSchemas` rows, then renders `<OnboardingWizard>` with `initialStep` and `profileSchemas` as props.

`OnboardingWizard` is a `'use client'` component that owns the step-local state and drives progression.

### Steps (match `onboardingStepEnum` exactly)

| Step | What it collects | DB write |
|---|---|---|
| `industry` | `selectedIndustry` — 3 cards | `upsertOnboardingState({ step: 'region', selectedIndustry })` |
| `region` | `selectedRegions` (state dropdown + optional metro) | `upsertOnboardingState({ step: 'profile', selectedRegions })` |
| `profile` | `businessDescription`, `industryProfile`, `keyInputs` via `DynamicProfileForm` | 1. `upsertOnboardingState({ step: 'indicators', industryProfile, ... })` then 2. call `runProfilerAction` (separate Server Action, non-blocking — wizard advances immediately; profiler result written to DB when it resolves) |
| `indicators` | User edits `pinnedIndicatorCodes`; AI recs pre-checked. If `aiRecommendedIndicators` is empty, show retry button that re-calls profiler. | `upsertOnboardingState({ step: 'channels', pinnedIndicatorCodes })` |
| `channels` | `notificationChannels` (email always on, SMS opt-in with phone, in-app) | `upsertOnboardingState({ step: 'complete', notificationChannels })` + `completeOnboarding(orgId)` |
| `complete` | — | Redirect to `/app` |

**Profile → Indicators sequencing:** The profile DB write always completes before the wizard advances to Step 4. `runProfilerAction` is called immediately after (non-blocking — the wizard does not await it). When the user arrives at Step 4, the page re-fetches `onboarding_state`; if `aiRecommendedIndicators` is populated the recs appear pre-checked. If it is empty (profiler still running or failed), the user sees a retry button that calls `runProfilerAction` again on demand.

Server Actions live in `lib/onboarding/actions.ts`. `upsertOnboardingState` wraps the DB query; `runProfilerAction` calls the profiler and writes the result.

---

## 6. Middleware Guard — `proxy.ts`

After Clerk's `auth.protect()` for `/app(.*)` routes:

1. Resolve the org from `auth().orgId`.
2. Call `getOnboardingState(orgId)`.
3. If no row exists OR `step !== 'complete'`, redirect to `/onboarding`.

`/onboarding` itself is auth-protected but excluded from the onboarding guard (no redirect loop).

---

## Constraints

- No changes to `schema.ts`, `package.json`, `tsconfig.json`, `next.config.ts`, `proxy.ts` structure (only the guard logic is added), `globals.css`, or any briefings/news/alerts/ask files.
- No new npm dependencies.
- All DB access through Drizzle.
- No `any` in TypeScript.
