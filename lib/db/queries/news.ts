// lib/db/queries/news.ts
import { desc, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { newsItems, industryEnum } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type NewsItem = InferSelectModel<typeof newsItems>;

export const InsertNewsItemInput = z.object({
  sourceUrl: z.string().url(),
  source: z.string().min(1),
  industry: z.enum(industryEnum.enumValues).nullable(),
  headline: z.string().min(1),
  publishedAt: z.date(),
  linkedIndicatorCode: z.string().nullable().default(null),
  whyItMatters: z.string().max(120).nullable().default(null),
  region: z.string().nullable().default(null),
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
        region: i.region,
      })),
    )
    .onConflictDoNothing({ target: newsItems.sourceUrl })
    .returning({ id: newsItems.id });
  return { inserted: inserted.length, skipped: parsed.length - inserted.length };
}

export async function getLatestNewsItems(
  industry: (typeof industryEnum.enumValues)[number],
  limit = 8,
): Promise<NewsItem[]> {
  return db
    .select()
    .from(newsItems)
    .where(eq(newsItems.industry, industry))
    .orderBy(desc(newsItems.createdAt))
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

export async function getUntaggedNewsItems(limit = 50): Promise<NewsItem[]> {
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
