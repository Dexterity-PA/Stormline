import Anthropic from '@anthropic-ai/sdk';
import { getOrgByClerkId } from '@/lib/db/queries/organizations';
import { listIndicatorsByIndustry, getLatestValues } from '@/lib/db/queries/indicators';
import { buildSystemPrompt, type SnapshotEntry } from './prompts';
import type { Organization } from '@/lib/db/queries/organizations';

let _anthropic: Anthropic | null = null;
export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY not configured');
    _anthropic = new Anthropic({ apiKey: key });
  }
  return _anthropic;
}

export interface AskContext {
  org: Organization;
  snapshot: SnapshotEntry[];
  systemPrompt: string;
}

export async function buildAskContext(clerkOrgId: string): Promise<AskContext> {
  const org = await getOrgByClerkId(clerkOrgId);
  if (!org) throw new Error('Organization not found');

  const orgIndicators = await listIndicatorsByIndustry(org.industry);
  const latestValues = await getLatestValues(orgIndicators.map((i) => i.id));

  const snapshot: SnapshotEntry[] = latestValues.flatMap((lv) => {
    const ind = orgIndicators.find((i) => i.id === lv.indicatorId);
    return ind
      ? [{ code: ind.code, name: ind.name, value: lv.value, unit: ind.unit, observedAt: lv.observedAt }]
      : [];
  });

  const systemPrompt = buildSystemPrompt({
    industry: org.industry,
    regionState: org.regionState,
    indicatorSnapshot: snapshot,
  });

  return { org, snapshot, systemPrompt };
}

const CODE_RE = /\b([A-Z_]+:[A-Z0-9_]+)\b/g;

export function extractCitedCodes(text: string): string[] {
  const seen = new Set<string>();
  const codes: string[] = [];
  for (const [, code] of text.matchAll(CODE_RE)) {
    if (!seen.has(code)) {
      seen.add(code);
      codes.push(code);
    }
  }
  return codes;
}
