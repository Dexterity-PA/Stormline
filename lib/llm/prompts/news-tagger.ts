// lib/llm/prompts/news-tagger.ts
export const NEWS_TAGGER_MODEL = "claude-sonnet-4-6";
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
