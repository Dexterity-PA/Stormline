# Stormline

Macro intelligence platform for small and mid-sized businesses. Weekly operational briefings, input price dashboards, and event alerts for restaurants, light construction, and independent retail.

Full product spec: [`./spec.md`](./spec.md).
Agent instructions: [`./CLAUDE.md`](./CLAUDE.md).

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind v4 · Clerk · Neon Postgres + Drizzle · Stripe · Resend · Twilio · Inngest · Claude Sonnet via Anthropic API · Sentry · Vercel.

## Local setup

### 1. Prerequisites

- Node.js 22+ (24 LTS recommended)
- pnpm 10+
- A Neon project (or any Postgres 15+ instance)
- Accounts: Clerk, Stripe, Resend, Twilio, Anthropic, Inngest, Sentry, FRED, EIA

### 2. Install

```bash
pnpm install
```

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in every variable in `.env.example`. Free tiers are fine for local dev. See §14 of `spec.md` for a guided list.

### 4. Database

```bash
# Apply the initial migration to your Neon branch
pnpm db:migrate

# Or push schema directly (dev only, skips migration files)
pnpm db:push

# Inspect
pnpm db:studio
```

Schema lives in `lib/db/schema.ts`. Generate new migrations with `pnpm db:generate --name <slug>` after editing.

### 5. Run

```bash
pnpm dev
```

App boots at <http://localhost:3000>. Turbopack is on by default.

### 6. Type-check + lint

```bash
pnpm typecheck
pnpm lint
```

## Repo layout

See §15 of `spec.md` for the full file structure. Highlights:

- `app/` — App Router route groups: `(marketing)`, `(auth)`, `app/`, `admin/`
- `lib/db/` — Drizzle schema, client, typed queries
- `lib/llm/prompts/` — versioned LLM prompts (`claude-sonnet-4@prompt-vX.Y`)
- `lib/data-sources/` — adapter per external source (FRED, EIA, USDA, BLS, NHC, Federal Register)
- `inngest/functions/` — scheduled jobs (briefing generation, data pulls, alert polling)
- `scrapers/` — standalone Python scrapers (separate venv, not part of the Next.js build)
- `drizzle/migrations/` — generated SQL migrations, committed

## Conventions

- No `any` in TypeScript. Use `unknown` + narrowing or proper types.
- Drizzle for all DB access. No raw SQL outside migrations.
- Inngest for all scheduled / background work. No custom cron.
- Prompts are versioned files in `lib/llm/prompts/`. Every briefing stores `generated_by`.
- Human-in-loop for every briefing and alert in MVP. No auto-publish.
- Server Components by default. `'use client'` only when required.
- Zod at every API boundary.
- Design tokens only (`--sl-*` in `styles/globals.css`); no hardcoded hex in components.

## Phase 0 status

This repo is currently scaffolding only. No data pipelines, LLM generation, billing, or Inngest functions are wired up yet. See `CLAUDE.md` and `spec.md` §9 for what Phase 1 should tackle first.
