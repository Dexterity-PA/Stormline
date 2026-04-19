import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { IndicatorChip } from './IndicatorChip';
import { Sparkline } from './Sparkline';
import type { IndicatorRef, RelatedAlertRef } from './types';

const CATEGORY_LABELS: Record<RelatedAlertRef['category'], string> = {
  hurricane: 'Hurricane',
  tariff: 'Tariff',
  fomc: 'FOMC',
  commodity_move: 'Commodity',
  credit: 'Credit',
};

interface ContextRailProps {
  indicators: readonly IndicatorRef[];
  relatedAlerts: readonly RelatedAlertRef[];
  publishedAt: string;
  generatedBy: string;
}

export function ContextRail({
  indicators,
  relatedAlerts,
  publishedAt,
  generatedBy,
}: ContextRailProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 space-y-6">
        {indicators.length > 0 && (
          <section>
            <h3 className="text-[10px] font-medium text-fg-muted uppercase tracking-[0.14em] mb-3">
              Indicators in this briefing
            </h3>
            <ul className="space-y-1.5">
              {indicators.map((indicator) => (
                <li key={indicator.code} className="relative">
                  <div className="flex items-center gap-2 bg-bg-elev border border-border rounded-[var(--radius-sm)] px-2.5 py-2 hover:border-border-strong transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-fg truncate leading-tight">
                        {indicator.name}
                      </p>
                      <p className="font-mono text-[10px] text-fg-muted uppercase tracking-wide">
                        {indicator.code}
                      </p>
                    </div>
                    <Sparkline
                      series={indicator.series}
                      width={56}
                      height={20}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <div className="pointer-events-auto h-full">
                      <IndicatorChip
                        term={indicator.name}
                        indicator={indicator}
                        variant="rail"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedAlerts.length > 0 && (
          <section>
            <h3 className="text-[10px] font-medium text-fg-muted uppercase tracking-[0.14em] mb-3">
              Related alerts
            </h3>
            <ul className="space-y-2">
              {relatedAlerts.slice(0, 2).map((alert) => (
                <li key={alert.id}>
                  <Link
                    href={`/app/alerts/${alert.id}`}
                    className="block bg-bg-elev border border-border rounded-[var(--radius-sm)] px-3 py-2.5 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="severity" label={alert.severity} />
                      <span className="text-[10px] text-fg-muted">
                        {CATEGORY_LABELS[alert.category]}
                      </span>
                      <span className="text-[10px] text-fg-muted ml-auto">
                        {alert.publishedAt}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-fg leading-snug line-clamp-3">
                      {alert.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="text-[11px] text-fg-muted border-t border-border pt-4 space-y-1">
          <p>{publishedAt}</p>
          <p className="font-mono text-[10px] text-fg-dim">{generatedBy}</p>
        </section>
      </div>
    </aside>
  );
}
