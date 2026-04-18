# CLAUDE.md — Stormline

Agent instructions for this repo. Read before every task.

## Project

Stormline is a macro intelligence platform for SMBs. Weekly operational briefings + input price dashboards + event alerts for restaurants, light construction, and independent retail. Bloomberg logic translated to operator decisions.

Full spec: `./spec.md`. Always consult relevant sections before building.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript strict
- Tailwind v4 + `--sl-*` custom tokens
- Clerk (auth), Neon Postgres + Drizzle (db), Stripe (billing)
- Resend (email), Twilio (SMS), Inngest (jobs)
- Claude Sonnet 4 via Anthropic API (briefing gen)
- Vercel (hosting), Sentry (errors)
- Python + httpx + selectolax in `/scrapers/` (same pattern as BidBoard)

## Hard rules

**Intelligence, not advice.** Every LLM prompt, every piece of copy, every briefing, every alert. Never "do X." Always "historical pattern shows," "trends indicate," "operators in similar conditions have." This is legal bedrock. Non-negotiable.

**No `any` in TypeScript.** Use `unknown` + narrowing or proper types.

**Drizzle for all DB access.** No raw SQL except in migrations. No Prisma, no Supabase client.

**Inngest for all scheduled/background jobs.** No cron, no custom queues.

**Prompts are versioned files** in `lib/llm/prompts/`. Every briefing stores `generated_by = 'claude-sonnet-4@prompt-vX.Y'`.

**Human-in-loop for all briefings and alerts in MVP.** No auto-publish.

**No storage of client financial data.** Stormline is read-only intelligence.

## Conventions

- Path alias: `@/*` → repo root
- Server Components by default. `'use client'` only when needed
- Zod for all API input validation
- Typed queries in `lib/db/queries/` grouped by domain
- Shared UI primitives in `components/ui/`
- Design tokens only — no hardcoded hex in components
- File naming: `kebab-case.ts` for modules, `PascalCase.tsx` for components

## Parallel session safety

Multiple Claude Code sessions may run in parallel (BidBoard lesson). Rules:
- Never run more than 2 sessions on overlapping files
- Branch per session, merge via PR
- If touching `lib/db/schema.ts` or `lib/indicators/registry.ts`, hold exclusive lock — no other session writes until merged

## Spec section pointers

| Task | Section |
|---|---|
| Data model changes | §6 |
| Routes / API | §7 |
| Scheduled jobs | §8 |
| Briefing pipeline | §9 |
| Dashboard | §10 |
| Alerts | §11 |
| Billing / Stripe | §12 |
| Legal / compliance | §13 |
| Env vars | §14 |
| File structure | §15 |
| Design tokens | §16 |
| Launch checklist | §17 |

## Don't

- Don't add paid data sources (Placer.ai, IMPLAN) — post-validation only
- Don't auto-publish briefings or alerts
- Don't write financial/legal/tax advice in any output
- Don't add new industries beyond restaurants/construction/retail in MVP
- Don't build scenario modeling, Slack integration, or white-label features — those are Phase 2+

## When unsure

Stop and ask. Don't guess at spec decisions.
