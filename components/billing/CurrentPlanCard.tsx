import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface CurrentPlanCardProps {
  tierLabel: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled';
  statusLabel: string;
  priceDisplay: string;
  renewalLine: string;
  included: string[];
}

const STATUS_BADGES: Record<
  CurrentPlanCardProps['status'],
  { variant: 'industry' | 'severity' | 'status'; label: string }
> = {
  trial: { variant: 'status', label: 'trial' },
  active: { variant: 'status', label: 'published' },
  past_due: { variant: 'severity', label: 'medium' },
  canceled: { variant: 'severity', label: 'low' },
};

export function CurrentPlanCard({
  tierLabel,
  status,
  statusLabel,
  priceDisplay,
  renewalLine,
  included,
}: CurrentPlanCardProps) {
  const badge = STATUS_BADGES[status];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-medium text-fg">Current plan</h2>
            <Badge variant={badge.variant} label={badge.label} />
          </div>
          <p className="text-xs text-fg-muted">{statusLabel}</p>
          <p className="text-xs text-fg-muted mt-0.5">{renewalLine}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display font-semibold text-fg">
            {priceDisplay}
          </p>
          <p className="text-xs text-fg-muted mt-0.5">{tierLabel}</p>
        </div>
      </div>

      <div className="border-t border-border pt-4 grid grid-cols-2 gap-y-2 text-sm text-fg-muted">
        {included.map((f) => (
          <p key={f} className="flex items-start gap-2">
            <span className="text-good mt-0.5">✓</span>
            <span>{f}</span>
          </p>
        ))}
      </div>

      <div className="border-t border-border mt-5 pt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" disabled>
          Open Stripe portal
        </Button>
        <span className="text-xs text-fg-dim">
          Portal integration lands in the billing stream.
        </span>
      </div>
    </Card>
  );
}
