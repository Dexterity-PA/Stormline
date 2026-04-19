import { Card } from '@/components/ui/Card';

export interface UsageCardProps {
  briefingsReadThisMonth: number | null;
  alertsReceivedThisMonth: number | null;
  planTier: string;
  nextBillingDate: string | null;
}

export function UsageCard({
  briefingsReadThisMonth,
  alertsReceivedThisMonth,
  planTier,
  nextBillingDate,
}: UsageCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-fg">Usage this month</h2>
        <span className="text-[10px] uppercase tracking-wider text-fg-dim font-medium">
          Indicative
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="Briefings read"
          value={briefingsReadThisMonth}
          muted="coming soon"
        />
        <Stat
          label="Alerts received"
          value={alertsReceivedThisMonth}
          muted="coming soon"
        />
      </div>

      <div className="border-t border-border mt-5 pt-4 space-y-3 text-sm">
        <Row label="Plan tier" value={planTier} />
        <Row
          label="Next billing"
          value={nextBillingDate ?? '—'}
          muted={nextBillingDate ? undefined : 'no active subscription'}
        />
      </div>

      <p className="text-xs text-fg-dim mt-5">
        Usage trends surface historical patterns for operators on similar plans —
        not directives.
      </p>
    </Card>
  );
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: number | null;
  muted: string;
}) {
  const display = value === null ? '—' : value.toLocaleString();
  return (
    <div>
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="text-2xl font-display font-semibold text-fg mt-1">
        {display}
      </p>
      {value === null && (
        <p className="text-[10px] text-fg-dim mt-0.5">{muted}</p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted">{label}</span>
      <span className="text-fg">
        {value}
        {muted && <span className="text-fg-dim ml-2">· {muted}</span>}
      </span>
    </div>
  );
}
