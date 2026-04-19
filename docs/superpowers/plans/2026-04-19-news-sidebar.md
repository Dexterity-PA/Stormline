# News Feed + Sidebar Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add nightly RSS news ingestion with Claude indicator-tagging, a SignalsRail right-rail component, and TodayCard + WatchlistModule sidebar modules wired into the app layout.

**Architecture:** RSS feeds (fast-xml-parser) → dedupe by source_url → Claude Haiku tags each new headline to an indicator code → stored in `news_items` table. Three new Server Components read from the DB: SignalsRail (right layout rail, 8 latest items by industry), TodayCard (date/market/regime), WatchlistModule (pinned indicator mini-sparklines). Inngest cron function orchestrates the nightly pipeline; an HTTP route allows manual triggering.

**Tech Stack:** fast-xml-parser, @anthropic-ai/sdk (Haiku), Inngest v4, Drizzle ORM, Clerk auth, Next.js App Router Server Components.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| CREATE | `lib/db/schema/news.ts` | `news_items` Drizzle table (drizzle.config.ts already globs `lib/db/schema/*.ts`) |
| CREATE | `lib/db/queries/news.ts` | insertNewsItems, getLatestNewsItems, getExistingSourceUrls |
| CREATE | `lib/news/sources.ts` | RSS feed configs per industry |
| CREATE | `lib/news/fetcher.ts` | Fetch + parse RSS, return raw items |
| CREATE | `lib/llm/prompts/news-tagger.ts` | Versioned prompt template |
| CREATE | `lib/news/tagger.ts` | Claude Haiku call → TagResult |
| CREATE | `inngest/functions/fetch-news.ts` | Inngest cron function (5am UTC) orchestrating fetch→tag→insert |
| MODIFY | `inngest/index.ts` | Export fetchNewsNightly in functions array |
| MODIFY | `app/api/inngest/route.ts` | Replace 501 stub with real Inngest serve handler |
| CREATE | `app/api/cron/news/route.ts` | POST: send news/fetch.requested event (manual trigger) |
| CREATE | `components/dashboard/SignalsRail.tsx` | Server Component: 8 latest news_items by user's industry |
| CREATE | `components/sidebar/TodayCard.tsx` | Server Component: date, market status, regime label |
| CREATE | `components/sidebar/WatchlistModule.tsx` | Server Component: pinned indicators with mini sparkline |
| MODIFY | `components/shell/Sidebar.tsx` | Add TodayCard + WatchlistModule below UserButton |
| MODIFY | `app/app/layout.tsx` | Add SignalsRail as third column (hidden below xl) |

---

## Task 1: Install fast-xml-parser

**Files:**
- Modify: `package.json` (add fast-xml-parser)

- [ ] **Step 1: Install the package**

```bash
npm install fast-xml-parser
```

Expected output: `added 1 package` (package already includes TS types — no @types needed)

- [ ] **Step 2: Verify typecheck still passes**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add fast-xml-parser for RSS ingestion"
```

---

## Task 2: news_items schema

**Files:**
- Create: `lib/db/schema/news.ts`

> Note: `drizzle.config.ts` already includes `"./lib/db/schema/*.ts"` in the schema glob, so this file is automatically picked up by `db:push` and `db:generate` without touching `schema.ts`.

- [ ] **Step 1: Create the schema file**

```typescript
// lib/db/schema/news.ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { industryEnum } from "../schema.ts";

export const newsItems = pgTable(
  "news_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceUrl: text("source_url").notNull(),
    source: text("source").notNull(),
    industry: industryEnum("industry").notNull(),
    headline: text("headline").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    linkedIndicatorCode: text("linked_indicator_code"),
    whyItMatters: text("why_it_matters"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("news_items_source_url_unique").on(t.sourceUrl),
    index("news_items_industry_fetched_idx").on(t.industry, t.fetchedAt.desc()),
  ],
);

export type NewsItem = InferSelectModel<typeof newsItems>;
export type NewNewsItem = InferInsertModel<typeof newsItems>;
```

- [ ] **Step 2: Push schema to database**

```bash
npm run db:push
```

Expected output includes: `news_items` table created, unique index `news_items_source_url_unique` created.

- [ ] **Step 3: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema/news.ts
git commit -m "feat(schema): add news_items table"
```

