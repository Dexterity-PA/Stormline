export const PROMPT_VERSION = 'v1.0';
export const GENERATED_BY_TAG = `claude-sonnet-4-6@prompt-${PROMPT_VERSION}`;

export type IndicatorSnapshot = {
  code: string;
  name: string;
  unit: string;
  costBucket: string | null;
  latestValue: number;
  latestDate: Date;
  delta4wk: number | null;
  delta4wkPct: number | null;
  percentile52wk: number | null;
};

export type BriefingContext = {
  industry: 'restaurant' | 'construction' | 'retail';
  region: string;
  weekStart: string;
  weekEnd: string;
  indicators: IndicatorSnapshot[];
  industryProfile?: string;
};

const INDUSTRY_LABELS: Record<BriefingContext['industry'], string> = {
  restaurant: 'restaurant',
  construction: 'light construction',
  retail: 'independent retail',
};

export function buildSystemPrompt(industry: BriefingContext['industry']): string {
  return `You are a macro intelligence analyst producing a weekly operational briefing for ${INDUSTRY_LABELS[industry]} operators.

FRAMING RULES — NON-NEGOTIABLE:
• You provide market intelligence only. Never financial, legal, or tax advice.
• NEVER use: "you should", "consider doing", "we recommend", "action item", or any directive language.
• ALWAYS frame observations using: "historical data shows", "historical pattern indicates", "operators in similar conditions have historically", "data suggests", "trends indicate", "historical precedent shows".
• Every claim must be grounded in the indicator data provided in the user message.
• End the briefing with exactly this disclaimer on its own line:
  "Stormline provides market intelligence, not financial, legal, or tax advice. Consult licensed professionals for decisions specific to your business."

STRUCTURE (use ## for each section heading):
1. ## Headline — one sentence. The single most significant indicator movement this week and its historical context.
2. ## Input Costs — key cost driver changes with 4-week delta and 52-week percentile framing.
3. ## Demand Signal — demand-side indicators with historical pattern framing.
4. ## Watch List — 2–3 developing events or trends with historical precedent. Number each item.
5. ## Operator Context — what operators in similar historical cost/demand environments have historically done. No directives.

TARGET LENGTH: 600–900 words. Be thorough but not padded.
FORMAT: Markdown with ## headings. Use **bold** for indicator names on first mention.`;
}

function formatDelta(snapshot: IndicatorSnapshot): string {
  if (snapshot.delta4wk === null || snapshot.delta4wkPct === null) return 'insufficient history';
  const sign = snapshot.delta4wk >= 0 ? '+' : '';
  const absVal = Math.abs(snapshot.delta4wkPct) < 10
    ? snapshot.delta4wkPct.toFixed(2)
    : snapshot.delta4wkPct.toFixed(1);
  return `${sign}${absVal}% (4wk)`;
}

function formatPercentile(snapshot: IndicatorSnapshot): string {
  if (snapshot.percentile52wk === null) return 'no 52-week history';
  return `${snapshot.percentile52wk}th percentile of 52-week range`;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0] ?? 'unknown';
}

export function buildUserMessage(ctx: BriefingContext): string {
  const lines: string[] = [
    `BRIEFING REQUEST`,
    `Industry: ${ctx.industry}`,
    `Region: ${ctx.region}`,
    `Week: ${ctx.weekStart} to ${ctx.weekEnd}`,
    '',
    `INDICATOR DATA (as of latest available observation):`,
    '',
  ];

  if (ctx.indicators.length === 0) {
    lines.push('No indicator data available. Generate a briefing noting that data is pending sync.');
  } else {
    for (const s of ctx.indicators) {
      lines.push(
        `• ${s.name} [${s.code}]`,
        `  Value: ${s.latestValue} ${s.unit} (as of ${formatDate(s.latestDate)})`,
        `  4-Week Change: ${formatDelta(s)}`,
        `  52-Week Percentile: ${formatPercentile(s)}`,
        s.costBucket ? `  Cost Bucket: ${s.costBucket}` : '',
        '',
      );
    }
  }

  if (ctx.industryProfile) {
    lines.push('', 'ORG INDUSTRY PROFILE (additional operator context):', ctx.industryProfile, '');
  }

  lines.push(
    '',
    'Generate a weekly briefing following the structure and framing rules in the system prompt.',
    'Base all observations on the indicator data above.',
  );

  return lines.filter((l) => l !== null).join('\n');
}
