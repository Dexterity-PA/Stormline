'use client';

import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import type { Frequency, Industry } from '@/lib/indicators/types';

export interface LibraryRow {
  code: string;
  name: string;
  source: string;
  frequency: Frequency;
  industryTags: readonly Industry[];
  costBucket: string | null;
  /** Last ~90 days of observations, oldest→newest. Empty when unsynced. */
  sparkline: { date: string; value: number }[];
}

export type GroupBy = 'industry' | 'source' | 'frequency' | 'transmission';

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'industry', label: 'Industry' },
  { value: 'source', label: 'Source' },
  { value: 'frequency', label: 'Frequency' },
  { value: 'transmission', label: 'Transmission' },
];

const TRANSMISSION_LABELS = {
  cost_input: 'Cost input',
  demand_signal: 'Demand signal',
  financial_condition: 'Financial condition',
  labor: 'Labor',
  other: 'Other',
} as const;

type Transmission = keyof typeof TRANSMISSION_LABELS;

/**
 * Map the free-form costBucket field to one of four transmission mechanisms
 * so operators can reason about how each indicator flows into their P&L.
 */
function transmissionFor(bucket: string | null): Transmission {
  if (!bucket) return 'other';
  const b = bucket.toLowerCase();
  if (b === 'labor') return 'labor';
  if (['demand'].includes(b)) return 'demand_signal';
  if (
    [
      'interest_rates',
      'credit',
      'currency',
      'financing',
      'consumer_credit',
    ].includes(b)
  ) {
    return 'financial_condition';
  }
  return 'cost_input';
}

interface IndicatorLibraryTableProps {
  rows: LibraryRow[];
}

export function IndicatorLibraryTable({ rows }: IndicatorLibraryTableProps) {
  const [rawQuery, setRawQuery] = useState('');
  const deferredQuery = useDeferredValue(rawQuery);
  const [groupBy, setGroupBy] = useState<GroupBy>('industry');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hoverCode, setHoverCode] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q),
    );
  }, [rows, deferredQuery]);

  const grouped = useMemo(() => groupRows(filtered, groupBy), [filtered, groupBy]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex-1">
          <input
            type="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search by name, code, or source…"
            className="w-full bg-bg-elev border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-fg placeholder:text-fg-dim focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/30"
            aria-label="Search indicators"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-fg-muted mr-1">Group by</span>
          {GROUP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGroupBy(opt.value)}
              className={`px-2.5 py-1 text-xs rounded-[var(--radius-sm)] transition-colors ${
                groupBy === opt.value
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-fg-muted hover:text-fg hover:bg-bg-elev border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-fg-muted mb-3">
        {filtered.length} of {rows.length} indicators
        {deferredQuery.trim() ? ` matching "${deferredQuery.trim()}"` : ''}
      </p>

      <div className="border border-border rounded-[var(--radius-md)] overflow-hidden">
        {grouped.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-fg-muted">
              No indicators match your search.
            </p>
          </div>
        ) : (
          grouped.map((group) => {
            const isCollapsed = collapsed[group.key] ?? false;
            return (
              <div
                key={group.key}
                className="border-b border-border last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [group.key]: !isCollapsed }))
                  }
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-bg-elev hover:bg-bg-elev-2 transition-colors text-left"
                  aria-expanded={!isCollapsed}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`inline-block transition-transform text-fg-muted text-[10px] ${
                        isCollapsed ? '' : 'rotate-90'
                      }`}
                      aria-hidden
                    >
                      ▶
                    </span>
                    <span className="text-xs font-medium text-fg uppercase tracking-wider">
                      {group.label}
                    </span>
                    <span className="text-xs text-fg-muted">
                      · {group.rows.length}
                    </span>
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="divide-y divide-border">
                    {group.rows.map((row) => (
                      <LibraryTableRow
                        key={row.code}
                        row={row}
                        hovered={hoverCode === row.code}
                        onHoverIn={() => setHoverCode(row.code)}
                        onHoverOut={() =>
                          setHoverCode((c) => (c === row.code ? null : c))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface GroupedRows {
  key: string;
  label: string;
  rows: LibraryRow[];
}

function groupRows(rows: LibraryRow[], by: GroupBy): GroupedRows[] {
  const map = new Map<string, GroupedRows>();

  for (const row of rows) {
    const keys = keysFor(row, by);
    for (const [key, label] of keys) {
      let bucket = map.get(key);
      if (!bucket) {
        bucket = { key, label, rows: [] };
        map.set(key, bucket);
      }
      bucket.rows.push(row);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function keysFor(row: LibraryRow, by: GroupBy): [string, string][] {
  switch (by) {
    case 'industry':
      return row.industryTags.length > 0
        ? row.industryTags.map((t) => [t, capitalize(t)] as [string, string])
        : [['uncategorized', 'Uncategorized']];
    case 'source':
      return [[row.source, row.source.toUpperCase()]];
    case 'frequency':
      return [[row.frequency, capitalize(row.frequency)]];
    case 'transmission': {
      const t = transmissionFor(row.costBucket);
      return [[t, TRANSMISSION_LABELS[t]]];
    }
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface LibraryTableRowProps {
  row: LibraryRow;
  hovered: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
}

function LibraryTableRow({
  row,
  hovered,
  onHoverIn,
  onHoverOut,
}: LibraryTableRowProps) {
  return (
    <div
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      onFocus={onHoverIn}
      onBlur={onHoverOut}
      className="relative grid grid-cols-[1fr_auto] gap-3 px-4 py-3 hover:bg-bg-elev transition-colors"
    >
      <Link
        href={`/app/indicators/${encodeURIComponent(row.code)}`}
        className="flex items-center gap-4 min-w-0"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-fg font-medium truncate">{row.name}</p>
          <p className="text-xs text-fg-muted mt-0.5 font-mono truncate">
            {row.code} · {row.source.toUpperCase()} · {row.frequency}
          </p>
        </div>
        <div className="hidden md:flex gap-1 flex-wrap">
          {row.industryTags.map((tag) => (
            <Badge key={tag} variant="industry" label={tag} />
          ))}
        </div>
      </Link>
      <div className="w-[120px] sm:w-[160px] h-10 relative overflow-hidden">
        <div
          className={`absolute inset-0 transition-all duration-200 ${
            hovered && row.sparkline.length > 1
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-4 pointer-events-none'
          }`}
          aria-hidden
        >
          <Sparkline points={row.sparkline} />
        </div>
      </div>
    </div>
  );
}

interface SparklineProps {
  points: { date: string; value: number }[];
  width?: number;
  height?: number;
}

function Sparkline({ points, width = 160, height = 40 }: SparklineProps) {
  if (points.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-end">
        <span className="text-[10px] text-fg-dim">no data</span>
      </div>
    );
  }
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * w;
    const y = pad + h - ((p.value - min) / span) * h;
    return [x, y] as const;
  });
  const d = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const lastValue = values[values.length - 1]!;
  const firstValue = values[0]!;
  const trendUp = lastValue >= firstValue;
  const stroke = trendUp ? 'var(--sl-accent)' : 'var(--sl-crit)';

  const areaD = `${d} L${coords[coords.length - 1]![0].toFixed(1)},${(pad + h).toFixed(1)} L${coords[0]![0].toFixed(1)},${(pad + h).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-full"
      role="img"
      aria-label="90-day sparkline preview"
    >
      <path d={areaD} fill={stroke} opacity={0.12} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.2} />
    </svg>
  );
}
