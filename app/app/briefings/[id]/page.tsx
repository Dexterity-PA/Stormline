import { notFound } from 'next/navigation';
import { BriefingLayout } from '@/components/briefing/BriefingLayout';
import type {
  BriefingData,
  IndicatorRef,
  InlineIndicator,
  RelatedAlertRef,
} from '@/components/briefing/types';
import { getBriefingWithContext } from '@/lib/queries/briefings-detail';

// Indicator references (chips + context rail). Series are 30-day normalized
// fixtures — the real generator will join against `indicator_observations`.
const RESTAURANT_INDICATORS: IndicatorRef[] = [
  {
    code: 'FRED:PBEEFUSDM',
    name: 'Global Price of Beef',
    currentValue: '$4.82 / lb',
    percentile: 78,
    deltaWoW: 3.2,
    series: [4.55, 4.58, 4.56, 4.6, 4.62, 4.65, 4.64, 4.67, 4.7, 4.68, 4.71, 4.74, 4.73, 4.76, 4.79, 4.78, 4.77, 4.8, 4.82, 4.81, 4.82, 4.84, 4.83, 4.82],
  },
  {
    code: 'FRED:PCOFFOTMUSDM',
    name: 'Coffee, Other Mild Arabicas',
    currentValue: '$2.14 / lb',
    percentile: 72,
    deltaWoW: 1.4,
    series: [2.02, 2.03, 2.04, 2.04, 2.05, 2.06, 2.07, 2.08, 2.08, 2.09, 2.1, 2.11, 2.12, 2.11, 2.12, 2.13, 2.13, 2.13, 2.14, 2.14, 2.14, 2.14],
  },
  {
    code: 'FRED:DHHNGSP',
    name: 'Henry Hub Natural Gas Spot',
    currentValue: '$2.18 / MMBtu',
    percentile: 34,
    deltaWoW: -4.3,
    series: [2.45, 2.44, 2.42, 2.41, 2.38, 2.36, 2.33, 2.31, 2.3, 2.29, 2.28, 2.27, 2.25, 2.24, 2.23, 2.23, 2.22, 2.21, 2.2, 2.19, 2.19, 2.18, 2.18, 2.18],
  },
  {
    code: 'FRED:DFF',
    name: 'Federal Funds Effective Rate',
    currentValue: '4.33%',
    percentile: 88,
    deltaWoW: 0.0,
    series: [4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33, 4.33],
  },
  {
    code: 'FRED:CUSR0000SEFV',
    name: 'CPI: Food Away From Home',
    currentValue: '361.2',
    percentile: 91,
    deltaWoW: 0.2,
    series: [358, 358.2, 358.5, 358.7, 359, 359.2, 359.4, 359.6, 359.9, 360.1, 360.3, 360.5, 360.7, 360.9, 361.0, 361.1, 361.2, 361.2],
  },
  {
    code: 'FRED:CES7000000008',
    name: 'Leisure & Hospitality Avg Earnings',
    currentValue: '$18.42 / hr',
    percentile: 82,
    deltaWoW: 0.3,
    series: [18.21, 18.23, 18.25, 18.27, 18.28, 18.29, 18.31, 18.32, 18.33, 18.34, 18.36, 18.37, 18.38, 18.39, 18.4, 18.41, 18.42],
  },
  {
    code: 'FRED:PWHEAMTUSDM',
    name: 'Global Price of Wheat',
    currentValue: '$234 / mt',
    percentile: 34,
    deltaWoW: -0.8,
    series: [248, 247, 246, 245, 244, 243, 242, 241, 240, 239, 238, 238, 237, 236, 236, 235, 235, 234, 234],
  },
  {
    code: 'FRED:PPOULTUSDM',
    name: 'Global Price of Poultry',
    currentValue: '$1.48 / lb',
    percentile: 62,
    deltaWoW: 1.1,
    series: [1.4, 1.4, 1.41, 1.41, 1.42, 1.42, 1.43, 1.43, 1.44, 1.44, 1.45, 1.45, 1.46, 1.46, 1.47, 1.47, 1.47, 1.48, 1.48],
  },
];

