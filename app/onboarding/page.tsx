import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/queries/organizations';
import { getOnboardingState, listIndustryProfileSchemas } from '@/lib/db/queries/onboarding';
import { OnboardingWizard, type Step } from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
  const { userId, orgId: clerkOrgId } = await auth();
  if (!userId) redirect('/sign-in');

  // DB org may not exist yet — that is expected for new users in early onboarding.
  // The wizard's Step 1 creates the Clerk org; Step 2 provisions the DB org.
  const org = clerkOrgId ? await getOrgByClerkId(clerkOrgId) : null;
  const state = org ? await getOnboardingState(org.id) : null;

  if (state?.step === 'complete') redirect('/app');

  const schemas = await listIndustryProfileSchemas();

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
          initialStep={(state?.step ?? 'industry') as Step}
          initialState={state ?? null}
          profileSchemas={schemas}
        />
      </div>
    </div>
  );
}
