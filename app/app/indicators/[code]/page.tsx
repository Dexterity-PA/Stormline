import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/Badge';
import { AlertsForIndicator } from '@/components/indicators/AlertsForIndicator';
import { BriefingsMentioning } from '@/components/indicators/BriefingsMentioning';
import { IndicatorChart } from '@/components/indicators/IndicatorChart';
import { IndicatorStatsStrip } from '@/components/indicators/IndicatorStatsStrip';
import { RelatedIndicators } from '@/components/indicators/RelatedIndicators';
import {
  getAlertsForIndicator,
  getBriefingsMentioning,
  getIndicatorWithHistory,
  getRelatedIndicators,
} from '@/lib/queries/indicators-detail';

interface PageProps {
  params: Promise<{ code: string }>;
}

/**
 * Indicators whose "higher" values typically translate into operator pain
 * (input costs, rates, unemployment). Used to invert tone colors in the
 * stats strip so a +3% beef price reads as red, not green.
 */
const HIGHER_IS_WORSE_BUCKETS = new Set([
  'beef',
  'poultry',
  'coffee',
  'grain',
  'eggs',
  'dairy',
  'lumber',
  'steel',
  'copper',
  'cotton',
  'fuel',
  'energy',
  'inflation',
  'materials',
  'interest_rates',
  'financing',
  'credit',
  'labor',
  'menu_pricing',
]);

export default async function IndicatorDetailPage({ params }: PageProps) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);

  const result = await getIndicatorWithHistory(decodedCode, 120);
  if (!result) notFound();

  const { indicator, history } = result;
  const higherIsWorse = indicator.costBucket
    ? HIGHER_IS_WORSE_BUCKETS.has(indicator.costBucket)
    : false;

  const latest = history.at(-1);
  const prior = history.at(-2);
  const periodDelta =
    latest && prior && prior.value !== 0
      ? ((latest.value - prior.value) / prior.value) * 100
      : null;
  const trend =
    periodDelta === null
      ? 'flat'
      : periodDelta > 0.1
        ? higherIsWorse
          ? 'down'
          : 'up'
        : periodDelta < -0.1
          ? higherIsWorse
            ? 'up'
            : 'down'
          : 'flat';

  const [related, briefings, alerts] = await Promise.all([
    getRelatedIndicators(decodedCode),
    getBriefingsMentioning(decodedCode, 3),
    getAlertsForIndicator(decodedCode, 5),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {indicator.industryTags.map((tag) => (
            <Badge key={tag} variant="industry" label={tag} />
          ))}
          <span className="text-xs text-fg-muted uppercase font-mono">
            {indicator.source} · {indicator.sourceId}
          </span>
        </div>
        <h1 className="text-xl font-display font-semibold text-fg leading-snug">
          {indicator.name}
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          {indicator.unit} · {indicator.frequency} ·{' '}
          {indicator.costBucket ?? 'macro'}
        </p>
      </div>

      <div className="mb-6">
        <IndicatorStatsStrip
          history={history}
          unit={indicator.unit}
          higherIsWorse={higherIsWorse}
        />
      </div>

      <div className="bg-bg-elev border border-border rounded-[var(--radius-md)] p-5 mb-8">
        <div className="flex items-center justify-between mb-2 gap-3">
          <p className="text-xs text-fg-muted">
            Historical observations
            {history.length > 0
              ? ` · ${history.length} points through ${history.at(-1)?.date}`
              : ''}
          </p>
        </div>
        <IndicatorChart
          data={history}
          unit={indicator.unit}
          trend={trend}
          defaultRange="1Y"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <BriefingsMentioning
          briefings={briefings}
          indicatorCode={indicator.code}
        />
        <AlertsForIndicator alerts={alerts} />
      </div>

      <div className="mb-8">
        <RelatedIndicators related={related} />
      </div>

      <p className="mt-8 text-xs text-fg-muted border-t border-border pt-4">
        Historical patterns describe market conditions, not instructions.
        Stormline provides market intelligence, not financial, legal, or tax
        advice. Consult licensed professionals for decisions specific to your
        business.
      </p>
    </div>
  );
}