---

## Task 3: news_items query layer

**Files:**
- Create: `lib/db/queries/news.ts`

- [ ] **Step 1: Create the query file**

```typescript
// lib/db/queries/news.ts
import { desc, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { newsItems } from "@/lib/db/schema/news";
import type { NewsItem } from "@/lib/db/schema/news";

export type { NewsItem };

export const InsertNewsItemInput = z.object({
  sourceUrl: z.string().url(),
  source: z.string().min(1),
  industry: z.enum(["restaurant", "construction", "retail"]),
  headline: z.string().min(1),
  publishedAt: z.date().nullable(),
  linkedIndicatorCode: z.string().nullable().default(null),
  whyItMatters: z.string().max(120).nullable().default(null),
});
export type InsertNewsItemInput = z.infer<typeof InsertNewsItemInput>;

export async function insertNewsItems(
  items: InsertNewsItemInput[],
): Promise<{ inserted: number; skipped: number }> {
  if (items.length === 0) return { inserted: 0, skipped: 0 };
  const parsed = z.array(InsertNewsItemInput).parse(items);
  const inserted = await db
    .insert(newsItems)
    .values(
      parsed.map((i) => ({
        sourceUrl: i.sourceUrl,
        source: i.source,
        industry: i.industry,
        headline: i.headline,
        publishedAt: i.publishedAt,
        linkedIndicatorCode: i.linkedIndicatorCode,
        whyItMatters: i.whyItMatters,
      })),
    )
    .onConflictDoNothing({ target: newsItems.sourceUrl })
    .returning({ id: newsItems.id });
  return { inserted: inserted.length, skipped: parsed.length - inserted.length };
}

export async function getLatestNewsItems(
  industry: "restaurant" | "construction" | "retail",
  limit = 8,
): Promise<NewsItem[]> {
  return db
    .select()
    .from(newsItems)
    .where(eq(newsItems.industry, industry))
    .orderBy(desc(newsItems.fetchedAt))
    .limit(limit);
}

export async function getExistingSourceUrls(
  urls: string[],
): Promise<Set<string>> {
  if (urls.length === 0) return new Set();
  const rows = await db
    .select({ sourceUrl: newsItems.sourceUrl })
    .from(newsItems)
    .where(inArray(newsItems.sourceUrl, urls));
  return new Set(rows.map((r) => r.sourceUrl));
}

export async function getUntaggedNewsItems(
  limit = 50,
): Promise<NewsItem[]> {
  return db
    .select()
    .from(newsItems)
    .where(isNull(newsItems.linkedIndicatorCode))
    .orderBy(desc(newsItems.createdAt))
    .limit(limit);
}

export async function setNewsItemTag(
  id: string,
  linkedIndicatorCode: string,
  whyItMatters: string | null,
): Promise<void> {
  await db
    .update(newsItems)
    .set({ linkedIndicatorCode, whyItMatters })
    .where(eq(newsItems.id, id));
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db/queries/news.ts
git commit -m "feat(news): add news_items query layer"
```

---

## Task 4: RSS feed sources config

**Files:**
- Create: `lib/news/sources.ts`

- [ ] **Step 1: Create the sources file**

```typescript
// lib/news/sources.ts
export interface NewsSource {
  id: string;
  label: string;
  feedUrl: string;
  industry: "restaurant" | "construction" | "retail";
}

export const NEWS_SOURCES: readonly NewsSource[] = [
  {
    id: "restaurant_dive",
    label: "Restaurant Dive",
    feedUrl: "https://www.restaurantdive.com/feeds/news/",
    industry: "restaurant",
  },
  {
    id: "nra",
    label: "NRA",
    feedUrl: "https://restaurant.org/feed/",
    industry: "restaurant",
  },
  {
    id: "construction_dive",
    label: "Construction Dive",
    feedUrl: "https://www.constructiondive.com/feeds/news/",
    industry: "construction",
  },
  {
    id: "agc",
    label: "AGC",
    feedUrl: "https://www.agc.org/news/rss/",
    industry: "construction",
  },
  {
    id: "retail_dive",
    label: "Retail Dive",
    feedUrl: "https://www.retaildive.com/feeds/news/",
    industry: "retail",
  },
  {
    id: "nrf",
    label: "NRF",
    feedUrl: "https://nrf.com/about-us/newsroom/rss.xml",
    industry: "retail",
  },
] as const;

export function getSourcesByIndustry(
  industry: "restaurant" | "construction" | "retail",
): NewsSource[] {
  return NEWS_SOURCES.filter((s) => s.industry === industry);
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/news/sources.ts
git commit -m "feat(news): add RSS feed source registry"
```

