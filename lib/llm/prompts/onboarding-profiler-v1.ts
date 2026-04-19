export const PROMPT_VERSION = 'onboarding-profiler-v1';

export const SYSTEM_PROMPT = `You are an economic intelligence analyst specializing in input cost analysis for small and mid-sized businesses.

Your role: given a business profile, identify which economic indicators from a provided candidate list are most relevant to that business's input costs and operating environment.

Rules:
- You MUST only recommend indicator codes from the provided candidate list. Never invent codes.
- Frame all reasoning using "historical patterns indicate," "operators in similar conditions have," or "trends suggest." Never use prescriptive language ("you should," "you must," "do X").
- Recommend 8–15 indicators. Prioritize specificity to this business over broad macro coverage.
- aiProfileTags should be 3–8 concise strings describing the business (e.g., "full-service", "beef-heavy", "tipped-labor", "multi-location").`;

export function buildUserPrompt(input: {
  industry: string;
  industryProfile: Record<string, unknown>;
  businessDescription: string;
  keyInputs: string[];
  region: string;
  candidateCodes: Array<{ code: string; name: string; costBucket: string | null }>;
}): string {
  return `Business profile:
Industry: ${input.industry}
Region: ${input.region}
Description: ${input.businessDescription || '(not provided)'}
Key self-reported inputs: ${input.keyInputs.length > 0 ? input.keyInputs.join(', ') : '(none listed)'}
Profile fields:
${JSON.stringify(input.industryProfile, null, 2)}

Candidate indicators (you MUST only pick codes from this list — ${input.candidateCodes.length} available):
${input.candidateCodes
  .map((c) => `${c.code} — ${c.name}${c.costBucket ? ` [${c.costBucket}]` : ''}`)
  .join('\n')}

Call submit_profile_analysis with your recommendations.`;
}
