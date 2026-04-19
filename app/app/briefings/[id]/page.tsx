import { notFound } from 'next/navigation';
import { BriefingReader } from '@/components/briefing/BriefingReader';
import type { BriefingData } from '@/components/briefing/BriefingReader';

const MOCK_FULL_BRIEFINGS: Record<string, BriefingData> = {
  'brief-001': {
    id: 'brief-001',
    industry: 'restaurant',
    weekOf: 'Apr 14, 2026',
    headline: 'Food Input Costs Elevated; Beef and Coffee Sustain Upward Pressure',
    publishedAt: 'Published Apr 14, 2026',
    generatedBy: 'claude-sonnet-4@prompt-v1.0',
    sections: [
      {
        title: 'Key Signals This Week',
        body: 'Beef prices are tracking near a 78th-percentile level on a 5-year basis, with a 3.2% week-over-week increase. Historical patterns indicate elevated beef pricing at this percentile has persisted for an average of 11 weeks before mean reversion. Coffee (Arabica) trends suggest continued upward pressure, currently at the 72nd percentile.\n\nNatural gas spot prices declined 4.3% week-over-week — historical data indicates this level of relief has translated to 0.4–0.8% reductions in monthly utility costs for full-service operators.',
      },
      {
        title: 'Macro Context',
        body: 'The Federal Funds Rate held steady at 4.33%. Historical patterns indicate rate stability at this level correlates with moderated small-business credit conditions. The dollar index trend suggests modest import cost pressure for operators sourcing non-domestic proteins.\n\nFood Away From Home CPI trends show a 0.2% monthly increase, tracking at the 91st percentile on a 5-year basis — historical data suggests menu price pass-through has been more limited at this index level.',
      },
      {
        title: 'Labor Environment',
        body: 'Leisure and hospitality average hourly earnings trends indicate a 0.3% week-over-week increase to $18.42/hr. Historical patterns suggest this rate of wage growth has been consistent with stable turnover rates in markets where operators have maintained scheduling consistency.\n\nFood service employment trends show no significant deviation from the prior four-week average.',
      },
      {
        title: 'Watch List',
        body: 'Wheat price trends remain at the 34th percentile — historical data suggests this level has preceded upward moves in baked goods input costs within 4–6 weeks in 3 of the last 5 similar environments.\n\nPoultry pricing trends are at the 62nd percentile, a 1.1% weekly increase. Historical patterns indicate poultry and beef pricing often move in opposite directions; current co-movement may indicate a supply-side factor rather than demand-driven change.',
      },
    ],
  },
  'brief-002': {
    id: 'brief-002',
    industry: 'construction',
    weekOf: 'Apr 14, 2026',
    headline: 'Lumber Softening Partially Offsets Steel Gains; Housing Demand Signals Mixed',
    publishedAt: 'Published Apr 14, 2026',
    generatedBy: 'claude-sonnet-4@prompt-v1.0',
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
      {
        title: 'Copper Watch',
        body: 'Global copper prices increased 2.4% week-over-week to the 73rd percentile. Historical patterns indicate copper at this level has correlated with 3–5% cost increases on electrical and plumbing rough-in within 6–8 weeks. Operators with upcoming MEP scope have historically reviewed supplier pricing within this window.',
      },
    ],
  },
  'brief-003': {
    id: 'brief-003',
    industry: 'retail',
    weekOf: 'Apr 14, 2026',
    headline: 'Consumer Sentiment Weakens to 28th Percentile; Saving Rate at Multi-Year Low',
    publishedAt: 'Published Apr 14, 2026',
    generatedBy: 'claude-sonnet-4@prompt-v1.0',
    sections: [
      {
        title: 'Key Signals This Week',
        body: 'University of Michigan consumer sentiment data trends indicate a 4.2% weekly decline to 64.7, now tracking at the 28th percentile on a 5-year basis. Historical patterns indicate sustained sentiment at sub-30th-percentile levels has correlated with 1.5–3% declines in discretionary retail sales over the following 4–6 weeks.\n\nPersonal saving rate trends declined 0.3% to 3.9%, the lowest reading since Q2 2023. Historical data suggests saving rates below 4% have been consistent with consumers drawing on revolving credit for purchases.',
      },
      {
        title: 'Demand Environment',
        body: 'Advance retail sales data trends indicate a 0.6% monthly increase, the second consecutive positive reading. Historical patterns suggest advance sales have overstated trend by 0.3–0.5% during periods of low consumer sentiment — operators in similar demand environments have used this gap to calibrate inventory commitments conservatively.\n\nReal disposable personal income trends show a modest 0.2% increase, suggesting continued purchasing power at the aggregate level despite sentiment weakness.',
      },
      {
        title: 'Labor Environment',
        body: 'Unemployment rate trends show a 0.1% monthly increase to 4.2%, tracking at the 54th percentile. Historical patterns indicate unemployment at this level has not materially affected retail foot traffic in the short term.\n\nNonfarm payroll trends remain positive, suggesting labor market resilience that has historically been associated with consumer spending stability at the headline level.',
      },
      {
        title: 'Input Cost Environment',
        body: 'Global cotton price trends declined 1.6% week-over-week to the 47th percentile. Historical patterns indicate cotton softening at this level has translated to 1–2% input cost reductions on soft goods within 8–12 weeks.\n\nTotal consumer credit outstanding increased 0.4% to the 79th percentile — historical data suggests this level of credit utilization has been associated with consumers maintaining purchase frequency while reducing per-transaction spend.',
      },
    ],
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BriefingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const briefing = MOCK_FULL_BRIEFINGS[id];

  if (!briefing) notFound();

  return (
    <div>
      <BriefingReader briefing={briefing} />
    </div>
  );
}
