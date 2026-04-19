import { Badge, type BadgeVariant } from '@/components/admin/Badge';
import { AdminTable, type Column } from '@/components/admin/AdminTable';

type OrgRow = {
  id: string;
  name: string;
  industry: string;
  tier: string;
  region: string;
  members: number;
  status: 'active' | 'trial' | 'inactive';
  since: string;
};

const ORGS: OrgRow[] = [
  { id: 'org-1', name: "Maria's Kitchen Group",  industry: 'restaurant',   tier: 'core',  region: 'TX', members: 2, status: 'active',   since: '2026-03-10' },
  { id: 'org-2', name: 'Cascade Build Co.',       industry: 'construction', tier: 'pro',   region: 'WA', members: 3, status: 'active',   since: '2026-03-15' },
  { id: 'org-3', name: 'Harbor Home Supply',      industry: 'retail',       tier: 'core',  region: 'FL', members: 1, status: 'trial',    since: '2026-04-12' },
  { id: 'org-4', name: 'Ridgeline Remodeling',    industry: 'construction', tier: 'core',  region: 'CO', members: 2, status: 'active',   since: '2026-03-28' },
  { id: 'org-5', name: 'Eastside Provisions',     industry: 'restaurant',   tier: 'trial', region: 'NY', members: 1, status: 'trial',    since: '2026-04-16' },
];

const COLUMNS: Column<OrgRow>[] = [
  { key: 'name',    label: 'Organization' },
  { key: 'industry', label: 'Industry', render: (r) => <span className="capitalize">{r.industry}</span> },
  { key: 'tier',    label: 'Tier',     render: (r) => <span className="font-mono text-xs text-fg-muted capitalize">{r.tier}</span> },
  { key: 'region',  label: 'Region' },
  { key: 'members', label: 'Members', render: (r) => <span className="text-fg-muted text-xs">{r.members}</span> },
  { key: 'status',  label: 'Status',  render: (r) => <Badge variant={r.status as BadgeVariant}>{r.status}</Badge> },
  { key: 'since',   label: 'Since',   render: (r) => <span className="text-fg-muted text-xs">{r.since}</span> },
];

export default function OrgsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-fg">Organizations</h1>
        <p className="text-sm text-fg-muted mt-1">{ORGS.length} orgs · mock data · no DB call</p>
      </div>
      <AdminTable columns={COLUMNS} rows={ORGS} />
    </div>
  );
}
