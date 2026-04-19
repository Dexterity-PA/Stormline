import Link from 'next/link';
import { TileGrid } from '@/components/dashboard/TileGrid';
import type { TileData } from '@/components/dashboard/Tile';

type Industry = 'restaurant' | 'construction' | 'retail';

// Deterministic sine-wave mock series — stable across renders, no Math.random()
function mockSeries(base: number, length = 24, amp = 0.06, phase = 0): number[] {
  return Array.from({ length }, (_, i) =>
    +(base * (1 + amp * Math.sin((i / length) * Math.PI * 4 + phase))).toFixed(3),
  );
}

const MOCK_TILES: Record<Industry, TileData[]> = {
  restaurant: [
    {
      code: 'FRED:PBEEFUSDM',
      label: 'Global Price of Beef',
      value: '4.82',
      unit: 'USD/lb',
      deltaPercent: 3.2,
      deltaType: 'cost',
      percentile: 78,
      source: 'FRED',
      lastUpdated: 'Apr 1',
      series: mockSeries(4.82, 24, 0.08, 0),
    },
    {
      code: 'FRED:PPOULTUSDM',
      label: 'Global Price of Poultry',
      value: '1.94',
      unit: 'USD/lb',
      deltaPercent: 1.1,
      deltaType: 'cost',
      percentile: 62,
      source: 'FRED',
      lastUpdated: 'Apr 1',
      series: mockSeries(1.94, 24, 0.05, 1),
    },
    {
      code: 'FRED:DHHNGSP',
      label: 'Henry Hub Natural Gas',
      value: '2.47',
      unit: 'USD/MMBtu',
      deltaPercent: -4.3,
      deltaType: 'cost',
      percentile: 41,
      source: 'FRED',
      lastUpdated: 'Apr 18',
      series: mockSeries(2.47, 24, 0.12, 2),
    },
    {
      code: 'FRED:CUSR0000SEFV',
      label: 'CPI: Food Away From Home',
      value: '318.4',
      unit: 'index',
      deltaPercent: 0.2,
      deltaType: 'cost',
      percentile: 91,
      source: 'FRED',
      lastUpdated: 'Mar 12',
      series: mockSeries(318.4, 24, 0.02, 0.5),
    },
    {
      code: 'FRED:DFF',
      label: 'Federal Funds Effective Rate',
      value: '4.33',
      unit: '%',
      deltaPercent: 0,
      deltaType: 'cost',
      percentile: 88,
      source: 'FRED',
      lastUpdated: 'Apr 18',
      series: mockSeries(4.33, 24, 0.01, 1.5),
    },
    {
      code: 'FRED:CES7000000008',
      label: 'Avg Hourly Earnings: Leisure & Hospitality',
      value: '18.42',
      unit: 'USD/hr',
      deltaPercent: 0.3,
      deltaType: 'cost',
      percentile: 84,
      source: 'FRED',
      lastUpdated: 'Mar 7',
      series: mockSeries(18.42, 24, 0.03, 2),
    },
    {
      code: 'FRED:PCOFFOTMUSDM',
      label: 'Global Price of Coffee (Arabica)',
      value: '2.61',
      unit: 'USD/lb',
      deltaPercent: -2.8,
      deltaType: 'cost',
      percentile: 72,
      source: 'FRED',
      lastUpdated: 'Apr 1',
      series: mockSeries(2.61, 24, 0.1, 3),
    },
    {
      code: 'FRED:PWHEAMTUSDM',
      label: 'Global Price of Wheat',
      value: '189.0',
      unit: 'USD/mt',
      deltaPercent: -1.4,
      deltaType: 'cost',
      percentile: 34,
      source: 'FRED',
      lastUpdated: 'Apr 1',
      series: mockSeries(189, 24, 0.09, 1.2),
    },
  ],
  construction: [
    {
      code: 'FRED:WPU081',
      label: 'PPI: Lumber and Wood Products',
      value: '384.2',
      unit: 'index',
      deltaPercent: -2.1,
      deltaType: 'cost',
      percentile: 51,
      source: 'FRED',
      lastUpdated: 'Mar 14',
      series: mockSeries(384.2, 24, 0.09, 0),
    },
    {
      code: 'FRED:WPU1017',
      label: 'PPI: Steel Mill Products',
      value: '312.8',
      unit: 'index',
      deltaPercent: 1.8,
      deltaType: 'cost',
      percentile: 64,
      source: 'FRED',
      lastUpdated: 'Mar 14',
      series: mockSeries(312.8, 24, 0.07, 1),
    },
    {
      code: 'FRED:PCOPPUSDM',
      label: 'Global Price of Copper',
      value: '9240',
      unit: 'USD/mt',
      deltaPercent: 2.4,
      deltaType: 'cost',
      percentile: 73,
      source: 'FRED',
      lastUpdated: 'Apr 1',
      series: mockSeries(9240, 24, 0.08, 2),
    },
    {
      code: 'FRED:HOUST',
      label: 'Housing Starts: Total',
      value: '1,321',
      unit: 'k units SAAR',
      deltaPercent: -3.8,
      deltaType: 'demand',
      percentile: 44,
      source: 'FRED',
      lastUpdated: 'Mar 18',
      series: mockSeries(1321, 24, 0.1, 0.5),
    },
    {
      code: 'FRED:MORTGAGE30US',
      label: '30-Year Fixed Mortgage Rate',
      value: '6.82',
      unit: '%',
      deltaPercent: -0.1,
      deltaType: 'cost',
      percentile: 81,
      source: 'FRED',
      lastUpdated: 'Apr 10',
      series: mockSeries(6.82, 24, 0.04, 1.5),
    },
    {
      code: 'FRED:CES2000000008',
      label: 'Avg Hourly Earnings: Construction',
      value: '37.84',
      unit: 'USD/hr',
      deltaPercent: 0.4,
      deltaType: 'cost',
      percentile: 76,
      source: 'FRED',
      lastUpdated: 'Mar 7',
      series: mockSeries(37.84, 24, 0.025, 2),
    },
    {
      code: 'FRED:TTLCONS',
      label: 'Total Construction Spending',
      value: '2,148',
      unit: 'USD B SAAR',
      deltaPercent: 0.8,
      deltaType: 'demand',
      percentile: 67,
      source: 'FRED',
      lastUpdated: 'Mar 3',
      series: mockSeries(2148, 24, 0.04, 3),
    },
    {
      code: 'FRED:PERMIT',
      label: 'New Housing Permits',
      value: '1,467',
      unit: 'k units SAAR',
      deltaPercent: 1.2,
      deltaType: 'demand',
      percentile: 58,
      source: 'FRED',
      lastUpdated: 'Mar 18',
      series: mockSeries(1467, 24, 0.08, 1.2),
    },
  ],
  retail: [
    {
      code: 'FRED:RSAFS',
      label: 'Advance Retail Sales',
      value: '724.2',
      unit: 'USD B',
      deltaPercent: 0.6,
      deltaType: 'demand',
      percentile: 72,
      source: 'FRED',
      lastUpdated: 'Apr 16',
      series: mockSeries(724.2, 24, 0.04, 0),
    },
    {
      code: 'FRED:UMCSENT',
      label: 'Consumer Sentiment (U. Mich)',
      value: '64.7',
      unit: 'index',
      deltaPercent: -4.2,
      deltaType: 'demand',
      percentile: 28,
      source: 'FRED',
      lastUpdated: 'Apr 11',
      series: mockSeries(64.7, 24, 0.12, 1),
    },
    {
      code: 'FRED:PSAVERT',
      label: 'Personal Saving Rate',
      value: '3.9',
      unit: '%',
      deltaPercent: -0.3,
      deltaType: 'demand',
      percentile: 22,
      source: 'FRED',
      lastUpdated: 'Mar 28',
      series: mockSeries(3.9, 24, 0.15, 2),
    },
    {
      code: 'FRED:DSPIC96',
      label: 'Real Disposable Personal Income',
      value: '17,842',
      unit: 'USD B chained',
      deltaPercent: 0.2,
      deltaType: 'demand',
      percentile: 61,
      source: 'FRED',
      lastUpdated: 'Mar 28',
      series: mockSeries(17842, 24, 0.03, 0.5),
    },
    {
      code: 'FRED:UNRATE',
      label: 'Unemployment Rate',
      value: '4.2',
      unit: '%',
      deltaPercent: 0.1,
      deltaType: 'demand',
      percentile: 54,
      source: 'FRED',
      lastUpdated: 'Apr 4',
      series: mockSeries(4.2, 24, 0.06, 1.5),
    },
    {
      code: 'FRED:TOTALSL',
      label: 'Total Consumer Credit',
      value: '5,107',
      unit: 'USD B',
      deltaPercent: 0.4,
      deltaType: 'cost',
      percentile: 79,
      source: 'FRED',
      lastUpdated: 'Mar 7',
      series: mockSeries(5107, 24, 0.03, 2),
    },
    {
      code: 'FRED:PCOTTINDUSDM',
      label: 'Global Price of Cotton',
      value: '74.8',
      unit: '¢/lb',
      deltaPercent: -1.6,
      deltaType: 'cost',
      percentile: 47,
      source: 'FRED',
      lastUpdated: 'Apr 1',
      series: mockSeries(74.8, 24, 0.07, 3),
    },
    {
      code: 'FRED:CPIAUCSL',
      label: 'CPI All Urban Consumers',
      value: '314.7',
      unit: 'index',
      deltaPercent: 0.1,
      deltaType: 'cost',
      percentile: 88,
      source: 'FRED',
      lastUpdated: 'Mar 12',
      series: mockSeries(314.7, 24, 0.015, 1.2),
    },
  ],
};

