import { Badge } from '@/components/ui/Badge';
import { BriefingSection } from './BriefingSection';
import type { BriefingSectionData } from './BriefingSection';

export interface BriefingData {
  id: string;
  industry: 'restaurant' | 'construction' | 'retail';
  weekOf: string;
  headline: string;
  sections: BriefingSectionData[];
  generatedBy: string;
  publishedAt: string;
}

export function BriefingReader({ briefing }: { briefing: BriefingData }) {
  return (
    <article className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="industry" label={briefing.industry} />
        <span className="text-xs text-fg-muted">Week of {briefing.weekOf}</span>
      </div>

      <h1 className="text-2xl font-display font-semibold text-fg mb-1 leading-tight">
        {briefing.headline}
      </h1>
      <p className="text-xs text-fg-muted mb-8">
        {briefing.publishedAt} · {briefing.generatedBy}
      </p>

      <div className="border-t border-border pt-6">
        {briefing.sections.map((section) => (
          <BriefingSection key={section.title} section={section} />
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-border">
        <p className="text-xs text-fg-muted leading-relaxed">
          Stormline provides market intelligence, not financial, legal, or tax
          advice. Consult licensed professionals for decisions specific to your
          business.
        </p>
      </div>
    </article>
  );
}
