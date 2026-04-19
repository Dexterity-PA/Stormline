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