const RESTAURANT_INLINE: InlineIndicator[] = [
  { term: 'Beef', code: 'FRED:PBEEFUSDM' },
  { term: 'beef', code: 'FRED:PBEEFUSDM' },
  { term: 'Coffee', code: 'FRED:PCOFFOTMUSDM' },
  { term: 'Natural gas', code: 'FRED:DHHNGSP' },
  { term: 'natural gas', code: 'FRED:DHHNGSP' },
  { term: 'Federal Funds Rate', code: 'FRED:DFF' },
  { term: 'Food Away From Home', code: 'FRED:CUSR0000SEFV' },
  { term: 'Leisure and hospitality', code: 'FRED:CES7000000008' },
  { term: 'Wheat', code: 'FRED:PWHEAMTUSDM' },
  { term: 'Poultry', code: 'FRED:PPOULTUSDM' },
  { term: 'poultry', code: 'FRED:PPOULTUSDM' },
];

const RESTAURANT_RELATED_ALERTS: RelatedAlertRef[] = [
  {
    id: 'alert-004',
    category: 'commodity_move',
    severity: 'low',
    title:
      'Commodity Signal: Beef Prices Exceeded 2σ Threshold on Rolling 52-Week Basis',
    publishedAt: 'Apr 10, 2026',
  },
  {
    id: 'alert-003',
    category: 'fomc',
    severity: 'medium',
    title:
      'FOMC Statement Released — Federal Funds Rate Held Steady at 4.25–4.50%',
    publishedAt: 'Apr 11, 2026',
  },
];

const CONSTRUCTION_INDICATORS: IndicatorRef[] = [
  {
    code: 'FRED:WPU081',
    name: 'PPI: Lumber',
    currentValue: '278.4',
    percentile: 51,
    deltaWoW: -2.1,
    series: [290, 289, 288, 287, 286, 285, 284, 284, 283, 283, 282, 282, 281, 281, 280, 280, 279, 279, 278, 278, 278.4],
  },
  {
    code: 'FRED:WPU1017',
    name: 'PPI: Steel Mill Products',
    currentValue: '318.9',
    percentile: 64,
    deltaWoW: 1.8,
    series: [308, 309, 309, 310, 310, 311, 312, 312, 313, 313, 314, 314, 315, 316, 316, 317, 317, 318, 318, 318.9],
  },
  {
    code: 'FRED:MORTGAGE30US',
    name: '30-Year Fixed Mortgage Rate',
    currentValue: '6.82%',
    percentile: 81,
    deltaWoW: -0.02,
    series: [6.88, 6.88, 6.87, 6.87, 6.86, 6.86, 6.85, 6.85, 6.84, 6.84, 6.83, 6.83, 6.82, 6.82, 6.82],
  },
];

const CONSTRUCTION_INLINE: InlineIndicator[] = [
  { term: 'PPI lumber', code: 'FRED:WPU081' },
  { term: 'Steel mill products', code: 'FRED:WPU1017' },
  { term: '30-year mortgage rates', code: 'FRED:MORTGAGE30US' },
];

const RESTAURANT_BRIEFING: BriefingData = {
  id: 'brief-001',
  industry: 'restaurant',
  weekOf: 'Apr 14, 2026',
  headline:
    'Food Input Costs Elevated; Beef and Coffee Sustain Upward Pressure',
  publishedAt: 'Published Apr 14, 2026',
  generatedBy: 'claude-sonnet-4@prompt-v1.0',
  indicatorRefs: RESTAURANT_INDICATORS,
  inlineIndicators: RESTAURANT_INLINE,
  relatedAlerts: RESTAURANT_RELATED_ALERTS,
  sections: [
    {
      title: 'Key Signals This Week',
      body: 'Beef prices are tracking near a 78th-percentile level on a 5-year basis, with a 3.2% week-over-week increase. Historical patterns indicate elevated beef pricing at this percentile has persisted for an average of 11 weeks before mean reversion. Coffee (Arabica) trends suggest continued upward pressure, currently at the 72nd percentile.\n\nNatural gas spot prices declined 4.3% week-over-week — historical data indicates this level of relief has translated to 0.4–0.8% reductions in monthly utility costs for full-service operators.',
      pullStats: [
        { value: '78th', label: 'Beef 5Y percentile' },
        { value: '+3.2%', label: 'Beef WoW' },
        { value: '−4.3%', label: 'Natural gas WoW' },
      ],
    },
    {
      title: 'Macro Context',
      body: 'The Federal Funds Rate held steady at 4.33%. Historical patterns indicate rate stability at this level correlates with moderated small-business credit conditions. The dollar index trend suggests modest import cost pressure for operators sourcing non-domestic proteins.\n\nFood Away From Home CPI trends show a 0.2% monthly increase, tracking at the 91st percentile on a 5-year basis — historical data suggests menu price pass-through has been more limited at this index level.',
    },
    {
      title: 'Labor Environment',
      body: 'Leisure and hospitality average hourly earnings trends indicate a 0.3% week-over-week increase to $18.42/hr. Historical patterns suggest this rate of wage growth has been consistent with stable turnover rates in markets where operators have maintained scheduling consistency.\n\nFood service employment trends show no significant deviation from the prior four-week average.',
      pullStats: [
        { value: '$18.42', label: 'L&H avg hourly earnings' },
        { value: '82nd', label: '5Y percentile' },
      ],
    },
    {
      title: 'Watch List',
      body: 'Wheat price trends remain at the 34th percentile — historical data suggests this level has preceded upward moves in baked goods input costs within 4–6 weeks in 3 of the last 5 similar environments.\n\nPoultry pricing trends are at the 62nd percentile, a 1.1% weekly increase. Historical patterns indicate poultry and beef pricing often move in opposite directions; current co-movement may indicate a supply-side factor rather than demand-driven change.',
    },
  ],
};

