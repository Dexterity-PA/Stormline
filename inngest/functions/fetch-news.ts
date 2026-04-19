// inngest/functions/fetch-news.ts
import { inngest } from "@/inngest/client";
import {
  insertNewsItems,
  getExistingSourceUrls,
  getUntaggedNewsItems,
  setNewsItemTag,
} from "@/lib/db/queries/news";
import { NEWS_SOURCES } from "@/lib/news/sources";
import { fetchRawItems } from "@/lib/news/fetcher";
import { tagHeadline } from "@/lib/news/tagger";

const MAX_TAG_PER_RUN = 50;

export const fetchNewsNightly = inngest.createFunction(
  {
    id: "fetch-news-nightly",
    concurrency: 1,
    triggers: [{ cron: "0 5 * * *" }, { event: "news/fetch.requested" }],
  },
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
            region: null,
          })),
        );
        totalInserted += inserted;
        totalSkipped += skipped + existing.size;
      }

      return { inserted: totalInserted, skipped: totalSkipped };
    });

    logger.info(
      `fetch-news: inserted=${fetchCounts.inserted} skipped=${fetchCounts.skipped}`,
    );

    const tagCount = await step.run("tag-untagged-items", async () => {
      const untagged = await getUntaggedNewsItems(MAX_TAG_PER_RUN);

      let tagged = 0;
      for (const item of untagged) {
        if (!item.industry) continue;
        try {
          const result = await tagHeadline(
            item.headline,
            item.industry as "restaurant" | "construction" | "retail",
          );
          if (result.linkedIndicatorCode) {
            await setNewsItemTag(
              item.id,
              result.linkedIndicatorCode,
              result.whyItMatters,
            );
            tagged++;
          }
        } catch {
          // skip items that fail; retried next run
        }
      }
      return tagged;
    });

    logger.info(`fetch-news: tagged=${tagCount}`);
    return { inserted: fetchCounts.inserted, tagged: tagCount };
  },
);
