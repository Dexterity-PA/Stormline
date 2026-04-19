import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge, type BadgeVariant } from '@/components/admin/Badge';
import { BriefingEditor } from '@/components/admin/BriefingEditor';

type BriefingMock = {
  id: string;
  title: string;
  industry: string;
  region: string;
  status: 'draft' | 'published' | 'rejected';
  generated_by: string;
  created_at: string;
  content: string;
};

const RESTAURANT_CONTENT = '# Restaurant Industry Brief — Week of April 14, 2026\n\n## Headline\nWholesale beef prices reached the 91st percentile of their 5-year range for the third consecutive week — a pattern historically associated with margin compression in full-service dining formats.\n\n## Input Costs\n\n**Wholesale Beef (Choice Grade):** $3.42/lb, +4.2% week-over-week\nHistorical data shows this price level has preceded margin contractions of 80–120 bps at comparable restaurant formats.\n\n**Natural Gas (Henry Hub):** $2.18/MMBtu, −1.1% week-over-week\nSeasonal softening is consistent with historical spring patterns; operators in similar conditions have historically deferred equipment efficiency upgrades to Q3.\n\n**Avg Hourly Earnings — Leisure & Hospitality:** $18.74/hr, +0.3% week-over-week\nLabor cost trend remains 22% above the 2019 baseline; historical data suggests sustained above-trend labor cost growth correlates with increased use of part-time scheduling models.\n\n**CPI: Food Away From Home:** +4.1% year-over-year\nHistorical pattern shows menu price increases tend to lag input cost increases by 6–10 weeks.\n\n## Demand Signal\n\nUniversity of Michigan Consumer Sentiment: 68.4 (April preliminary), down from 79.4 in January.\n\nHistorical data indicates full-service dining spend tends to compress 6–10 weeks after sentiment readings below 70. Operators in similar demand environments have historically focused on value-signaling menu positioning.\n\nAdvance Retail Sales (Restaurants & Bars): +1.2% month-over-month — slight positive against a softening sentiment backdrop.\n\n## Watch List\n\n1. FOMC Meeting — May 7: Markets pricing 80% hold probability. Historical data shows hawkish language shifts have preceded credit tightening within 45–60 days.\n\n2. Avian Influenza — 3 Midwest States: USDA tracking active cases. Historical pattern: commercial flock detections have preceded poultry price spikes of 15–30% within 3–6 weeks.\n\n3. Cardboard/Packaging PPI: +2.1% this week. Historical data suggests this index leads supply packaging cost increases by 3–4 weeks.\n\n## Operator Context\n\nOperators in similar high-input-cost environments have historically:\n- Reviewed protein portion specifications before adjusting menu pricing\n- Audited scheduling efficiency when labor costs rose above 3% annualized\n- Locked variable-rate financing exposure ahead of anticipated FOMC cycles\n- Tested higher-margin beverage and appetizer attachment rates to offset protein margin compression\n\n---\nStormline provides market intelligence, not financial, legal, or tax advice. Consult licensed professionals for decisions specific to your business.';

const CONSTRUCTION_CONTENT = '# Construction Industry Brief — Week of April 14, 2026\n\n## Headline\nLumber PPI crossed its 12-month moving average for the first time since Q3 2025 — a pattern historically associated with input cost re-acceleration in residential remodeling cycles.\n\n## Input Costs\n\n**Lumber PPI (WPU081):** index 282.4, +1.8% week-over-week\nHistorical data suggests lumber price inflections at this point in the housing cycle have preceded 4–6 week lag effects on framing subcontract bids.\n\n**Steel Mill Products PPI (WPU1017):** index 318.1, +0.6% week-over-week\nTrend remains elevated above 2020–2022 baseline; operators in similar conditions have historically re-bid material-intensive scopes at 60-day contract intervals.\n\n**Diesel (On-Highway Average):** $3.74/gal, −0.4% week-over-week\nHistorical data shows fuel cost changes tend to flow through to equipment rental rates within 4–6 weeks.\n\n**30-Year Mortgage Rate:** 6.84%, flat week-over-week\nHistorical data indicates mortgage rate stabilization above 6.5% has been associated with continued suppression of new residential remodel demand initiation.\n\n## Demand Signal\n\nHousing Starts (HOUST): 1.324M units SAAR, −2.1% month-over-month.\nHistorical pattern: starts contractions of >2% have preceded a 6–8 week softening in residential remodel lead generation for small GCs.\n\nNew Building Permits (PERMIT): 1.481M units SAAR, +0.3% month-over-month — modest positive signal for pipeline activity 3–6 months out.\n\n## Watch List\n\n1. Tariff Notice — Steel HS7208 (effective April 15): Federal Register tariff. Historical data suggests tariff-driven input cost increases have been absorbed over 8–12 week bid cycles.\n\n2. FOMC Meeting — May 7: Mortgage rate sensitivity. Historical data shows hawkish hold language has reinforced buyer hesitation in rate-sensitive markets.\n\n3. Total Construction Spending: +0.3% month-over-month — below consensus. Historical pattern: consecutive below-consensus readings have preceded project deferrals in the 30–90 day booking window.\n\n## Operator Context\n\nOperators in similar input-cost environments have historically:\n- Re-evaluated fixed-price contract exposure on lumber-intensive scopes\n- Maintained 90-day material cost escalation clauses in new project agreements\n- Prioritized commercial and institutional pipeline over residential when mortgage rates sustained above 6.5%\n\n---\nStormline provides market intelligence, not financial, legal, or tax advice. Consult licensed professionals for decisions specific to your business.';

