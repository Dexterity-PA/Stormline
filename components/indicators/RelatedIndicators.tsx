import Link from 'next/link';

import type { RelatedIndicatorWithSeries } from '@/lib/queries/indicators-detail';

interface RelatedIndicatorsProps {
  related: RelatedIndicatorWithSeries[];
}

export function RelatedIndicators({ related }: RelatedIndicatorsProps) {
  if (related.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wider mb-3">
          Related indicators
        </h2>
        <p className="text-xs text-fg-muted">
          No peers tagged with the same transmission mechanism yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wider mb-3">
        Related indicators
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {related.map((rel) => (
          <RelatedCard key={rel.code} item={rel} />
        ))}
      </div>
    </div>
  );
}

function RelatedCard({ item }: { item: RelatedIndicatorWithSeries }) {
  const percentileLabel =
    item.latestPercentile === null ? '—' : `${item.latestPercentile}th`;
  const percentileTone =
    item.latestPercentile === null
      ? 'text-fg-muted'
      : item.latestPercentile >= 80
        ? 'text-crit'
        : item.latestPercentile <= 20
          ? 'text-good'
          : 'text-fg';

  return (
    <Link
      href={`/app/indicators/${encodeURIComponent(item.code)}`}
      className="block bg-bg-elev border border-border rounded-[var(--radius-sm)] px-4 py-3 hover:border-accent/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-fg font-medium leading-snug truncate">
            {item.name}
          </p>
          <p className="text-xs text-fg-muted mt-0.5">{item.unit}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-fg-muted">
            5yr pct
          </p>
          <p className={`text-xs font-medium tabular-nums ${percentileTone}`}>
            {percentileLabel}
          </p>
        </div>
      </div>
      <div className="mt-2 h-8">
        <MiniSparkline points={item.series30d} />
      </div>
    </Link>
  );
}

function MiniSparkline({
  points,
}: {
  points: { date: string; value: number }[];
}) {
  if (points.length < 2) {
    return (
      <div className="w-full h-full flex items-center">
        <span className="text-[10px] text-fg-dim">no recent data</span>
      </div>
    );
  }
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 200;
  const height = 32;
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
  const first = values[0]!;
  const last = values[values.length - 1]!;
  const stroke = last >= first ? 'var(--sl-accent)' : 'var(--sl-crit)';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-full"
      role="img"
      aria-label="30-day trend"
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.25} />
    </svg>
  );
}
