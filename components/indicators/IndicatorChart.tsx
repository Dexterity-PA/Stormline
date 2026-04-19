'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface ChartDataPoint {
  /** ISO date `YYYY-MM-DD`. */
  date: string;
  value: number;
}

export type ChartTrend = 'up' | 'down' | 'flat';
export type ChartRange = '3M' | '1Y' | '5Y' | 'MAX';

interface IndicatorChartProps {
  data: ChartDataPoint[];
  unit: string;
  trend?: ChartTrend;
  defaultRange?: ChartRange;
}

const RANGE_MONTHS: Record<Exclude<ChartRange, 'MAX'>, number> = {
  '3M': 3,
  '1Y': 12,
  '5Y': 60,
};

const RANGES: ChartRange[] = ['3M', '1Y', '5Y', 'MAX'];

function isoMonthsAgo(months: number): string {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, now.getUTCDate()),
  );
  return d.toISOString().slice(0, 10);
}

function formatTickDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
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

function percentileOf(series: readonly number[], value: number): number | null {
  if (series.length < 2) return null;
  let below = 0;
  for (const v of series) if (v < value) below += 1;
  return Math.round((below / series.length) * 100);
}

interface TooltipContext {
  filtered: ChartDataPoint[];
  unit: string;
}

interface RechartsTooltipPayload {
  payload?: ChartDataPoint;
}

interface RechartsTooltipProps {
  active?: boolean;
  payload?: RechartsTooltipPayload[];
}

function ChartTooltip({
  active,
  payload,
  ctx,
}: RechartsTooltipProps & { ctx: TooltipContext }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const idx = ctx.filtered.findIndex((p) => p.date === point.date);
  const prev = idx > 0 ? ctx.filtered[idx - 1] : null;
  const deltaPct =
    prev && prev.value !== 0
      ? ((point.value - prev.value) / prev.value) * 100
      : null;

  const values = ctx.filtered.map((p) => p.value);
  const pct = percentileOf(values, point.value);

  const deltaLabel =
    deltaPct === null
      ? '—'
      : `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(2)}%`;
  const deltaClass =
    deltaPct === null
      ? 'text-fg-muted'
      : deltaPct > 0
        ? 'text-crit'
        : deltaPct < 0
          ? 'text-good'
          : 'text-fg-muted';

  return (
    <div className="bg-bg-elev-2 border border-border-strong rounded-[var(--radius-sm)] px-3 py-2 shadow-sm min-w-[180px]">
      <p className="text-xs text-fg-muted mb-1">
        {new Date(point.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      <p className="text-sm font-medium text-fg mb-1.5 tabular-nums">
        {formatValue(point.value, ctx.unit)}
      </p>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-fg-muted">Δ prior</span>
        <span className={`tabular-nums ${deltaClass}`}>{deltaLabel}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-xs mt-0.5">
        <span className="text-fg-muted">Percentile</span>
        <span className="text-fg tabular-nums">
          {pct === null ? '—' : `${pct}th`}
        </span>
      </div>
    </div>
  );
}

export function IndicatorChart({
  data,
  unit,
  trend,
  defaultRange = '1Y',
}: IndicatorChartProps) {
  const [range, setRange] = useState<ChartRange>(defaultRange);

  const filtered = useMemo<ChartDataPoint[]>(() => {
    if (range === 'MAX') return data;
    const months = RANGE_MONTHS[range];
    const cutoff = isoMonthsAgo(months);
    return data.filter((d) => d.date >= cutoff);
  }, [data, range]);

  const strokeVar =
    trend === 'down'
      ? 'var(--sl-crit)'
      : trend === 'flat'
        ? 'var(--sl-fg-muted)'
        : 'var(--sl-accent)';

  const gradientId = `chart-fill-${trend ?? 'default'}`;

  if (filtered.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-end gap-1 mb-2">
          {RANGES.map((r) => (
            <RangeButton
              key={r}
              label={r}
              active={r === range}
              onClick={() => setRange(r)}
            />
          ))}
        </div>
        <div className="w-full h-64 flex items-center justify-center border border-dashed border-border rounded-[var(--radius-sm)]">
          <p className="text-xs text-fg-muted">No historical data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-1 mb-2">
        {RANGES.map((r) => (
          <RangeButton
            key={r}
            label={r}
            active={r === range}
            onClick={() => setRange(r)}
          />
        ))}
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filtered}
            margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeVar} stopOpacity={0.2} />
                <stop offset="100%" stopColor={strokeVar} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--sl-border)"
              strokeDasharray="2 4"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--sl-fg-muted)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
              tickFormatter={formatTickDate}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--sl-fg-muted)' }}
              tickLine={false}
              axisLine={false}
              width={48}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) =>
                v.toLocaleString(undefined, { maximumFractionDigits: 1 })
              }
            />
            <Tooltip
              cursor={{
                stroke: 'var(--sl-border-strong)',
                strokeDasharray: '3 3',
              }}
              content={<ChartTooltip ctx={{ filtered, unit }} />}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeVar}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 3, fill: strokeVar, stroke: strokeVar }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RangeButton({
  label,
  active,
  onClick,
}: {
  label: ChartRange;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-[11px] font-medium rounded-[var(--radius-sm)] transition-colors ${
        active
          ? 'bg-accent/10 text-accent border border-accent/20'
          : 'text-fg-muted hover:text-fg hover:bg-bg-elev border border-transparent'
      }`}
    >
      {label}
    </button>
  );
}
