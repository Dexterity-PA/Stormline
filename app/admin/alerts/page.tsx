import Link from 'next/link';
import { Badge, type BadgeVariant } from '@/components/admin/Badge';
import { AdminTable, type Column } from '@/components/admin/AdminTable';

type AlertRow = {
  id: string;
  title: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  industries: string;
  status: 'draft' | 'published';
  created_at: string;
};

const ALERTS: AlertRow[] = [
  { id: 'a-fomc-2026-04',        title: 'FOMC Statement — April 2026',                     type: 'fomc',      severity: 'medium', industries: 'Restaurant, Construction, Retail', status: 'draft',     created_at: '2026-04-18 14:30' },
  { id: 'a-beef-2026-04-13',     title: 'Beef Commodity Move >2σ — Apr 13',                type: 'commodity', severity: 'high',   industries: 'Restaurant',                      status: 'published', created_at: '2026-04-13 09:15' },
  { id: 'a-tariff-2026-03-28',   title: 'Federal Register: Tariff Notice — Steel HS7208', type: 'tariff',    severity: 'high',   industries: 'Construction',                    status: 'published', created_at: '2026-03-28 16:00' },
];

const COLUMNS: Column<AlertRow>[] = [
  { key: 'title',      label: 'Alert',    render: (r) => <Link href={`/admin/alerts/${r.id}`} className="text-accent hover:underline font-medium">{r.title}</Link> },
  { key: 'type',       label: 'Type',     render: (r) => <span className="font-mono text-xs text-fg-muted uppercase">{r.type}</span> },
  { key: 'severity',   label: 'Severity', render: (r) => <Badge variant={r.severity as BadgeVariant}>{r.severity}</Badge> },
  { key: 'industries', label: 'Industries' },
  { key: 'status',     label: 'Status',   render: (r) => <Badge variant={r.status as BadgeVariant}>{r.status}</Badge> },
  { key: 'created_at', label: 'Created',  render: (r) => <span className="text-fg-muted text-xs">{r.created_at}</span> },
  { key: '_actions',   label: '',         render: (r) => <Link href={`/admin/alerts/${r.id}`} className="text-xs text-accent hover:underline whitespace-nowrap">Review →</Link> },
];

const drafts    = ALERTS.filter((a) => a.status === 'draft');
const published = ALERTS.filter((a) => a.status === 'published');

export default function AlertsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-display font-semibold text-fg">Alert Queue</h1>
        <p className="text-sm text-fg-muted mt-1">All alerts require human review before publish. No auto-publish in MVP.</p>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-mono text-fg-muted uppercase tracking-wider">Awaiting Review</h2>
          <Badge variant="draft">{drafts.length} draft</Badge>
        </div>
        <AdminTable columns={COLUMNS} rows={drafts} emptyMessage="No alerts awaiting review." />
      </div>

      <div>
        <h2 className="text-sm font-mono text-fg-muted uppercase tracking-wider mb-3">Recently Published</h2>
        <AdminTable columns={COLUMNS} rows={published} emptyMessage="No published alerts yet." />
      </div>
    </div>
  );
}
