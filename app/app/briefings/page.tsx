import { BriefingListFilter } from '@/components/briefing/BriefingListFilter';
import type { BriefingCardData } from '@/components/briefing/BriefingCard';

const MOCK_BRIEFINGS: BriefingCardData[] = [
  {
    id: 'brief-001',
    industry: 'restaurant',
    weekOf: 'Apr 14, 2026',
    headline: 'Food Input Costs Elevated; Beef and Coffee Sustain Upward Pressure',
    summary:
      'Historical patterns indicate beef prices are tracking near a 78th-percentile level on a 5-year basis. Operators in similar cost environments have reviewed menu pricing cadence and supplier contract terms. Coffee futures trends suggest continued volatility through Q2.',
    publishedAt: 'Published Apr 14, 2026',
  },
  {
    id: 'brief-002',
    industry: 'construction',
    weekOf: 'Apr 14, 2026',
    headline: 'Lumber Softening Partially Offsets Steel Gains; Housing Demand Signals Mixed',
    summary:
      'PPI lumber data trends indicate a second consecutive weekly decline, while steel mill products have risen 1.8% week-over-week. Housing start figures suggest demand moderation at the national level. Operators in similar backlog conditions have tightened material procurement windows.',
    publishedAt: 'Published Apr 14, 2026',
  },
  {
    id: 'brief-003',
    industry: 'retail',
    weekOf: 'Apr 14, 2026',
    headline: 'Consumer Sentiment Weakens to 28th Percentile; Saving Rate at Multi-Year Low',
    summary:
      'University of Michigan sentiment data trends suggest the weakest consumer confidence reading since Q3 2023. Historical patterns indicate that operators in similar demand environments have leaned on inventory discipline and promotional cadence adjustments. Disposable income trends remain slightly positive.',
    publishedAt: 'Published Apr 14, 2026',
  },
  {
    id: 'brief-004',
    industry: 'restaurant',
    weekOf: 'Apr 7, 2026',
    headline: 'Natural Gas Relief; Beef Prices Remain at Elevated Percentile',
    summary:
      'Henry Hub natural gas spot price trends indicate a 4.3% weekly decline, providing input cost relief for kitchen energy. Historical patterns suggest beef prices have remained above the 75th percentile for 11 consecutive weeks. Operators in similar cost environments have reviewed energy contracts.',
    publishedAt: 'Published Apr 7, 2026',
  },
  {
    id: 'brief-005',
    industry: 'construction',
    weekOf: 'Apr 7, 2026',
    headline: 'Copper Prices at 73rd Percentile; Permit Activity Trends Positive',
    summary:
      'Global copper price data trends indicate a 2.4% week-over-week increase, consistent with global manufacturing demand signals. Building permit data trends show a 1.2% increase, suggesting forward demand improvement. Operators in similar margin environments have reviewed subcontractor utilization.',
    publishedAt: 'Published Apr 7, 2026',
  },
  {
    id: 'brief-006',
    industry: 'retail',
    weekOf: 'Apr 7, 2026',
    headline: 'Advance Retail Sales +0.6%; Cotton Input Costs Ease',
    summary:
      'Advance retail sales data trends indicate a 0.6% monthly increase, the second consecutive positive reading. Global cotton price trends suggest a 1.6% weekly decline. Historical patterns indicate operators in similar margin environments have maintained inventory positions during input cost moderation.',
    publishedAt: 'Published Apr 7, 2026',
  },
];

export default function BriefingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">Briefings</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Weekly macro intelligence, reviewed and published by Stormline.
        </p>
      </div>

      <BriefingListFilter briefings={MOCK_BRIEFINGS} />

      <p className="mt-8 text-xs text-fg-muted border-t border-border pt-4">
        Stormline provides market intelligence, not financial, legal, or tax advice.
        Consult licensed professionals for decisions specific to your business.
      </p>
    </div>
  );
}
