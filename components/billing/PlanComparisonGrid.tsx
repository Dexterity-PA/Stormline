import { Button } from '@/components/ui/Button';
import { PLANS, type PlanTier } from './plans';

export interface PlanComparisonGridProps {
  currentTier: PlanTier | 'trial';
}

export function PlanComparisonGrid({ currentTier }: PlanComparisonGridProps) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-fg">Plans</h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Annual billing saves ~17% on any tier.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-fg-dim font-medium">
          Pricing — intelligence, not advice
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          return (
            <div
              key={plan.tier}
              className={`relative flex flex-col rounded-[var(--radius-md)] border p-5 transition-colors ${
                isCurrent
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-bg-elev'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2 right-4 rounded-full bg-accent text-bg text-[10px] font-medium px-2 py-0.5">
                  Current
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-display font-semibold text-fg">
                  {plan.name}
                </h3>
                <span className="text-sm text-fg-muted">
                  <span className="text-fg text-lg font-display font-semibold">
                    {plan.price}
                  </span>
                  {plan.cadence}
                </span>
              </div>
              <p className="text-xs text-fg-muted mt-1.5">{plan.tagline}</p>

              <ul className="mt-4 space-y-2 text-sm text-fg flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-good mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <Button
                  variant={isCurrent ? 'outline' : 'primary'}
                  size="sm"
                  disabled
                  className="w-full justify-center"
                >
                  {isCurrent ? 'Current plan' : `Upgrade to ${plan.name}`}
                </Button>
                <p className="text-[10px] text-fg-dim mt-2 text-center">
                  Stripe portal link wiring pending.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