---

## Task 5: RSS fetcher

**Files:**
- Create: `lib/news/fetcher.ts`

- [ ] **Step 1: Create the fetcher**

```typescript
// lib/news/fetcher.ts
import { XMLParser } from "fast-xml-parser";
import type { NewsSource } from "./sources";

const TIMEOUT_MS = 15_000;
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";

export interface RawNewsItem {
  headline: string;
  sourceUrl: string;
  publishedAt: Date | null;
}

function parseString(raw: unknown): string | null {
  if (typeof raw === "string") return raw.trim() || null;
  return null;
}

function parseLink(raw: unknown): string | null {
  if (typeof raw === "string" && raw.startsWith("http")) return raw.trim();
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const text = obj["#text"];
    if (typeof text === "string" && text.startsWith("http")) return text.trim();
  }
  return null;
}

function parsePubDate(raw: unknown): Date | null {
  if (typeof raw !== "string") return null;
  const d = new Date(raw);
  return Number.isFinite(d.getTime()) ? d : null;
}

function extractRssItems(parsed: unknown): unknown[] {
  if (!parsed || typeof parsed !== "object") return [];
  const root = parsed as Record<string, unknown>;
  const channel = (root["rss"] as Record<string, unknown> | undefined)?.["channel"] as
    | Record<string, unknown>
    | undefined;
  if (!channel) return [];
  const items = channel["item"];
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

export async function fetchRawItems(source: NewsSource): Promise<RawNewsItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let rawXml: string;
  try {
    const res = await fetch(source.feedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return [];
    rawXml = await res.text();
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsed: unknown = parser.parse(rawXml);
  const rssItems = extractRssItems(parsed);

  const out: RawNewsItem[] = [];
  for (const item of rssItems) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const headline = parseString(obj["title"]);
    const link = parseLink(obj["link"]) ?? parseLink(obj["guid"]);
    if (!headline || !link) continue;
    out.push({ headline, sourceUrl: link, publishedAt: parsePubDate(obj["pubDate"]) });
  }
  return out;
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/news/fetcher.ts
git commit -m "feat(news): add RSS fetcher using fast-xml-parser"
```

---

## Task 6: Claude news tagger

**Files:**
- Create: `lib/llm/prompts/news-tagger.ts`
- Create: `lib/news/tagger.ts`

> Prerequisite: `ANTHROPIC_API_KEY` env var must be set in `.env.local` and Vercel project settings (spec §14).

- [ ] **Step 1: Create the versioned prompt template**

```typescript
// lib/llm/prompts/news-tagger.ts
export const NEWS_TAGGER_MODEL = "claude-haiku-4-5-20251001";
export const NEWS_TAGGER_VERSION = "news-tagger@v1.0";

export function buildTaggingPrompt(
  headline: string,
  indicators: Array<{ code: string; name: string }>,
): string {
  const list = indicators.map((i) => `- ${i.code}: ${i.name}`).join("\n");
  return `You are a macro intelligence analyst. Given a news headline and a list of economic indicators tracked for an industry, identify which single indicator (if any) this headline most directly relates to.

Return a JSON object with exactly these fields:
- "linked_indicator_code": the indicator code string, or null
- "why_it_matters": ≤20 words describing the historical pattern or trend implication for operators, or null. Never give advice.
- "confidence": "high", "medium", or "low"

Only link if confidence is "high" or "medium". Return null for both fields if no strong connection.

HEADLINE: ${headline}

INDICATORS:
${list}

Return only valid JSON. No markdown fences.`;
}
```

- [ ] **Step 2: Create the tagger**

