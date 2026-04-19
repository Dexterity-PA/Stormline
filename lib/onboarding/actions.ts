'use server';

import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/queries/organizations';
import { getMemberByClerkAndOrg, updateNotificationPrefs } from '@/lib/db/queries/members';
import { listIndicatorsByIndustry } from '@/lib/db/queries/indicators';
import {
  completeOnboarding,
  getOnboardingState,
  upsertOnboardingState,
  type OnboardingPatch,
} from '@/lib/db/queries/onboarding';
import { runProfiler, type ProfilerInput } from '@/lib/onboarding/profiler';
import type { Indicator } from '@/lib/db/queries/indicators';
import type { Industry } from '@/lib/indicators/types';

async function resolveOrgId(): Promise<string> {
  const { orgId: clerkOrgId } = await auth();
  if (!clerkOrgId) throw new Error('No active organization');
  const org = await getOrgByClerkId(clerkOrgId);
  if (!org) throw new Error(`Organization not found for clerkOrgId ${clerkOrgId}`);
  return org.id;
}

export async function upsertOnboardingStateAction(patch: OnboardingPatch): Promise<void> {
  const orgId = await resolveOrgId();
  await upsertOnboardingState(orgId, patch);
}

export async function runProfilerAction(input: ProfilerInput): Promise<string[]> {
  const orgId = await resolveOrgId();
  try {
    const result = await runProfiler(input);
    await upsertOnboardingState(orgId, {
      aiProfileTags: result.aiProfileTags,
      aiRecommendedIndicators: result.aiRecommendedIndicators,
    });
    return result.aiRecommendedIndicators;
  } catch (err) {
    console.error('[runProfilerAction] profiler failed:', err);
    return [];
  }
}

export async function getIndustryIndicatorsAction(
  industry: Industry,
): Promise<Indicator[]> {
  return listIndicatorsByIndustry(industry);
}

export async function completeOnboardingAction(phone?: string): Promise<void> {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
  if (!clerkUserId || !clerkOrgId) throw new Error('Not authenticated');

  const orgId = await resolveOrgId();
  const state = await getOnboardingState(orgId);

  await completeOnboarding(orgId);

  if (state?.notificationChannels && state.notificationChannels.length > 0) {
    const member = await getMemberByClerkAndOrg(clerkUserId, orgId);
    if (member) {
      const ch = state.notificationChannels;
      await updateNotificationPrefs(member.id, {
        emailBriefing: ch.includes('email'),
        emailAlerts: ch.includes('email'),
        smsAlerts: ch.includes('sms'),
        ...(phone ? { phone } : {}),
      });
    }
  }

  // Set cookie so middleware skips the DB check on subsequent /app/* visits
  const cookieStore = await cookies();
  cookieStore.set('sl-ob', '1', {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });
}