const INDUSTRY_LABELS: Record<Industry, string> = {
  restaurant: 'Restaurants',
  construction: 'Construction',
  retail: 'Retail',
};

const INDUSTRIES: Industry[] = ['restaurant', 'construction', 'retail'];

interface PageProps {
  searchParams: Promise<{ industry?: string; region?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const industry: Industry =
    (params.industry as Industry | undefined) ?? 'restaurant';
  const region = params.region ?? 'national';
  const tiles = MOCK_TILES[industry] ?? MOCK_TILES.restaurant;
  const regionLabel = region === 'national' ? 'National' : region;

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-display font-semibold text-fg">
            Dashboard
          </h1>
          <p className="text-sm text-fg-muted mt-0.5">
            {INDUSTRY_LABELS[industry]} · {regionLabel}
          </p>
        </div>

        {/* Industry selector — link-based, no JS */}
        <div className="flex items-center gap-2">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind}
              href={`/app?industry=${ind}${region !== 'national' ? `&region=${region}` : ''}`}
              className={`px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors ${
                ind === industry
                  ? 'bg-accent/10 text-accent font-medium border border-accent/20'
                  : 'text-fg-muted hover:text-fg hover:bg-bg-elev border border-transparent'
              }`}
            >
              {INDUSTRY_LABELS[ind]}
            </Link>
          ))}
        </div>
      </div>

      <TileGrid tiles={tiles} />

      {/* Legal footer */}
      <p className="mt-8 text-xs text-fg-muted border-t border-border pt-4">
        Stormline provides market intelligence, not financial, legal, or tax advice.
        Consult licensed professionals for decisions specific to your business.
      </p>
    </div>
  );
}
