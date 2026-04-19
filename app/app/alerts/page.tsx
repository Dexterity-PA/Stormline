import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AlertCard } from '@/components/alert/AlertCard';
import type { AlertCardData } from '@/components/alert/AlertCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getOrgByClerkId } from '@/lib/db/queries/organizations';
import { listAlertRules } from '@/lib/db/queries/alerts';
import type { AlertRule } from '@/lib/db/schema/alert-rules';

// ── Editorial alerts (mock until admin publishes real ones) ───────────────────

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

// ── My Rules section ──────────────────────────────────────────────────────────

const CONDITION_LABELS: Record<AlertRule['condition'], string> = {
  above: 'Above',
  below: 'Below',
  pct_change_above: '% change above',
  pct_change_below: '% change below',
  percentile_above: 'Percentile above',
  percentile_below: 'Percentile below',
};

function RuleRow({ rule }: { rule: AlertRule }) {
  const conditionLabel = CONDITION_LABELS[rule.condition];
  const channels = rule.channels as string[];

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg truncate">{rule.name}</p>
        <p className="text-xs text-fg-muted mt-0.5">
          {conditionLabel} {rule.threshold}
          {rule.windowDays ? ` · ${rule.windowDays}d window` : ''}
          {' · '}
          {channels.join(', ')}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            rule.isActive ? 'bg-green-500' : 'bg-fg-muted'
          }`}
        />
        <Link
          href={`/app/alerts/${rule.id}/edit`}
          className="text-xs text-fg-muted hover:text-fg transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

export default async function AlertsPage() {
  const { orgId: clerkOrgId } = await auth();

  let rules: AlertRule[] = [];
  if (clerkOrgId) {
    const org = await getOrgByClerkId(clerkOrgId);
    if (org) {
      rules = await listAlertRules(org.id);
    }
  }

  const unread = MOCK_ALERTS.filter((a) => !a.read);
  const read = MOCK_ALERTS.filter((a) => a.read);

  return (
    <div>
      {/* ── Editorial alerts ── */}
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">Alerts</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Event-driven intelligence on hurricanes, tariffs, FOMC decisions, and commodity moves.
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
        <section className="mb-8">
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

      <p className="mb-10 text-xs text-fg-muted border-t border-border pt-4">
        Stormline provides market intelligence, not financial, legal, or tax advice. Consult
        licensed professionals for decisions specific to your business.
      </p>

      {/* ── My Rules ── */}
      <div className="border-t border-border pt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-display font-semibold text-fg">My Rules</h2>
            <p className="text-xs text-fg-muted mt-0.5">
              Get notified when an indicator crosses a threshold you define.
            </p>
          </div>
          <Link href="/app/alerts/new">
            <Button variant="outline" size="sm">
              + New rule
            </Button>
          </Link>
        </div>

        {rules.length === 0 ? (
          <div className="bg-bg-elev border border-border rounded-[var(--radius-md)] p-6 text-center">
            <p className="text-sm text-fg-muted mb-3">No rules yet.</p>
            <Link href="/app/alerts/new">
              <Button variant="primary" size="sm">
                Create your first rule
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-bg-elev border border-border rounded-[var(--radius-md)] px-4">
            {rules.map((rule) => (
              <RuleRow key={rule.id} rule={rule} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
