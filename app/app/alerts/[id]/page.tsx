import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';

interface AlertDetail {
  id: string;
  category: 'hurricane' | 'tariff' | 'fomc' | 'commodity_move' | 'credit';
  severity: 'low' | 'medium' | 'high';
  title: string;
  body: string;
  publishedAt: string;
  industries: ('restaurant' | 'construction' | 'retail')[];
  source: string;
}

const MOCK_ALERT_DETAILS: Record<string, AlertDetail> = {
  'alert-001': {
    id: 'alert-001',
    category: 'hurricane',
    severity: 'high',
    title: 'Tropical Storm Warning — Gulf Coast Track Within 200mi of Active Operator Regions',
    publishedAt: 'Apr 18, 2026 · 7:42 AM ET',
    industries: ['restaurant', 'construction', 'retail'],
    source: 'NOAA / National Hurricane Center Advisory #14',
    body: 'NHC advisory data indicates a tropical storm warning currently in effect for portions of the Gulf Coast. The forecast track places the center within 200 miles of operator regions in Texas, Louisiana, and Florida within the next 36–48 hours.\n\nHistorical patterns indicate tropical storm events at comparable intensities along this track have been associated with:\n\n• 2–5 day supply chain disruptions for broadline food distributors serving Gulf Coast MSAs\n• 3–7 day delays on outdoor construction activity in the affected track region\n• Temporary retail foot traffic declines of 15–30% in the 24–48 hours preceding landfall\n\nThis alert is provided as market intelligence based on publicly available NHC data. Operators should consult local emergency management guidance and their own business continuity plans for operational decisions.',
  },
  'alert-002': {
    id: 'alert-002',
    category: 'tariff',
    severity: 'medium',
    title: 'Federal Register: New Tariff Notice on Steel Imports (HTS 7206–7229)',
    publishedAt: 'Apr 16, 2026 · 9:15 AM ET',
    industries: ['construction'],
    source: 'Federal Register Vol. 91, No. 74',
    body: 'Federal Register data indicates a new tariff notice affecting steel mill products under HTS codes 7206–7229. The notice describes a proposed additional duty on specified steel imports.\n\nHistorical patterns from comparable steel tariff announcements indicate:\n\n• PPI for steel mill products has increased 3–7% within 4–8 weeks following similar Federal Register notices\n• Domestic steel suppliers have historically adjusted pricing within 2–4 weeks of formal tariff actions\n• Construction operators with active steel subcontracts have reviewed fixed-price provisions within this window in similar environments\n\nThis intelligence is based on publicly available Federal Register data. Operators should consult legal and procurement advisors for contract and sourcing decisions.',
  },
  'alert-003': {
    id: 'alert-003',
    category: 'fomc',
    severity: 'medium',
    title: 'FOMC Statement Released — Federal Funds Rate Held Steady at 4.25–4.50%',
    publishedAt: 'Apr 11, 2026 · 2:00 PM ET',
    industries: ['restaurant', 'construction', 'retail'],
    source: 'Federal Reserve FOMC Statement, April 2026',
    body: 'FOMC statement data indicates the Federal Open Market Committee held the federal funds rate target range steady at 4.25–4.50%. The statement indicated continued data-dependence with no forward commitment to rate changes.\n\nHistorical patterns from comparable FOMC hold decisions indicate:\n\n• Small-business credit conditions (SLOOS data) have stabilized within 4–6 weeks following rate holds at this level\n• 30-year mortgage rates have historically remained range-bound ±15 basis points in the 4 weeks following a hold decision\n• Commercial real estate lending conditions trends have shown no material change at this rate level\n\nThis intelligence is based on publicly available Federal Reserve data and historical SLOOS patterns.',
  },
  'alert-004': {
    id: 'alert-004',
    category: 'commodity_move',
    severity: 'low',
    title: 'Commodity Signal: Beef Prices Exceeded 2σ Threshold on Rolling 52-Week Basis',
    publishedAt: 'Apr 10, 2026 · 6:00 AM ET',
    industries: ['restaurant'],
    source: 'FRED PBEEFUSDM — Stormline Statistical Analysis',
    body: 'Statistical analysis of FRED global beef price data indicates the current reading has exceeded 2 standard deviations above the rolling 52-week mean. This threshold has historically been used as a volatility signal in commodity markets.\n\nHistorical patterns from comparable beef price signal events indicate:\n\n• 4 of the last 6 similar 2σ events resolved (returned within 1σ) within 6–10 weeks\n• 2 of the last 6 events preceded sustained elevated periods of 12–16 weeks, correlated with concurrent drought conditions\n• Operators in similar cost environments have reviewed spot vs. contract purchasing mix within this window\n\nThis is a statistical signal based on publicly available FRED data. Operators should consult commodity specialists for purchasing decisions.',
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlertDetailPage({ params }: PageProps) {
  const { id } = await params;
  const alert = MOCK_ALERT_DETAILS[id];

  if (!alert) notFound();

  const CATEGORY_LABELS: Record<AlertDetail['category'], string> = {
    hurricane: 'Hurricane',
    tariff: 'Tariff',
    fomc: 'FOMC',
    commodity_move: 'Commodity',
    credit: 'Credit',
  };

  return (
    <article className="max-w-2xl">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Badge variant="severity" label={alert.severity} />
        <span className="text-xs text-fg-muted">{CATEGORY_LABELS[alert.category]}</span>
        {alert.industries.map((ind) => (
          <Badge key={ind} variant="industry" label={ind} />
        ))}
      </div>

      <h1 className="text-xl font-display font-semibold text-fg mb-1 leading-snug">
        {alert.title}
      </h1>
      <p className="text-xs text-fg-muted mb-6">
        {alert.publishedAt} · Source: {alert.source}
      </p>

      <div className="border-t border-border pt-6">
        <p className="text-sm text-fg leading-relaxed whitespace-pre-line">
          {alert.body}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-border">
        <p className="text-xs text-fg-muted leading-relaxed">
          Stormline provides market intelligence, not financial, legal, or tax
          advice. Consult licensed professionals for decisions specific to your
          business.
        </p>
      </div>
    </article>
  );
}
