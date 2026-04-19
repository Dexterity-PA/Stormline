import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import type { BriefingMention } from '@/lib/queries/indicators-detail';

interface BriefingsMentioningProps {
  briefings: BriefingMention[];
  indicatorCode: string;
}

function formatWeek(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${weekStart} – ${weekEnd}`;
  }
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const startFmt = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const endFmt = end.toLocaleDateString('en-US', {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${startFmt} – ${endFmt}`;
}

export function BriefingsMentioning({
  briefings,
  indicatorCode,
}: BriefingsMentioningProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wider mb-3">
        Recent briefings mentioning this
      </h2>
      {briefings.length === 0 ? (
        <p className="text-xs text-fg-muted">
          No published briefings have referenced this indicator yet.
        </p>
      ) : (
        <div className="space-y-2">
          {briefings.map((b) => (
            <Link
              key={b.id}
              href={`/app/briefings/${b.id}#${encodeURIComponent(indicatorCode)}`}
              className="block bg-bg-elev border border-border rounded-[var(--radius-sm)] px-4 py-3 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="industry" label={b.industry} />
                <span className="text-[11px] text-fg-muted">
                  {formatWeek(b.weekStart, b.weekEnd)}
                </span>
              </div>
              <p className="text-sm text-fg font-medium leading-snug">
                {b.headline}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
