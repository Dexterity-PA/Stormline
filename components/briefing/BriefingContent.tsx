import { Fragment } from 'react';
import { slugifyHeading, splitBodyIntoParagraphs, tokenizeParagraph } from '@/lib/briefing/markdown';
import { IndicatorChip } from './IndicatorChip';
import { PullStat } from './PullStat';
import type {
  BriefingSectionData,
  IndicatorRef,
  InlineIndicator,
} from './types';

interface BriefingContentProps {
  sections: readonly BriefingSectionData[];
  inlineIndicators: readonly InlineIndicator[];
  indicators: readonly IndicatorRef[];
}

export function BriefingContent({
  sections,
  inlineIndicators,
  indicators,
}: BriefingContentProps) {
  const indicatorByCode = new Map(indicators.map((i) => [i.code, i]));

  return (
    <div>
      {sections.map((section) => {
        const anchorId = slugifyHeading(section.title);
        const paragraphs = splitBodyIntoParagraphs(section.body);

        return (
          <section
            key={section.title}
            id={anchorId}
            data-briefing-section={anchorId}
            className="scroll-mt-16 mb-10 last:mb-0"
          >
            <h2 className="text-xs font-medium text-fg-muted uppercase tracking-[0.14em] mb-3">
              {section.title}
            </h2>
            <div className="space-y-4">
              {paragraphs.map((paragraph, pIndex) => {
                const segments = tokenizeParagraph(paragraph, inlineIndicators);
                return (
                  <p
                    key={`${anchorId}-p-${pIndex}`}
                    className="text-[15px] text-fg leading-relaxed"
                  >
                    {segments.map((seg, sIndex) =>
                      seg.kind === 'indicator' ? (
                        <IndicatorChip
                          key={`${pIndex}-${sIndex}`}
                          term={seg.value}
                          indicator={indicatorByCode.get(seg.code)}
                        />
                      ) : (
                        <Fragment key={`${pIndex}-${sIndex}`}>{seg.value}</Fragment>
                      ),
                    )}
                  </p>
                );
              })}
              {section.pullStats && section.pullStats.length > 0 && (
                <PullStat stats={section.pullStats} />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
