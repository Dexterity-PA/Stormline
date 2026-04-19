import Link from 'next/link';
import { Sparkline } from './Sparkline';
import type { IndicatorRef } from './types';

function formatPercentile(value: number): string {
  const rounded = Math.round(value);
  const suffix =
    rounded % 100 >= 11 && rounded % 100 <= 13
      ? 'th'
      : rounded % 10 === 1
        ? 'st'
        : rounded % 10 === 2
          ? 'nd'
          : rounded % 10 === 3
            ? 'rd'
            : 'th';
  return `${rounded}${suffix}`;
}

export function IndicatorHoverCard({ indicator }: { indicator: IndicatorRef }) {
  const deltaPositive = indicator.deltaWoW >= 0;
  const deltaClass = deltaPositive ? 'text-warn' : 'text-good';
  const deltaSign = deltaPositive ? '+' : '';

  return (
    <div className="w-64 rounded-[var(--radius-md)] border border-border-strong bg-bg-elev-2 p-3 shadow-[var(--sl-glow-accent)]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wide text-fg-muted">
            {indicator.code}
          </p>
          <p className="text-xs font-medium text-fg truncate">
            {indicator.name}
          </p>
        </div>
      </div>

      <div className="mb-2">
        <Sparkline series={indicator.series} width={240} height={40} />
      </div>

      <div className="flex items-baseline justify-between border-t border-border pt-2">
        <div>
          <p className="text-[10px] text-fg-muted uppercase tracking-wide">Current</p>
          <p className="text-sm font-mono text-fg">{indicator.currentValue}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-fg-muted uppercase tracking-wide">5Y Percentile</p>
          <p className="text-sm font-mono text-fg">
            {formatPercentile(indicator.percentile)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-fg-muted uppercase tracking-wide">WoW</p>
          <p className={`text-sm font-mono ${deltaClass}`}>
            {deltaSign}
            {indicator.deltaWoW.toFixed(1)}%
          </p>
        </div>
      </div>

      <Link
        href={`/app/indicators/${encodeURIComponent(indicator.code)}`}
        className="mt-3 block text-center text-[11px] font-medium text-accent hover:text-accent-2 transition-colors"
      >
        View indicator detail →
      </Link>
    </div>
  );
}
