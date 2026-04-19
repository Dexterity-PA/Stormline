import type { PullStatData } from './types';

export function PullStat({ stats }: { stats: readonly PullStatData[] }) {
  if (stats.length === 0) return null;

  return (
    <div
      className={`my-5 grid gap-3 rounded-[var(--radius-md)] border border-border bg-bg-elev p-4 ${
        stats.length === 1
          ? 'grid-cols-1'
          : stats.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-3'
      }`}
    >
      {stats.map((stat) => (
        <div key={`${stat.label}-${stat.value}`} className="min-w-0">
          <p className="font-display text-2xl font-semibold text-fg leading-none">
            {stat.value}
          </p>
          <p className="mt-1.5 text-[11px] uppercase tracking-wide text-fg-muted leading-snug">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