const RETAIL_CONTENT = '# Retail Industry Brief — Week of April 14, 2026\n\n## Headline\nUniversity of Michigan Consumer Sentiment printed 68.4 in April (preliminary) — the lowest reading since Q4 2023 — a level historically associated with trading-down behavior in discretionary retail spend within 6–8 weeks.\n\n## Input Costs\n\n**Global Cotton Price:** 72.4¢/lb, +1.2% week-over-week\nHistorical data indicates cotton price increases at this level have preceded apparel landed cost increases of 3–5% within one import cycle (approximately 90–120 days).\n\n**Freight Rates (proxy via PPI Transport):** flat week-over-week\nStabilization after Q1 normalization; historical pattern shows freight cost inflections tend to lead retail landed cost changes by 6–8 weeks.\n\n## Demand Signal\n\nPersonal Saving Rate: 3.6%, down from 5.1% six months prior.\nHistorical data indicates saving rate compression below 4% has preceded credit-financed discretionary spend increases — and subsequent credit delinquency rises — within 2–3 quarters.\n\nTotal Consumer Credit: $5.12T, +0.4% month-over-month.\nHistorical pattern: credit balance growth alongside sentiment contraction has been associated with bifurcated consumer behavior.\n\nReal Disposable Personal Income: +0.2% month-over-month — positive but below the 12-month trend of +0.4%.\n\n## Watch List\n\n1. Consumer Sentiment Below 70: Historical data shows retail foot traffic tends to shift toward value formats within 6–8 weeks of sentiment below 70.\n\n2. Credit Delinquency Lag: SLOOS next release April 28. Historical pattern: tightening lending standards have preceded consumer credit deceleration within one quarter.\n\n3. Cotton Cycle: Spring import orders are now locked. Historical data suggests current cotton levels will be visible in fall merchandise landed costs.\n\n## Operator Context\n\nOperators in similar demand environments have historically:\n- Reviewed open-to-buy plans against sentiment-adjusted demand scenarios before placing fall purchase orders\n- Increased promotional intensity in value price points while protecting margin in premium SKUs\n- Monitored credit delinquency trends as a leading indicator for traffic pattern shifts\n\n---\nStormline provides market intelligence, not financial, legal, or tax advice. Consult licensed professionals for decisions specific to your business.';

const MOCK_BRIEFINGS: BriefingMock[] = [
  {
    id: 'b-2026-04-14-restaurant',
    title: 'Restaurant Brief — Week of Apr 14, 2026',
    industry: 'restaurant',
    region: 'National',
    status: 'draft',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-13 22:04',
    content: RESTAURANT_CONTENT,
  },
  {
    id: 'b-2026-04-14-construction',
    title: 'Construction Brief — Week of Apr 14, 2026',
    industry: 'construction',
    region: 'National',
    status: 'draft',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-13 22:11',
    content: CONSTRUCTION_CONTENT,
  },
  {
    id: 'b-2026-04-14-retail',
    title: 'Retail Brief — Week of Apr 14, 2026',
    industry: 'retail',
    region: 'National',
    status: 'draft',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-13 22:18',
    content: RETAIL_CONTENT,
  },
  {
    id: 'b-2026-04-07-restaurant',
    title: 'Restaurant Brief — Week of Apr 7, 2026',
    industry: 'restaurant',
    region: 'National',
    status: 'published',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-06 22:01',
    content: RESTAURANT_CONTENT,
  },
];

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const briefing = MOCK_BRIEFINGS.find((b) => b.id === id);
  if (!briefing) notFound();

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 border-b border-border px-6 py-4 bg-bg-elev flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/briefings" className="text-xs text-fg-muted hover:text-fg transition-colors shrink-0">
            ← Briefings
          </Link>
          <span className="text-fg-muted text-xs">/</span>
          <span className="text-sm font-medium text-fg truncate">{briefing.title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Badge variant={briefing.status as BadgeVariant}>{briefing.status}</Badge>
          <span className="text-xs font-mono text-fg-muted">{briefing.generated_by}</span>
          <span className="text-xs text-fg-muted">{briefing.created_at}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <BriefingEditor id={briefing.id} initialContent={briefing.content} />
      </div>
    </div>
  );
}
