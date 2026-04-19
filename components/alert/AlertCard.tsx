import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export interface AlertCardData {
  id: string;
  category: 'hurricane' | 'tariff' | 'fomc' | 'commodity_move' | 'credit';
  severity: 'low' | 'medium' | 'high';
  title: string;
  summary: string;
  publishedAt: string;
  industries: ('restaurant' | 'construction' | 'retail')[];
  read: boolean;
}

const CATEGORY_LABELS: Record<AlertCardData['category'], string> = {
  hurricane: 'Hurricane',
  tariff: 'Tariff',
  fomc: 'FOMC',
  commodity_move: 'Commodity',
  credit: 'Credit',
};

export function AlertCard({ alert }: { alert: AlertCardData }) {
  return (
    <Link
      href={`/app/alerts/${alert.id}`}
      className={`block bg-bg-elev border rounded-[var(--radius-md)] p-4 hover:border-accent/40 transition-colors ${
        alert.read ? 'border-border' : 'border-accent/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="severity" label={alert.severity} />
          <span className="text-xs text-fg-muted">
            {CATEGORY_LABELS[alert.category]}
          </span>
          {!alert.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
          )}
        </div>
        <span className="text-xs text-fg-muted flex-shrink-0">{alert.publishedAt}</span>
      </div>
      <h3 className="font-display font-medium text-fg text-sm mb-1.5 leading-snug">
        {alert.title}
      </h3>
      <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
        {alert.summary}
      </p>
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {alert.industries.map((ind) => (
          <Badge key={ind} variant="industry" label={ind} />
        ))}
      </div>
    </Link>
  );
}