```typescript
// lib/news/tagger.ts
import Anthropic from "@anthropic-ai/sdk";
import {
  NEWS_TAGGER_MODEL,
  NEWS_TAGGER_VERSION,
  buildTaggingPrompt,
} from "@/lib/llm/prompts/news-tagger";
import { listIndicatorsByIndustry } from "@/lib/indicators/registry";
import type { Industry } from "@/lib/indicators/types";

const client = new Anthropic();
const MAX_INDICATORS = 80;

export interface TagResult {
  linkedIndicatorCode: string | null;
  whyItMatters: string | null;
  modelVersion: string;
}

function parseResponse(text: string): {
  linked_indicator_code: string | null;
  why_it_matters: string | null;
  confidence: string;
} {
  try {
    const obj: unknown = JSON.parse(text.trim());
    if (!obj || typeof obj !== "object") throw new Error("not object");
    const r = obj as Record<string, unknown>;
    return {
      linked_indicator_code:
        typeof r["linked_indicator_code"] === "string"
          ? r["linked_indicator_code"]
          : null,
      why_it_matters:
        typeof r["why_it_matters"] === "string" ? r["why_it_matters"] : null,
      confidence: typeof r["confidence"] === "string" ? r["confidence"] : "low",
    };
  } catch {
    return { linked_indicator_code: null, why_it_matters: null, confidence: "low" };
  }
}

export async function tagHeadline(
  headline: string,
  industry: Industry,
): Promise<TagResult> {
  const indicators = listIndicatorsByIndustry(industry)
    .slice(0, MAX_INDICATORS)
    .map((d) => ({ code: d.code, name: d.name }));

  const message = await client.messages.create({
    model: NEWS_TAGGER_MODEL,
    max_tokens: 256,
    messages: [
      { role: "user", content: buildTaggingPrompt(headline, indicators) },
    ],
  });

  const block = message.content[0];
  if (!block || block.type !== "text") {
    return { linkedIndicatorCode: null, whyItMatters: null, modelVersion: NEWS_TAGGER_VERSION };
  }

  const parsed = parseResponse(block.text);
  if (parsed.confidence === "low") {
    return { linkedIndicatorCode: null, whyItMatters: null, modelVersion: NEWS_TAGGER_VERSION };
  }

  return {
    linkedIndicatorCode: parsed.linked_indicator_code,
    whyItMatters: parsed.why_it_matters,
    modelVersion: NEWS_TAGGER_VERSION,
  };
}
```

- [ ] **Step 3: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/llm/prompts/news-tagger.ts lib/news/tagger.ts
git commit -m "feat(news): add Claude Haiku indicator tagger"
```

---

## Task 7: Inngest nightly function + serve handler

**Files:**
- Create: `inngest/functions/fetch-news.ts`
- Modify: `inngest/index.ts`
- Modify: `app/api/inngest/route.ts`

- [ ] **Step 1: Create the Inngest function**

```typescript
// inngest/functions/fetch-news.ts
import { eq, isNull } from "drizzle-orm";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { newsItems } from "@/lib/db/schema/news";
import { insertNewsItems } from "@/lib/db/queries/news";
import { getExistingSourceUrls } from "@/lib/db/queries/news";
import { NEWS_SOURCES } from "@/lib/news/sources";
import { fetchRawItems } from "@/lib/news/fetcher";
import { tagHeadline } from "@/lib/news/tagger";

const MAX_TAG_PER_RUN = 50;

