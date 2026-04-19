import { notFound } from 'next/navigation';
import { getIndicator, INDICATOR_REGISTRY } from '@/lib/indicators/registry';
import { Badge } from '@/components/ui/Badge';
import { IndicatorChart } from '@/components/indicators/IndicatorChart';
import type { ChartDataPoint } from '@/components/indicators/IndicatorChart';

// Deterministic mock series for 12 months of data
function mockChartData(
  base: number,
  length = 52,
  amp = 0.08,
  phase = 0,
): ChartDataPoint[] {
  const end = new Date('2026-04-01');
  return Array.from({ length }, (_, i) => {
    const ms =
      end.getTime() -
      (length - 1 - i) * ((365 * 24 * 3600 * 1000) / (length - 1));
    const d = new Date(ms);
    const label = d.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
    const t = i / (length - 1);
    const value = +(
      base *
      (1 + amp * Math.sin(t * Math.PI * 4 + phase))
    ).toFixed(3);
    return { date: label, value };
  });
}

// Seed chart params per indicator to keep renders deterministic
const CHART_SEEDS: Record<string, { amp: number; phase: number }> = {
  'FRED:DFF': { amp: 0.01, phase: 0 },
  'FRED:DGS10': { amp: 0.04, phase: 1 },
  'FRED:GASREGW': { amp: 0.1, phase: 2 },
  'FRED:PBEEFUSDM': { amp: 0.09, phase: 0.5 },
  'FRED:PPOULTUSDM': { amp: 0.06, phase: 1.5 },
  'FRED:WPU081': { amp: 0.12, phase: 3 },
  'FRED:WPU1017': { amp: 0.08, phase: 0.3 },
  'FRED:PCOPPUSDM': { amp: 0.1, phase: 2.5 },
  'FRED:UMCSENT': { amp: 0.15, phase: 1 },
  'FRED:RSAFS': { amp: 0.04, phase: 0.8 },
};

const BASE_VALUES: Record<string, number> = {
  'FRED:DFF': 4.33,
  'FRED:DGS10': 4.28,
  'FRED:BAMLH0A0HYM2': 3.12,
  'FRED:DTWEXBGS': 120.4,
  'FRED:GASREGW': 3.41,
  'FRED:CPIAUCSL': 314.7,
  'FRED:PBEEFUSDM': 4.82,
  'FRED:PPOULTUSDM': 1.94,
  'FRED:PCOFFOTMUSDM': 2.61,
  'FRED:PWHEAMTUSDM': 189.0,
  'FRED:DHHNGSP': 2.47,
  'FRED:CES7072200001': 13420,
  'FRED:CES7000000008': 18.42,
  'FRED:CUSR0000SEFV': 318.4,
  'FRED:WPU081': 384.2,
  'FRED:WPU1017': 312.8,
  'FRED:PCOPPUSDM': 9240,
  'FRED:HOUST': 1321,
  'FRED:PERMIT': 1467,
  'FRED:MORTGAGE30US': 6.82,
  'FRED:CES2000000008': 37.84,
  'FRED:TTLCONS': 2148,
  'FRED:RSAFS': 724.2,
  'FRED:UMCSENT': 64.7,
  'FRED:PSAVERT': 3.9,
  'FRED:DSPIC96': 17842,
  'FRED:PAYEMS': 159200,
  'FRED:UNRATE': 4.2,
  'FRED:TOTALSL': 5107,
  'FRED:PCOTTINDUSDM': 74.8,
};

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function IndicatorDetailPage({ params }: PageProps) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);
  const indicator = getIndicator(decodedCode);

  if (!indicator) notFound();

  const base = BASE_VALUES[decodedCode] ?? 100;
  const seed = CHART_SEEDS[decodedCode] ?? { amp: 0.07, phase: 1 };
  const chartData = mockChartData(base, 52, seed.amp, seed.phase);

  const currentValue = chartData.at(-1)?.value ?? base;
  const priorValue = chartData.at(-2)?.value ?? base;
  const deltaPercent = (((currentValue - priorValue) / priorValue) * 100).toFixed(2);
  const deltaSign = Number(deltaPercent) > 0 ? '+' : '';

  return (
    <div className="max-w-3xl">
      {/* Header */}
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
          {indicator.unit} · {indicator.frequency} · {indicator.costBucket ?? 'macro'}
        </p>
      </div>

      {/* Current value */}
      <div className="bg-bg-elev border border-border rounded-[var(--radius-md)] p-5 mb-6">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-xs text-fg-muted mb-1">Current value</p>
            <p className="text-3xl font-display font-semibold text-fg">
              {currentValue.toLocaleString()}
            </p>
            <p className="text-xs text-fg-muted mt-1">{indicator.unit}</p>
          </div>
          <div>
            <p className="text-xs text-fg-muted mb-1">Period change</p>
            <p
              className={`text-lg font-medium ${
                Number(deltaPercent) > 0 ? 'text-crit' : 'text-good'
              }`}
            >
              {deltaSign}{deltaPercent}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-bg-elev border border-border rounded-[var(--radius-md)] p-5 mb-6">
        <p className="text-xs text-fg-muted mb-4">12-month history (mock data)</p>
        <IndicatorChart data={chartData} unit={indicator.unit} />
      </div>

      {/* Related indicators */}
      <div>
        <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wider mb-3">
          Related indicators
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {INDICATOR_REGISTRY.filter(
            (r) =>
              r.code !== indicator.code &&
              r.industryTags.some((t) => indicator.industryTags.includes(t)),
          )
            .slice(0, 4)
            .map((rel) => (
              <a
                key={rel.code}
                href={`/app/indicators/${encodeURIComponent(rel.code)}`}
                className="bg-bg-elev border border-border rounded-[var(--radius-sm)] px-4 py-3 hover:border-accent/40 transition-colors"
              >
                <p className="text-sm text-fg font-medium leading-snug">
                  {rel.name}
                </p>
                <p className="text-xs text-fg-muted mt-0.5">{rel.unit}</p>
              </a>
            ))}
        </div>
      </div>

      <p className="mt-8 text-xs text-fg-muted border-t border-border pt-4">
        Stormline provides market intelligence, not financial, legal, or tax advice.
        Consult licensed professionals for decisions specific to your business.
      </p>
    </div>
  );
}
