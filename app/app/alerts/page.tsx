import { AlertCard } from '@/components/alert/AlertCard';
import type { AlertCardData } from '@/components/alert/AlertCard';

const MOCK_ALERTS: AlertCardData[] = [
  {
    id: 'alert-001',
    category: 'hurricane',
    severity: 'high',
    title: 'Tropical Storm Warning — Gulf Coast Track Within 200mi of Active Operator Regions',
    summary:
      'NHC advisory data indicates a tropical storm warning in effect for Gulf Coast. Historical patterns suggest operators in the projected track region have experienced 2–5 day supply chain disruptions at comparable storm intensities.',
    publishedAt: 'Apr 18, 2026',
    industries: ['restaurant', 'construction', 'retail'],
    read: false,
  },
  {
    id: 'alert-002',
    category: 'tariff',
    severity: 'medium',
    title: 'Federal Register: New Tariff Notice on Steel Imports (HTS 7206–7229)',
    summary:
      'Federal Register trends indicate a new tariff notice on steel mill products. Historical patterns suggest similar tariff announcements have preceded 3–7% PPI increases on affected steel categories within 4–8 weeks.',
    publishedAt: 'Apr 16, 2026',
    industries: ['construction'],
    read: false,
  },
  {
    id: 'alert-003',
    category: 'fomc',
    severity: 'medium',
    title: 'FOMC Statement Released — Federal Funds Rate Held Steady at 4.25–4.50%',
    summary:
      'FOMC statement data indicates rates held at the 4.25–4.50% target range. Historical patterns suggest rate stability at this level has been associated with moderated small-business credit conditions. Forward guidance trends indicate continued data-dependence.',
    publishedAt: 'Apr 11, 2026',
    industries: ['restaurant', 'construction', 'retail'],
    read: true,
  },
  {
    id: 'alert-004',
    category: 'commodity_move',
    severity: 'low',
    title: 'Commodity Signal: Beef Prices Exceeded 2σ Threshold on Rolling 52-Week Basis',
    summary:
      'Statistical analysis of FRED beef price data indicates a move exceeding 2 standard deviations on a rolling 52-week basis. Historical patterns indicate moves of this magnitude have resolved within 6–10 weeks in 4 of the last 6 similar environments.',
    publishedAt: 'Apr 10, 2026',
    industries: ['restaurant'],
    read: true,
  },
];

export default function AlertsPage() {
  const unread = MOCK_ALERTS.filter((a) => !a.read);
  const read = MOCK_ALERTS.filter((a) => a.read);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">Alerts</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Event-driven intelligence on hurricanes, tariffs, FOMC decisions, and
          commodity moves.
        </p>
      </div>

      {unread.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-3">
            New · {unread.length}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {unread.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {read.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-3">
            Earlier
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {read.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 text-xs text-fg-muted border-t border-border pt-4">
        Stormline provides market intelligence, not financial, legal, or tax advice.
        Consult licensed professionals for decisions specific to your business.
      </p>
    </div>
  );
}
