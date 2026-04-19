import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import type { AlertForIndicator } from '@/lib/queries/indicators-detail';

interface AlertsForIndicatorProps {
  alerts: AlertForIndicator[];
}

function formatWhen(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AlertsForIndicator({ alerts }: AlertsForIndicatorProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wider mb-3">
        Active alerts
      </h2>
      {alerts.length === 0 ? (
        <p className="text-xs text-fg-muted">
          No alerts currently tagged to this indicator&apos;s industries.
        </p>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <Link
              key={a.id}
              href={`/app/alerts/${a.id}`}
              className="block bg-bg-elev border border-border rounded-[var(--radius-sm)] px-4 py-3 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="severity" label={a.severity} />
                <span className="text-[11px] text-fg-muted uppercase font-mono">
                  {a.category.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-fg-muted">
                  · {formatWhen(a.publishedAt)}
                </span>
              </div>
              <p className="text-sm text-fg font-medium leading-snug">
                {a.headline}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
