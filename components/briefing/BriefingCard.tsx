import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export interface BriefingCardData {
  id: string;
  industry: 'restaurant' | 'construction' | 'retail';
  weekOf: string;
  headline: string;
  summary: string;
  publishedAt: string;
}

export function BriefingCard({ briefing }: { briefing: BriefingCardData }) {
  return (
    <Link
      href={`/app/briefings/${briefing.id}`}
      className="block bg-bg-elev border border-border rounded-[var(--radius-md)] p-5 hover:border-accent/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <Badge variant="industry" label={briefing.industry} />
        <span className="text-xs text-fg-muted flex-shrink-0">
          Week of {briefing.weekOf}
        </span>
      </div>
      <h3 className="font-display font-medium text-fg text-base mb-1.5 leading-snug">
        {briefing.headline}
      </h3>
      <p className="text-sm text-fg-muted line-clamp-2 leading-relaxed">
        {briefing.summary}
      </p>
      <p className="text-xs text-fg-muted mt-3">{briefing.publishedAt}</p>
    </Link>
  );
}
