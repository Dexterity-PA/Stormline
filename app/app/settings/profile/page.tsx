import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { ProfileCard } from '@/components/settings/ProfileCard';
import { UsageCard } from '@/components/settings/UsageCard';
import { NotificationPrefsCard } from '@/components/settings/NotificationPrefsCard';

export default async function ProfilePage() {
  const user = await currentUser();

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null;
  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  const billingMeta = (user?.publicMetadata ?? {}) as {
    planTier?: string;
    nextBillingDate?: string;
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">Profile</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Account, usage patterns, and alert routing.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ProfileCard
            name={name}
            email={email}
            industry="restaurant"
            region="National (default)"
            subscription="trial"
          />
        </div>
        <div className="flex flex-col gap-4">
          <UsageCard
            briefingsReadThisMonth={null}
            alertsReceivedThisMonth={null}
            planTier={billingMeta.planTier ?? 'Trial'}
            nextBillingDate={billingMeta.nextBillingDate ?? null}
          />
          <Suspense fallback={<PrefsSkeleton />}>
            <NotificationPrefsCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PrefsSkeleton() {
  return (
    <div className="bg-bg-elev border border-border rounded-[var(--radius-md)] p-5">
      <div className="h-4 w-40 bg-bg-elev-2 rounded animate-pulse mb-3" />
      <div className="h-24 w-full bg-bg-elev-2 rounded animate-pulse" />
    </div>
  );
}
