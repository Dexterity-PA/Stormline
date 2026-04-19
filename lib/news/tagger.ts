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
      confidence:
        typeof r["confidence"] === "string" ? r["confidence"] : "low",
    };
  } catch {
    return {
      linked_indicator_code: null,
      why_it_matters: null,
      confidence: "low",
    };
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
    return {
      linkedIndicatorCode: null,
      whyItMatters: null,
      modelVersion: NEWS_TAGGER_VERSION,
    };
  }

  const parsed = parseResponse(block.text);
  if (parsed.confidence === "low") {
    return {
      linkedIndicatorCode: null,
      whyItMatters: null,
      modelVersion: NEWS_TAGGER_VERSION,
    };
  }

  return {
    linkedIndicatorCode: parsed.linked_indicator_code,
    whyItMatters: parsed.why_it_matters,
    modelVersion: NEWS_TAGGER_VERSION,
  };
}