const CONSTRUCTION_BRIEFING: BriefingData = {
  id: 'brief-002',
  industry: 'construction',
  weekOf: 'Apr 14, 2026',
  headline:
    'Lumber Softening Partially Offsets Steel Gains; Housing Demand Signals Mixed',
  publishedAt: 'Published Apr 14, 2026',
  generatedBy: 'claude-sonnet-4@prompt-v1.0',
  indicatorRefs: CONSTRUCTION_INDICATORS,
  inlineIndicators: CONSTRUCTION_INLINE,
  relatedAlerts: [
    {
      id: 'alert-002',
      category: 'tariff',
      severity: 'medium',
      title:
        'Federal Register: New Tariff Notice on Steel Imports (HTS 7206–7229)',
      publishedAt: 'Apr 16, 2026',
    },
  ],
  sections: [
    {
      title: 'Key Signals This Week',
      body: 'PPI lumber data trends indicate a second consecutive weekly decline of 2.1%, bringing the index to the 51st percentile on a 5-year basis. Historical patterns suggest lumber softening at this level has translated to 1–3% material cost reductions on framing packages within 3–5 weeks.\n\nSteel mill products PPI increased 1.8% week-over-week to the 64th percentile. Operators in similar cost environments with steel-intensive projects have historically reviewed subcontractor bids on structural and mechanical work.',
    },
    {
      title: 'Demand Environment',
      body: 'Housing starts data trends indicate a 3.8% monthly decline to 1,321k units (SAAR), tracking at the 44th percentile. Historical patterns suggest starts at this level have been consistent with modest near-term backlog pressure for residential operators.\n\nBuilding permit data shows a 1.2% monthly increase to 1,467k units — historical data indicates permits lead starts by 2–4 months, suggesting forward demand stabilization.',
    },
    {
      title: 'Financing Conditions',
      body: '30-year mortgage rates declined marginally to 6.82%. Historical patterns indicate rate moves of this magnitude have had limited impact on demand until a sustained trend of 50+ basis points develops. Rates remain at the 81st percentile on a 5-year basis.\n\nTotal construction spending trends show a 0.8% monthly increase, the third consecutive positive reading — historical data suggests this trend has preceded improved subcontractor utilization rates.',
    },
  ],
};

const RETAIL_BRIEFING: BriefingData = {
  id: 'brief-003',
  industry: 'retail',
  weekOf: 'Apr 14, 2026',
  headline:
    'Consumer Sentiment Weakens to 28th Percentile; Saving Rate at Multi-Year Low',
  publishedAt: 'Published Apr 14, 2026',
  generatedBy: 'claude-sonnet-4@prompt-v1.0',
  indicatorRefs: [],
  inlineIndicators: [],
  relatedAlerts: [],
  sections: [
    {
      title: 'Key Signals This Week',
      body: 'University of Michigan consumer sentiment data trends indicate a 4.2% weekly decline to 64.7, now tracking at the 28th percentile on a 5-year basis. Historical patterns indicate sustained sentiment at sub-30th-percentile levels has correlated with 1.5–3% declines in discretionary retail sales over the following 4–6 weeks.',
    },
  ],
};

const MOCK_FULL_BRIEFINGS: Record<string, BriefingData> = {
  'brief-001': RESTAURANT_BRIEFING,
  'brief-002': CONSTRUCTION_BRIEFING,
  'brief-003': RETAIL_BRIEFING,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BriefingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const briefing = MOCK_FULL_BRIEFINGS[id];

  if (!briefing) notFound();

  const { briefing: resolved } = getBriefingWithContext(briefing);

  return <BriefingLayout briefing={resolved} />;
}
