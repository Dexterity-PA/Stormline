import { Badge } from '@/components/ui/Badge';
import { toTOCEntries } from '@/lib/briefing/markdown';
import { BriefingContent } from './BriefingContent';
import { BriefingTOC } from './BriefingTOC';
import { ContextRail } from './ContextRail';
import type { BriefingData } from './types';

export function BriefingLayout({ briefing }: { briefing: BriefingData }) {
  const tocEntries = toTOCEntries(briefing.sections.map((s) => s.title));

  return (
    <article className="mx-auto w-full max-w-[1280px] grid gap-8 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[200px_minmax(0,1fr)_280px]">
      <BriefingTOC entries={tocEntries} />

      <div className="min-w-0 max-w-[720px]">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="industry" label={briefing.industry} />
            <span className="text-xs text-fg-muted">
              Week of {briefing.weekOf}
            </span>
          </div>
          <h1 className="text-3xl font-display font-semibold text-fg leading-tight tracking-tight">
            {briefing.headline}
          </h1>
          <p className="mt-3 text-xs text-fg-muted lg:hidden">
            {briefing.publishedAt} · {briefing.generatedBy}
          </p>
        </header>

        <BriefingTOC entries={tocEntries} variant="mobile" />

        <div className="border-t border-border pt-6">
          <BriefingContent
            sections={briefing.sections}
            inlineIndicators={briefing.inlineIndicators}
            indicators={briefing.indicatorRefs}
          />
        </div>

        <footer className="mt-10 pt-4 border-t border-border">
          <p className="text-xs text-fg-muted leading-relaxed">
            Stormline provides market intelligence, not financial, legal, or tax
            advice. Consult licensed professionals for decisions specific to your
            business.
          </p>
        </footer>
      </div>

      <ContextRail
        indicators={briefing.indicatorRefs}
        relatedAlerts={briefing.relatedAlerts}
        publishedAt={briefing.publishedAt}
        generatedBy={briefing.generatedBy}
      />
    </article>
  );
}
