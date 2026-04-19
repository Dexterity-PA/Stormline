// lib/news/fetcher.ts
import { XMLParser } from "fast-xml-parser";
import type { NewsSource } from "./sources";

const TIMEOUT_MS = 15_000;
const USER_AGENT = "Stormline/1.0 (ops@stormline.app)";

export interface RawNewsItem {
  headline: string;
  sourceUrl: string;
  publishedAt: Date;
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
  const channel = (root["rss"] as Record<string, unknown> | undefined)?.[
    "channel"
  ] as Record<string, unknown> | undefined;
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
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });
    if (!res.ok) return [];
    rawXml = await res.text();
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const parsed: unknown = parser.parse(rawXml);
  const rssItems = extractRssItems(parsed);

  const out: RawNewsItem[] = [];
  for (const item of rssItems) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const headline = parseString(obj["title"]);
    const link = parseLink(obj["link"]) ?? parseLink(obj["guid"]);
    const publishedAt = parsePubDate(obj["pubDate"]) ?? new Date();
    if (!headline || !link) continue;
    out.push({ headline, sourceUrl: link, publishedAt });
  }
  return out;
}