export const fetchNewsNightly = inngest.createFunction(
  { id: "fetch-news-nightly", concurrency: 1 },
  [
    { cron: "0 5 * * *" },
    { event: "news/fetch.requested" },
  ],
  async ({ step, logger }) => {
    const fetchCounts = await step.run("fetch-rss-feeds", async () => {
      let totalInserted = 0;
      let totalSkipped = 0;

      for (const source of NEWS_SOURCES) {
        const rawItems = await fetchRawItems(source);
        if (rawItems.length === 0) continue;

        const existing = await getExistingSourceUrls(
          rawItems.map((i) => i.sourceUrl),
        );
        const newItems = rawItems.filter((i) => !existing.has(i.sourceUrl));
        if (newItems.length === 0) {
          totalSkipped += rawItems.length;
          continue;
        }

        const { inserted, skipped } = await insertNewsItems(
          newItems.map((i) => ({
            sourceUrl: i.sourceUrl,
            source: source.id,
            industry: source.industry,
            headline: i.headline,
            publishedAt: i.publishedAt,
            linkedIndicatorCode: null,
            whyItMatters: null,
          })),
        );
        totalInserted += inserted;
        totalSkipped += skipped + existing.size;
      }

      return { inserted: totalInserted, skipped: totalSkipped };
    });

    logger.info(`fetch-news: inserted=${fetchCounts.inserted} skipped=${fetchCounts.skipped}`);

    const tagCount = await step.run("tag-untagged-items", async () => {
      const untagged = await db
        .select()
        .from(newsItems)
        .where(isNull(newsItems.linkedIndicatorCode))
        .orderBy(newsItems.createdAt)
        .limit(MAX_TAG_PER_RUN);

      let tagged = 0;
      for (const item of untagged) {
        try {
          const result = await tagHeadline(
            item.headline,
            item.industry as "restaurant" | "construction" | "retail",
          );
          if (result.linkedIndicatorCode) {
            await db
              .update(newsItems)
              .set({
                linkedIndicatorCode: result.linkedIndicatorCode,
                whyItMatters: result.whyItMatters,
              })
              .where(eq(newsItems.id, item.id));
            tagged++;
          }
        } catch {
          // skip items that fail; they'll be retried next run
        }
      }
      return tagged;
    });

    logger.info(`fetch-news: tagged=${tagCount}`);
    return { inserted: fetchCounts.inserted, tagged: tagCount };
  },
);
```

- [ ] **Step 2: Update inngest/index.ts**

Replace the entire file:

```typescript
// inngest/index.ts
import { inngest } from "./client";
import { fetchNewsNightly } from "./functions/fetch-news";

export { inngest };
export const functions = [fetchNewsNightly];
```

- [ ] **Step 3: Update app/api/inngest/route.ts**

Replace the entire file:

```typescript
// app/api/inngest/route.ts
export const runtime = "nodejs";

import { serve } from "inngest/next";
import { inngest, functions } from "@/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
```

- [ ] **Step 4: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add inngest/functions/fetch-news.ts inngest/index.ts app/api/inngest/route.ts
git commit -m "feat(news): add nightly Inngest function + wire serve handler"
```

---

## Task 8: Manual trigger cron route

**Files:**
- Create: `app/api/cron/news/route.ts`

- [ ] **Step 1: Create the trigger route**

```typescript
// app/api/cron/news/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(): Promise<NextResponse> {
  const result = await inngest.send({ name: "news/fetch.requested", data: {} });
  console.log("news/fetch.requested sent", result);
  return NextResponse.json({ ok: true, ids: result.ids });
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/news/route.ts
git commit -m "feat(news): add manual trigger cron route"
```

---

## Task 9: SignalsRail component

**Files:**
- Create: `components/dashboard/SignalsRail.tsx`

> Reads user's org industry via Clerk auth + DB. Shows 8 latest news_items. Falls back gracefully if no org or no items.

- [ ] **Step 1: Create the component**

```typescript
// components/dashboard/SignalsRail.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrgByClerkId } from "@/lib/db/queries/organizations";
import { getLatestNewsItems } from "@/lib/db/queries/news";
import type { NewsItem } from "@/lib/db/schema/news";

function formatTimeAgo(date: Date | null): string {
  if (!date) return "";
  const diffH = Math.round((Date.now() - date.getTime()) / 36e5);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.round(diffH / 24)}d ago`;
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <div className="py-2.5 border-b border-border last:border-0">
      <Link
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <p className="text-xs text-fg leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {item.headline}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-fg-muted">{item.source.replace(/_/g, " ")}</span>
          {item.whyItMatters && (
            <>
              <span className="text-[10px] text-fg-dim">·</span>
              <span className="text-[10px] text-accent truncate">{item.whyItMatters}</span>
            </>
          )}
          <span className="text-[10px] text-fg-dim ml-auto flex-shrink-0">
            {formatTimeAgo(item.fetchedAt)}
          </span>
        </div>
      </Link>
    </div>
  );
}

