import { currentUser } from '@clerk/nextjs/server';
import { CurrentPlanCard } from '@/components/billing/CurrentPlanCard';
import { PlanComparisonGrid } from '@/components/billing/PlanComparisonGrid';
import { BillingHistoryCard } from '@/components/billing/BillingHistoryCard';
import type { PlanTier } from '@/components/billing/plans';

type ClerkBillingMeta = {
  planTier?: PlanTier | 'trial';
  subscriptionStatus?: 'trial' | 'active' | 'past_due' | 'canceled';
  trialEndsAt?: string;
  nextBillingDate?: string;
  priceDisplay?: string;
};

const TIER_LABELS: Record<PlanTier | 'trial', string> = {
  trial: 'Trial',
  core: 'Core',
  pro: 'Pro',
  multi: 'Multi-location',
};

const TRIAL_FEATURES = [
  'Full access to one industry',
  'Weekly briefing',
  'Live dashboard',
  'Email alerts',
];

export default async function BillingPage() {
  const user = await currentUser();
  const meta = (user?.publicMetadata ?? {}) as ClerkBillingMeta;

  const currentTier: PlanTier | 'trial' = meta.planTier ?? 'trial';
  const status = meta.subscriptionStatus ?? 'trial';
  const tierLabel = TIER_LABELS[currentTier];

  const priceDisplay =
    meta.priceDisplay ??
    (currentTier === 'trial'
      ? '$0'
      : currentTier === 'core'
      ? '$199/mo'
      : currentTier === 'pro'
      ? '$399/mo'
      : '$799/mo');

  const renewalLine =
    status === 'trial'
      ? `Trial ends ${meta.trialEndsAt ?? 'in ~14 days'}`
      : meta.nextBillingDate
      ? `Next invoice ${meta.nextBillingDate}`
      : 'Renewal date syncing from Stripe';

  const statusLabel =
    status === 'trial'
      ? 'Trial · no card on file'
      : status === 'active'
      ? 'Active subscription'
      : status === 'past_due'
      ? 'Payment past due — access continues during 7-day grace window'
      : 'Canceled — access ends at period close';

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">Billing</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Current subscription, available plans, and invoices.
        </p>
      </div>

      <div className="space-y-6">
        <CurrentPlanCard
          tierLabel={tierLabel}
          status={status}
          statusLabel={statusLabel}
          priceDisplay={priceDisplay}
          renewalLine={renewalLine}
          included={TRIAL_FEATURES}
        />

        <PlanComparisonGrid currentTier={currentTier} />

        <BillingHistoryCard invoices={null} />
      </div>
    </div>
  );
}
