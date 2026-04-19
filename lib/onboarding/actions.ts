'use server';

import { cookies } from 'next/headers';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import { getOrgByClerkId, upsertOrg } from '@/lib/db/queries/organizations';
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

const INDUSTRY_LABELS: Record<Industry, string> = {
  restaurant: 'Restaurant',
  construction: 'Construction',
  retail: 'Retail',
};

/**
 * Step 1: Create the Clerk organization for a new user.
 * Returns the Clerk org ID so the client can call setActive().
 * Idempotent: if the user already has an active org (interrupted onboarding),
 * returns the existing Clerk org ID without creating a duplicate.
 */
export async function createClerkOrgAction(industry: Industry): Promise<string> {
  const { userId, orgId: existingClerkOrgId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  // Resuming an interrupted onboarding — org already exists in Clerk
  if (existingClerkOrgId) return existingClerkOrgId;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const firstName = user.firstName ?? 'My';
  const orgName = `${firstName}'s ${INDUSTRY_LABELS[industry]}`;

  const org = await client.organizations.createOrganization({
    name: orgName,
    createdBy: userId,
  });

  return org.id;
}

/**
 * Step 2: Provision the DB org, member row, and initial onboarding_state.
 * Called after the Clerk org exists and setActive() has been called client-side.
 * Idempotent via upsertOrg (ON CONFLICT DO UPDATE on clerkOrgId).
 */
export async function provisionDbOrgAction(
  industry: Industry,
  regionState: string,
  regionMetro?: string,
): Promise<void> {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
  if (!clerkUserId || !clerkOrgId) throw new Error('Not authenticated or no active org');

  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const firstName = user.firstName ?? 'My';
  const orgName = `${firstName}'s ${INDUSTRY_LABELS[industry]}`;

  const org = await upsertOrg({
    clerkOrgId,
    name: orgName,
    industry,
    regionState,
    regionMetro,
  });

  const existingMember = await getMemberByClerkAndOrg(clerkUserId, org.id);
  if (!existingMember) {
    await db.insert(members).values({ orgId: org.id, clerkUserId, role: 'owner' });
  }

  await upsertOnboardingState(org.id, {
    step: 'profile',
    selectedIndustry: industry,
    selectedRegions: regionMetro ? [regionState, regionMetro] : [regionState],
  });
}

async function resolveOrgId(clerkOrgId?: string | null): Promise<string> {
  const id = clerkOrgId ?? (await auth()).orgId;
  if (!id) throw new Error('No active organization');
  const org = await getOrgByClerkId(id);
  if (!org) throw new Error(`Organization not found for clerkOrgId ${id}`);
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

  const orgId = await resolveOrgId(clerkOrgId);
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
