import Link from 'next/link';
import { Badge, type BadgeVariant } from './Badge';
import { AdminTable, type Column } from './AdminTable';

export type QueueBriefing = {
  id: string;
  title: string;
  industry: string;
  region: string;
  status: 'draft' | 'published' | 'rejected';
  generated_by: string;
  created_at: string;
};

const COLUMNS: Column<QueueBriefing>[] = [
  {
    key: 'title',
    label: 'Briefing',
    render: (row) => (
      <Link
        href={`/admin/briefings/${row.id}`}
        className="text-accent hover:underline font-medium"
      >
        {row.title}
      </Link>
    ),
  },
  {
    key: 'industry',
    label: 'Industry',
    render: (row) => <span className="capitalize">{row.industry}</span>,
  },
  { key: 'region', label: 'Region' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <Badge variant={row.status as BadgeVariant}>{row.status}</Badge>
    ),
  },
  {
    key: 'generated_by',
    label: 'Model / Prompt',
    render: (row) => (
      <span className="font-mono text-xs text-fg-muted">{row.generated_by}</span>
    ),
  },
  {
    key: 'created_at',
    label: 'Generated',
    render: (row) => (
      <span className="text-fg-muted text-xs">{row.created_at}</span>
    ),
  },
  {
    key: '_actions',
    label: '',
    render: (row) => (
      <Link
        href={`/admin/briefings/${row.id}`}
        className="text-xs text-accent hover:underline whitespace-nowrap"
      >
        Review \u2192
      </Link>
    ),
  },
];

export function ReviewQueue({ items }: { items: QueueBriefing[] }) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={items}
      emptyMessage="No drafts in queue."
    />
  );
}
