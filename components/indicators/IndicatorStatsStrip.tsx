import type { HistoryPoint } from '@/lib/queries/indicators-detail';

interface IndicatorStatsStripProps {
  history: HistoryPoint[];
  unit: string;
  /** When true, higher values are "bad" (input costs rising). Default: false. */
  higherIsWorse?: boolean;
}

interface Stat {
  label: string;
  value: string;
  tone: 'pos' | 'neg' | 'neutral';
  hint?: string;
}

function closestBefore(
  points: HistoryPoint[],
  targetIso: string,
): HistoryPoint | null {
  let best: HistoryPoint | null = null;
  for (const p of points) {
    if (p.date <= targetIso) best = p;
    else break;
  }
  return best;
}

function isoDaysAgo(days: number): string {
  const now = new Date();
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function formatValue(v: number, unit: string): string {
  const abs = Math.abs(v);
  const digits = abs >= 100 ? 1 : abs >= 10 ? 2 : 3;
  const num = v.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
  return unit && unit.length <= 10 ? `${num} ${unit}` : num;
}

function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

function toneFor(
  delta: number | null,
  higherIsWorse: boolean,
): 'pos' | 'neg' | 'neutral' {
  if (delta === null || Math.abs(delta) < 0.01) return 'neutral';
  if (higherIsWorse) return delta > 0 ? 'neg' : 'pos';
  return delta > 0 ? 'pos' : 'neg';
}

function formatPct(v: number | null): string {
  if (v === null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function computePercentile(series: number[], value: number): number | null {
  if (series.length < 2) return null;
  let below = 0;
  for (const v of series) if (v < value) below += 1;
  return Math.round((below / series.length) * 100);
}

export function IndicatorStatsStrip({
  history,
  unit,
  higherIsWorse = false,
}: IndicatorStatsStripProps) {
  const latest = history.at(-1);

  if (!latest) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Pill label="Current" value="—" tone="neutral" />
      </div>
    );
  }

  const wowPoint = closestBefore(history, isoDaysAgo(7));
  const momPoint = closestBefore(history, isoDaysAgo(30));
  const yoyPoint = closestBefore(history, isoDaysAgo(365));

  const wow = wowPoint ? pctChange(latest.value, wowPoint.value) : null;
  const mom = momPoint ? pctChange(latest.value, momPoint.value) : null;
  const yoy = yoyPoint ? pctChange(latest.value, yoyPoint.value) : null;

  const fiveYrIso = isoDaysAgo(365 * 5);
  const fiveYrSeries = history
    .filter((p) => p.date >= fiveYrIso)
    .map((p) => p.value);
  const percentile = computePercentile(fiveYrSeries, latest.value);

  const stats: Stat[] = [
    {
      label: 'Current',
      value: formatValue(latest.value, unit),
      tone: 'neutral',
      hint: new Date(latest.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    { label: 'WoW', value: formatPct(wow), tone: toneFor(wow, higherIsWorse) },
    { label: 'MoM', value: formatPct(mom), tone: toneFor(mom, higherIsWorse) },
    { label: 'YoY', value: formatPct(yoy), tone: toneFor(yoy, higherIsWorse) },
    {
      label: '5yr percentile',
      value: percentile === null ? '—' : `${percentile}th`,
      tone: 'neutral',
      hint:
        percentile === null
          ? undefined
          : percentile >= 80
            ? 'historically high'
            : percentile <= 20
              ? 'historically low'
              : 'in typical range',
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stats.map((s) => (
        <Pill key={s.label} {...s} />
      ))}
    </div>
  );
}

function Pill({ label, value, tone, hint }: Stat) {
  const toneClass =
    tone === 'pos'
      ? 'text-good'
      : tone === 'neg'
        ? 'text-crit'
        : 'text-fg';
  return (
    <div className="bg-bg-elev border border-border rounded-[var(--radius-sm)] px-3 py-2 min-w-[90px]">
      <p className="text-[10px] uppercase tracking-wider text-fg-muted">
        {label}
      </p>
      <p className={`text-sm font-medium tabular-nums mt-0.5 ${toneClass}`}>
        {value}
      </p>
      {hint ? (
        <p className="text-[10px] text-fg-muted mt-0.5">{hint}</p>
      ) : null}
    </div>
  );
}
