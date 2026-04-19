import { INDICATOR_REGISTRY } from '@/lib/indicators/registry';
import { getObservationsForCodes } from '@/lib/queries/observations';
import {
  IndicatorLibraryTable,
  type LibraryRow,
} from '@/components/indicators/IndicatorLibraryTable';

export const revalidate = 300;

export default async function IndicatorsPage() {
  const codes = INDICATOR_REGISTRY.map((d) => d.code);

  // ~3 months of observations is enough for a 90-day hover sparkline.
  const seriesByCode = await getObservationsForCodes(codes, 3).catch(
    () => ({}) as Record<string, { date: string; value: number }[]>,
  );

  const rows: LibraryRow[] = INDICATOR_REGISTRY.map((d) => ({
    code: d.code,
    name: d.name,
    source: d.source,
    frequency: d.frequency,
    industryTags: d.industryTags,
    costBucket: d.costBucket,
    sparkline: seriesByCode[d.code] ?? [],
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">
          Indicator Library
        </h1>
        <p className="text-sm text-fg-muted mt-0.5">
          {INDICATOR_REGISTRY.length} indicators across macro, industry, and
          regional data sources. Hover a row to preview the last 90 days.
        </p>
      </div>

      <IndicatorLibraryTable rows={rows} />

      <p className="mt-6 text-xs text-fg-muted">
        Data sourced from FRED (Federal Reserve), EIA, USDA, BLS, and NHC. All
        indicators reflect publicly available series. Stormline provides market
        intelligence, not financial, legal, or tax advice.
      </p>
    </div>
  );
}
