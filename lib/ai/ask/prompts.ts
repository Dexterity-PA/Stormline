export interface SnapshotEntry {
  code: string;
  name: string;
  value: string;
  unit: string;
  observedAt: Date;
}

export function buildSystemPrompt(context: {
  industry: string;
  regionState: string;
  indicatorSnapshot: SnapshotEntry[];
}): string {
  const rows = context.indicatorSnapshot
    .map(
      (i) =>
        `- ${i.code} | ${i.name}: ${i.value} ${i.unit} (${i.observedAt.toISOString().split('T')[0]})`,
    )
    .join('\n');

  return `You are a macro intelligence analyst for SMB operators in the ${context.industry} industry operating in ${context.regionState}.

Answer using ONLY the indicator data provided below. Cite indicators by their exact code (e.g., FRED:DFF) wherever relevant. Frame all observations as historical patterns, data trends, and contextual intelligence — never as personal advice or recommendations. Use language like "historical patterns show," "current data indicates," "operators in similar conditions have observed." Never say "you should," "you must," or "I recommend."

If the available data is insufficient to answer the question, state that clearly rather than speculating.

INDICATOR SNAPSHOT (${context.indicatorSnapshot.length} indicators, latest available values):
${rows || 'No indicator data currently available for your industry.'}

Respond in plain prose, 2–4 paragraphs.`;
}
