import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge, type BadgeVariant } from '@/components/admin/Badge';

type AlertMock = {
  id: string;
  title: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  industries: string[];
  status: 'draft' | 'published';
  source_url: string;
  created_at: string;
  body: string;
};

const MOCK_ALERTS: AlertMock[] = [
  {
    id: 'a-fomc-2026-04',
    title: 'FOMC Statement — April 2026',
    type: 'fomc',
    severity: 'medium',
    industries: ['Restaurant', 'Construction', 'Retail'],
    status: 'draft',
    source_url: 'https://federalreserve.gov/newsevents/pressreleases/monetary20260418a.htm',
    created_at: '2026-04-18 14:30',
    body: `The Federal Open Market Committee voted to hold the federal funds rate at 4.25–4.50%, consistent with prior market pricing.

Historical data indicates hold decisions following a period of above-trend inflation have been associated with sustained borrowing cost pressure on variable-rate commercial debt over the subsequent 60–90 days.

Operators with equipment financing, lease renewals, or line-of-credit resets within the next quarter are in an environment historically associated with elevated refinancing costs. Historical pattern shows FOMC hold cycles have preceded 45–75 day lags before credit conditions at community banks adjust to reflect the rate environment.

The statement language retained "data dependent" framing without signaling a near-term path to cuts, consistent with historical communications preceding extended plateau periods.

Source: Federal Reserve Board press release, April 18, 2026.

---
Stormline provides market intelligence, not financial, legal, or tax advice. Consult licensed professionals for decisions specific to your business.`,
  },
  {
    id: 'a-beef-2026-04-13',
    title: 'Beef Commodity Move >2σ — Apr 13',
    type: 'commodity',
    severity: 'high',
    industries: ['Restaurant'],
    status: 'published',
    source_url: 'https://fred.stlouisfed.org/series/PBEEFUSDM',
    created_at: '2026-04-13 09:15',
    body: `Wholesale beef prices moved +4.2% week-over-week, exceeding the 2σ threshold on a rolling 52-week basis — the third consecutive week above the 90th percentile of the 5-year range.

Historical data shows this pattern has preceded menu cost increases of 4–8% at comparable restaurant formats within 4–6 weeks. Operators in similar conditions have historically reviewed protein portion specifications and protein-forward menu mix before adjusting printed menu prices.

Source: FRED series PBEEFUSDM (IMF Primary Commodity Prices, Beef).

---
Stormline provides market intelligence, not financial, legal, or tax advice. Consult licensed professionals for decisions specific to your business.`,
  },
  {
    id: 'a-tariff-2026-03-28',
    title: 'Federal Register: Tariff Notice — Steel HS7208',
    type: 'tariff',
    severity: 'high',
    industries: ['Construction'],
    status: 'published',
    source_url: 'https://federalregister.gov/documents/2026/03/28/tariff-steel-hs7208',
    created_at: '2026-03-28 16:00',
    body: `A Federal Register tariff notice was published March 28 affecting certain flat-rolled steel products (HS7208 series), effective April 15.

Historical data suggests tariff-driven input cost increases on structural steel have been absorbed into subcontractor bid schedules over 8–12 week cycles. Operators in similar conditions have historically added material cost escalation clauses to new contracts initiated within the 90-day window following a tariff announcement.

Source: Federal Register Vol. 91, No. 59, March 28, 2026.

---
Stormline provides market intelligence, not financial, legal, or tax advice. Consult licensed professionals for decisions specific to your business.`,
  },
];

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const alert = MOCK_ALERTS.find((a) => a.id === id);
  if (!alert) notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-fg-muted">
        <Link href="/admin/alerts" className="hover:text-fg transition-colors">← Alerts</Link>
        <span>/</span>
        <span className="text-fg">{alert.title}</span>
      </div>

      <div className="border border-border rounded-md bg-bg-elev p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-lg font-display font-semibold text-fg">{alert.title}</h1>
          <Badge variant={alert.status as BadgeVariant}>{alert.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <span><span className="font-mono text-fg-muted uppercase">Type </span><span className="font-mono text-fg">{alert.type}</span></span>
          <span><span className="font-mono text-fg-muted uppercase">Severity </span><Badge variant={alert.severity as BadgeVariant}>{alert.severity}</Badge></span>
          <span><span className="font-mono text-fg-muted uppercase">Industries </span><span className="text-fg">{alert.industries.join(', ')}</span></span>
          <span><span className="font-mono text-fg-muted uppercase">Created </span><span className="text-fg">{alert.created_at}</span></span>
        </div>
        <div className="text-xs">
          <span className="font-mono text-fg-muted uppercase">Source </span>
          <a href={alert.source_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-mono">{alert.source_url}</a>
        </div>
      </div>

      <div>
        <div className="px-4 py-2 border border-b-0 border-border rounded-t-md bg-bg-elev">
          <span className="text-xs font-mono text-fg-muted uppercase tracking-wider">Alert Body</span>
        </div>
        <pre className="p-5 border border-border rounded-b-md text-sm text-fg font-mono leading-relaxed whitespace-pre-wrap bg-bg">
          {alert.body}
        </pre>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="button" disabled className="px-4 py-2 rounded-md text-sm bg-good/15 text-good border border-good/30 opacity-60 cursor-not-allowed select-none" title="Submit wiring in Stream 8">
          Approve &amp; Publish
        </button>
        <button type="button" disabled className="px-4 py-2 rounded-md text-sm border border-border text-fg-muted opacity-60 cursor-not-allowed select-none" title="Submit wiring in Stream 8">
          Reject
        </button>
        <span className="text-xs text-fg-muted/50">Submit wiring in Stream 8</span>
      </div>
    </div>
  );
}
