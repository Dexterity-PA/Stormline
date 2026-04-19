import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/queries/organizations';
import { getOnboardingState, listIndustryProfileSchemas } from '@/lib/db/queries/onboarding';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
  const { orgId: clerkOrgId } = await auth();
  if (!clerkOrgId) redirect('/sign-in');

  const org = await getOrgByClerkId(clerkOrgId);
  if (!org) redirect('/sign-in');

  const [state, schemas] = await Promise.all([
    getOnboardingState(org.id),
    listIndustryProfileSchemas(),
  ]);

  if (state?.step === 'complete') redirect('/app');

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-fg">Welcome to Stormline</h2>
          <p className="text-sm text-fg-muted mt-1">
            Set up your profile to get industry-specific intelligence.
          </p>
        </div>
        <OnboardingWizard
          initialStep={(state?.step ?? 'industry') as 'industry' | 'region' | 'profile' | 'indicators' | 'channels' | 'complete'}
          initialState={state ?? null}
          profileSchemas={schemas}
        />
      </div>
    </div>
  );
}
