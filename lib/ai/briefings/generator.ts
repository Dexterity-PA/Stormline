import Anthropic from '@anthropic-ai/sdk';
import { getOrgById } from '@/lib/db/queries/organizations';
import { listIndicatorsByIndustry, getSeries } from '@/lib/db/queries/indicators';
import { createDraftBriefing } from '@/lib/db/queries/briefings';
import {
  GENERATED_BY_TAG,
  buildSystemPrompt,
  buildUserMessage,
  type BriefingContext,
  type IndicatorSnapshot,
} from './prompts';
import type { industryEnum } from '@/lib/db/schema';

type Industry = (typeof industryEnum.enumValues)[number];

function percentileRank(value: number, series: number[]): number {
  if (series.length === 0) return 50;
  const below = series.filter((v) => v <= value).length;
  return Math.round((below / series.length) * 100);
}

async function fetchSnapshots(
  industry: Industry,
  _region: string,
): Promise<IndicatorSnapshot[]> {
  const rows = await listIndicatorsByIndustry(industry);
  const now = new Date();
  const since52w = new Date(now.getTime() - 52 * 7 * 24 * 60 * 60 * 1000);
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const snapshots: IndicatorSnapshot[] = [];

  for (const ind of rows) {
    const series = await getSeries(ind.code, since52w, now);
    if (series.length === 0) continue;

    const latest = series[series.length - 1];
    if (!latest) continue;
    const latestValue = parseFloat(latest.value);

    const before4wk = series.filter((p) => p.observedAt <= fourWeeksAgo);
    let delta4wk: number | null = null;
    let delta4wkPct: number | null = null;
    if (before4wk.length > 0) {
      const ref = parseFloat(before4wk[before4wk.length - 1]!.value);
      if (ref !== 0) {
        delta4wk = latestValue - ref;
        delta4wkPct = ((latestValue - ref) / Math.abs(ref)) * 100;
      }
    }

    const allValues = series.map((p) => parseFloat(p.value));
    const percentile52wk = allValues.length >= 4 ? percentileRank(latestValue, allValues) : null;

    snapshots.push({
      code: ind.code,
      name: ind.name,
      unit: ind.unit,
      costBucket: ind.costBucket,
      latestValue,
      latestDate: latest.observedAt,
      delta4wk,
      delta4wkPct,
      percentile52wk,
    });
  }

  return snapshots;
}

function currentWeekRange(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const day = now.getDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now.getTime() - daysToMonday * 86_400_000);
  const sunday = new Date(monday.getTime() + 6 * 86_400_000);
  const fmt = (d: Date) => d.toISOString().split('T')[0] ?? '';
  return { weekStart: fmt(monday), weekEnd: fmt(sunday) };
}

export async function generateDraft(
  orgId: string,
  industry: Industry,
  region: string,
): Promise<string> {
  const org = await getOrgById(orgId);
  if (!org) throw new Error(`Organization not found: ${orgId}`);

  const indicators = await fetchSnapshots(industry, region);
  const { weekStart, weekEnd } = currentWeekRange();

  // Stream D hook: once feat/onboarding-flow merges, import getOnboardingState
  // and set: industryProfile = os?.industryProfile ? JSON.stringify(os.industryProfile) : undefined
  // Table: onboarding_state.industry_profile (jsonb), keyed on org_id = org.id
  const industryProfile: string | undefined = undefined;

  const ctx: BriefingContext = {
    industry,
    region,
    weekStart,
    weekEnd,
    indicators,
    industryProfile,
  };

  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: buildSystemPrompt(industry),
    messages: [{ role: 'user', content: buildUserMessage(ctx) }],
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('Anthropic returned unexpected content type');
  }
  const bodyMd = block.text;

  const firstNonEmpty = bodyMd.split('\n').find((l) => l.trim().length > 0) ?? '';
  const headline = firstNonEmpty.replace(/^#+\s*/, '').trim()
    || `${industry.charAt(0).toUpperCase() + industry.slice(1)} Briefing — Week of ${weekStart}`;

  const briefing = await createDraftBriefing({
    industry,
    regionState: region.length === 2 ? region.toUpperCase() : null,
    regionMetro: region.length > 2 ? region : undefined,
    weekStart,
    weekEnd,
    headline,
    bodyMd,
    generatedBy: GENERATED_BY_TAG,
  });

  return briefing.id;
}