export async function SignalsRail() {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await getOrgByClerkId(orgId);
  if (!org) return null;

  const items = await getLatestNewsItems(org.industry, 8);

  return (
    <aside
      aria-label="Industry signals"
      className="px-4 py-5 h-full"
    >
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-display font-semibold text-fg">Signals</h2>
        <span className="text-[10px] uppercase tracking-wider text-fg-muted">
          {org.industry}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-fg-muted px-3 py-3 rounded-[var(--radius-sm)] border border-dashed border-border">
          No news items yet. First fetch runs at 5am UTC.
        </p>
      ) : (
        <div>
          {items.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/SignalsRail.tsx
git commit -m "feat(news): add SignalsRail component"
```

---

## Task 10: TodayCard component

**Files:**
- Create: `components/sidebar/TodayCard.tsx`

> Shows: formatted date, US market open/closed status (weekday + rough ET hours check), macro regime label (computed from FRED:DFF + HY spread), next briefing ETA (next Monday).

- [ ] **Step 1: Create the component**

```typescript
// components/sidebar/TodayCard.tsx
import { getRegimeSnapshot } from "@/lib/queries/dashboard";

const REGIME_DOT: Record<string, string> = {
  Restrictive: "bg-warn",
  Accommodative: "bg-good",
  Mixed: "bg-accent",
};

function formatTodayDate(now: Date): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

function getMarketStatus(now: Date): { open: boolean; label: string } {
  const etOffset = isDst(now) ? -4 : -5;
  const etHour =
    ((now.getUTCHours() + etOffset + 24) % 24) + now.getUTCMinutes() / 60;
  const day = now.getUTCDay();
  const etDay = ((day + Math.floor((now.getUTCHours() + etOffset) / 24)) + 7) % 7;
  const isWeekday = etDay >= 1 && etDay <= 5;
  const open = isWeekday && etHour >= 9.5 && etHour < 16;
  return { open, label: open ? "Markets open" : "Markets closed" };
}

function isDst(date: Date): boolean {
  const jan = new Date(date.getUTCFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getUTCFullYear(), 6, 1).getTimezoneOffset();
  return date.getTimezoneOffset() < Math.max(jan, jul);
}

function nextMondayLabel(now: Date): string {
  const d = new Date(now);
  const day = d.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setUTCDate(d.getUTCDate() + daysUntilMonday);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function TodayCard() {
  const now = new Date();
  const market = getMarketStatus(now);
  const regime = await getRegimeSnapshot("national");
  const dotClass = REGIME_DOT[regime.label] ?? REGIME_DOT["Mixed"]!;
  const briefingDate = nextMondayLabel(now);

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-bg-elev px-3 py-2.5 space-y-2">
      <p className="text-[11px] font-medium text-fg">{formatTodayDate(now)}</p>

      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
            market.open ? "bg-good" : "bg-fg-dim"
          }`}
          aria-hidden
        />
        <span className="text-[10px] text-fg-muted">{market.label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotClass}`}
          aria-hidden
        />
        <span className="text-[10px] text-fg-muted">
          {regime.label} · {regime.detail}
        </span>
      </div>

      <p className="text-[10px] text-fg-dim">
        Next briefing: <span className="text-fg-muted">{briefingDate}</span>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/sidebar/TodayCard.tsx
git commit -m "feat(sidebar): add TodayCard component"
```

---

## Task 11: WatchlistModule component

**Files:**
- Create: `components/sidebar/WatchlistModule.tsx`

> Reads `prefs.pinned` (max 5) from Clerk metadata. Fetches 3-month observations per pinned code. Shows latest value + 12-point mini sparkline. Empty state prompts pinning.

- [ ] **Step 1: Create the component**

```typescript
// components/sidebar/WatchlistModule.tsx
import Link from "next/link";
import { loadDashboardPrefs } from "@/app/app/actions";
import { getObservationsForCodes } from "@/lib/queries/observations";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { INDICATOR_REGISTRY } from "@/lib/indicators/registry";
import { classifyDelta } from "@/lib/queries/dashboard";

const MAX_WATCHLIST = 5;

function formatWatchlistValue(value: number, unit: string): string {
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 0 : abs >= 10 ? 1 : 2;
  return (
    value.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }) +
    (unit === "%" || unit === "index" || unit.length > 6 ? "" : ` ${unit}`)
  );
}

export async function WatchlistModule() {
  // TODO(stream-d): When Stream D (onboarding) ships, it will write pinned codes to
  // onboarding_state.pinned_indicator_codes. Stream D owns reconciliation: migrate
  // Clerk prefs.pinned → onboarding_state, then flip this read to the DB table.
  // Until then, Clerk metadata is the source of truth.
  const prefs = await loadDashboardPrefs();
  const codes = prefs.pinned.slice(0, MAX_WATCHLIST);

  if (codes.length === 0) {
    return (
      <div className="pt-3 border-t border-border">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-semibold text-fg uppercase tracking-wider">
            Watchlist
          </h3>
        </div>
        <p className="text-[11px] text-fg-muted leading-snug">
          Pin indicators from the{" "}
          <Link href="/app" className="text-accent hover:underline">
            dashboard
          </Link>{" "}
          to track them here.
        </p>
      </div>
    );
  }

  const obs = await getObservationsForCodes(codes, 3);

  const items = codes
    .map((code) => {
      const def = INDICATOR_REGISTRY.find((d) => d.code === code);
      if (!def) return null;
      const series = obs[code] ?? [];
      const latest = series.at(-1);
      if (!latest) return null;
      return {
        code,
        name: def.name,
        unit: def.unit,
        value: latest.value,
        sparkline: series.slice(-12).map((p) => p.value),
        positive: classifyDelta(def.costBucket) === "demand",
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="pt-3 border-t border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xs font-semibold text-fg uppercase tracking-wider">
          Watchlist
        </h3>
        <Link
          href="/app/indicators?pinned=1"
          className="text-[10px] text-accent hover:underline"
        >
          View all →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-fg-muted">No data yet for pinned indicators.</p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.code}>
              <Link
                href={`/app/indicators/${encodeURIComponent(item.code)}`}
                className="flex items-center gap-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-bg-elev-2 px-1 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-fg-muted truncate leading-none">
                    {item.name}
                  </p>
                  <p className="text-xs font-mono text-fg tabular-nums mt-0.5">
                    {formatWatchlistValue(item.value, item.unit)}
                  </p>
                </div>
                <Sparkline
                  values={item.sparkline}
                  positive={item.positive}
                  width={40}
                  height={20}
                  className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/sidebar/WatchlistModule.tsx
git commit -m "feat(sidebar): add WatchlistModule component"
```

---

## Task 12: Wire all components into layout

**Files:**
- Modify: `components/shell/Sidebar.tsx`
- Modify: `app/app/layout.tsx`

- [ ] **Step 1: Update Sidebar.tsx to include TodayCard + WatchlistModule**

Replace `components/shell/Sidebar.tsx` with:

```typescript
// components/shell/Sidebar.tsx
import { Suspense } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { NavLink } from "./NavLink";
import { TodayCard } from "@/components/sidebar/TodayCard";
import { WatchlistModule } from "@/components/sidebar/WatchlistModule";

const NAV_MAIN = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/briefings", label: "Briefings" },
  { href: "/app/alerts", label: "Alerts" },
  { href: "/app/indicators", label: "Indicators" },
] as const;

const NAV_SETTINGS = [
  { href: "/app/settings/profile", label: "Profile" },
  { href: "/app/settings/notifications", label: "Notifications" },
  { href: "/app/settings/billing", label: "Billing" },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 flex-col h-screen bg-bg border-r border-border sticky top-0">
      <div className="px-4 py-5 border-b border-border">
        <Link href="/app" aria-label="Stormline home" className="inline-flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG, no benefit from next/image */}
          <img
            src="/brand/logo.svg"
            alt="Stormline"
            width={360}
            height={72}
            className="h-6 w-auto select-none"
          />
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_MAIN.map((item) => (
          <NavLink key={item.href} href={item.href}>
            {item.label}
          </NavLink>
        ))}

        <div className="pt-5 pb-1 px-3">
          <span className="text-xs text-fg-muted uppercase tracking-wider font-medium">
            Settings
          </span>
        </div>

        {NAV_SETTINGS.map((item) => (
          <NavLink key={item.href} href={item.href}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 space-y-3">
        <Suspense
          fallback={
            <div className="h-20 rounded-[var(--radius-sm)] border border-border bg-bg-elev animate-pulse" />
          }
        >
          <TodayCard />
        </Suspense>

        <Suspense fallback={null}>
          <WatchlistModule />
        </Suspense>
      </div>

      <div className="px-4 py-4 border-t border-border">
        <UserButton />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Update app/app/layout.tsx to add SignalsRail right rail**

Replace `app/app/layout.tsx` with:

```typescript
// app/app/layout.tsx
import { Suspense } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { MobileSidebar } from "@/components/shell/MobileSidebar";
import { CommandPaletteProvider } from "@/components/command/CommandPaletteProvider";
import { SignalsRail } from "@/components/dashboard/SignalsRail";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Suspense
          fallback={<div className="h-12 flex-shrink-0 border-b border-border" />}
        >
          <TopBar />
        </Suspense>
        <main className="flex-1 p-6">{children}</main>
      </div>

      <aside className="hidden xl:flex w-72 flex-shrink-0 flex-col border-l border-border overflow-y-auto">
        <Suspense fallback={null}>
          <SignalsRail />
        </Suspense>
      </aside>

      <MobileSidebar />

      <Suspense fallback={null}>
        <CommandPaletteProvider />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/shell/Sidebar.tsx app/app/layout.tsx
git commit -m "feat(layout): wire SignalsRail, TodayCard, WatchlistModule into app layout"
```

---

## Task 13: Open draft PR

- [ ] **Step 1: Verify full typecheck is clean**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 2: Push branch**

```bash
git push -u origin feat/news-and-sidebar
```

- [ ] **Step 3: Open draft PR**

```bash
gh pr create --draft \
  --title "feat(news+sidebar): RSS ingestion, Claude tagging, SignalsRail, TodayCard, WatchlistModule" \
  --body "$(cat <<'EOF'
## Summary
- Nightly RSS ingestion for Restaurant Dive, Construction Dive, Retail Dive, NRA, AGC, NRF via fast-xml-parser
- Claude Haiku tagger links each headline to the closest indicator code with a ≤20-word why-it-matters note
- SignalsRail: right-rail (xl+ only) shows 8 latest industry news items across all /app pages
- TodayCard: sidebar date chip with market open/closed status and macro regime label
- WatchlistModule: sidebar section showing up to 5 pinned indicators with mini sparklines

## Owned files
See branch description — no overlap with schema.ts, briefings, alerts, onboarding, or ask files.

## Test plan
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run db:push` creates news_items table with unique index on source_url
- [ ] Manual POST to /api/cron/news returns `{ ok: true }` and triggers Inngest event
- [ ] After first fetch run, /app shows SignalsRail populated with industry news
- [ ] TodayCard shows correct date, market status, and regime label
- [ ] WatchlistModule empty state appears when no indicators are pinned
- [ ] WatchlistModule shows sparklines + values for pinned indicators
- [ ] Items with `why_it_matters` show the tag note in SignalsRail

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Architecture decisions

**Pinned indicator codes — source of truth:** Clerk metadata `prefs.pinned` (option b).
Stream D (onboarding) will write to `onboarding_state.pinned_indicator_codes`. Stream D owns reconciliation when it ships. WatchlistModule has a TODO comment flagging the handoff point.

## Post-implementation notes

- **ANTHROPIC_API_KEY** must be set in `.env.local` and Vercel project settings before the tagger will work.
- **Inngest signing key** (`INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY`) must be configured in Vercel for the cron function to receive triggers in production.
- **Region filtering**: `getLatestNewsItems` currently filters by industry only. Region-specific news can be added later by adding a `region` column to `news_items` and tagging items from regional sources.
- The `bg-bg-elev-2` token used in WatchlistModule hover state — verify it exists in the token system; fall back to `bg-bg-elev` if not present.
