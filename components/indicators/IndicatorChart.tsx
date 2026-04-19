'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
  date: string;
  value: number;
}

export function IndicatorChart({ data, unit }: { data: ChartDataPoint[]; unit: string }) {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--sl-accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--sl-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--sl-fg-muted)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--sl-fg-muted)' }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => `${v} ${unit.length < 6 ? unit : ''}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--sl-accent)"
            strokeWidth={1.5}
            fill="url(#chartFill)"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
