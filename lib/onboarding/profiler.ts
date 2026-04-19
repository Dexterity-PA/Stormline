import Anthropic from '@anthropic-ai/sdk';
import { listIndicatorsByIndustry } from '@/lib/db/queries/indicators';
import {
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  buildUserPrompt,
} from '@/lib/llm/prompts/onboarding-profiler-v1';
import type { Industry } from '@/lib/indicators/types';

const anthropic = new Anthropic();

export const PROFILER_GENERATED_BY = `claude-sonnet-4@${PROMPT_VERSION}`;

export interface ProfilerInput {
  industry: Industry;
  industryProfile: Record<string, unknown>;
  businessDescription: string;
  keyInputs: string[];
  region: string;
}

export interface ProfilerOutput {
  aiProfileTags: string[];
  aiRecommendedIndicators: string[];
  reasoning: string;
}

const TOOL_NAME = 'submit_profile_analysis';

export async function runProfiler(input: ProfilerInput): Promise<ProfilerOutput> {
  const indicators = await listIndicatorsByIndustry(input.industry);
  const candidateCodes = indicators.map((i) => ({
    code: i.code,
    name: i.name,
    costBucket: i.costBucket,
  }));
  const candidateCodeSet = new Set(candidateCodes.map((c) => c.code));

  if (candidateCodes.length === 0) {
    throw new Error(`Profiler: no indicators found for industry "${input.industry}"`);
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt({ ...input, candidateCodes }) }],
    tools: [
      {
        name: TOOL_NAME,
        description: 'Submit the profile analysis result',
        input_schema: {
          type: 'object' as const,
          properties: {
            aiProfileTags: {
              type: 'array',
              items: { type: 'string' },
              description: '3–8 concise profile tags describing this business',
            },
            aiRecommendedIndicators: {
              type: 'array',
              items: { type: 'string' },
              description: 'Indicator codes from the candidate list only — 8 to 15 items',
            },
            reasoning: {
              type: 'string',
              description:
                'Brief reasoning using "historical patterns indicate" / "operators in similar conditions have" framing',
            },
          },
          required: ['aiProfileTags', 'aiRecommendedIndicators', 'reasoning'],
        },
      },
    ],
    tool_choice: { type: 'any' as const },
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === TOOL_NAME,
  );
  if (!toolUse) {
    throw new Error('Profiler: Claude did not call submit_profile_analysis');
  }

  const raw = toolUse.input as {
    aiProfileTags: unknown;
    aiRecommendedIndicators: unknown;
    reasoning: unknown;
  };

  if (
    !Array.isArray(raw.aiProfileTags) ||
    !Array.isArray(raw.aiRecommendedIndicators) ||
    typeof raw.reasoning !== 'string'
  ) {
    throw new Error('Profiler: malformed tool input from Claude');
  }

  const aiProfileTags = raw.aiProfileTags.filter((t): t is string => typeof t === 'string');
  const aiRecommendedIndicators = (raw.aiRecommendedIndicators as unknown[]).filter(
    (c): c is string => typeof c === 'string' && candidateCodeSet.has(c),
  );

  if (aiRecommendedIndicators.length === 0) {
    throw new Error('Profiler: Claude returned no valid indicator codes from the candidate list');
  }

  return { aiProfileTags, aiRecommendedIndicators, reasoning: raw.reasoning };
}
