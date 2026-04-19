import { INDICATOR_REGISTRY } from '@/lib/indicators/registry';
import { AdminTable, type Column } from '@/components/admin/AdminTable';
import type { IndicatorDefinition } from '@/lib/indicators/types';

const COLUMNS: Column<IndicatorDefinition>[] = [
  { key: 'code',         label: 'Code',        render: (r) => <span className="font-mono text-xs text-accent">{r.code}</span> },
  { key: 'name',         label: 'Name' },
  { key: 'source',       label: 'Source',      render: (r) => <span className="font-mono text-xs text-fg-muted uppercase">{r.source}</span> },
  { key: 'industryTags', label: 'Industries',  render: (r) => <span className="text-xs text-fg-muted">{r.industryTags.join(', ')}</span> },
  { key: 'costBucket',   label: 'Cost Bucket', render: (r) => <span className="font-mono text-xs text-fg-muted">{r.costBucket ?? '—'}</span> },
  { key: 'unit',         label: 'Unit',        render: (r) => <span className="text-xs text-fg-muted">{r.unit}</span> },
  { key: 'frequency',    label: 'Freq',        render: (r) => <span className="text-xs text-fg-muted">{r.frequency}</span> },
];

export default function IndicatorsPage() {
  const rows = [...INDICATOR_REGISTRY];
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold text-fg">Indicator Registry</h1>
        <p className="text-sm text-fg-muted mt-1">{rows.length} indicators · read from registry file · no DB call</p>
      </div>
      <AdminTable columns={COLUMNS} rows={rows} />
    </div>
  );
}
