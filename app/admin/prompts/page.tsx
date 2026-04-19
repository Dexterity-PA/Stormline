import { Badge } from '@/components/admin/Badge';
import { AdminTable, type Column } from '@/components/admin/AdminTable';

type PromptRow = {
  id: string;
  slug: string;
  version: string;
  industry: string;
  type: string;
  status: 'active' | 'inactive';
  deployed_at: string;
  runs: number;
};

const PROMPTS: PromptRow[] = [
  { id: 'p-1', slug: 'briefing-restaurant-v1.2',   version: '1.2', industry: 'restaurant',    type: 'briefing', status: 'active',   deployed_at: '2026-04-01', runs: 12 },
  { id: 'p-2', slug: 'briefing-construction-v1.1', version: '1.1', industry: 'construction',  type: 'briefing', status: 'active',   deployed_at: '2026-04-01', runs: 8  },
  { id: 'p-3', slug: 'briefing-retail-v1.1',       version: '1.1', industry: 'retail',        type: 'briefing', status: 'active',   deployed_at: '2026-04-01', runs: 8  },
  { id: 'p-4', slug: 'alert-summary-v1.0',         version: '1.0', industry: 'cross-industry',type: 'alert',    status: 'active',   deployed_at: '2026-03-15', runs: 5  },
  { id: 'p-5', slug: 'briefing-restaurant-v1.1',   version: '1.1', industry: 'restaurant',    type: 'briefing', status: 'inactive', deployed_at: '2026-03-10', runs: 4  },
];

const COLUMNS: Column<PromptRow>[] = [
  { key: 'slug',        label: 'Slug',     render: (r) => <span className="font-mono text-xs text-fg">{r.slug}</span> },
  { key: 'version',     label: 'Ver',      render: (r) => <span className="font-mono text-xs text-fg-muted">v{r.version}</span> },
  { key: 'type',        label: 'Type',     render: (r) => <span className="font-mono text-xs text-fg-muted uppercase">{r.type}</span> },
  { key: 'industry',    label: 'Industry', render: (r) => <span className="capitalize">{r.industry}</span> },
  { key: 'status',      label: 'Status',   render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
  { key: 'deployed_at', label: 'Deployed', render: (r) => <span className="text-fg-muted text-xs">{r.deployed_at}</span> },
  { key: 'runs',        label: 'Runs',     render: (r) => <span className="font-mono text-xs text-fg-muted">{r.runs}</span> },
];

export default function PromptsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-fg">Prompt Versions</h1>
        <p className="text-sm text-fg-muted mt-1">
          Versioned LLM prompts. Every briefing stores{' '}
          <code className="font-mono text-xs">generated_by</code> pointing to slug + version.
          Mock data — no DB call.
        </p>
      </div>
      <AdminTable columns={COLUMNS} rows={PROMPTS} />
    </div>
  );
}
