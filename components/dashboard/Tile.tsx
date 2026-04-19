import Link from 'next/link';
import { Sparkline } from './Sparkline';

export interface TileData {
  code: string;
  label: string;
  value: string;
  unit: string;
  /** Week-over-week change, e.g. 3.2 = +3.2% */
  deltaPercent: number;
  /** cost = up is bad; demand = up is good */
  deltaType: 'cost' | 'demand';
  /** 0–100 five-year percentile */
  percentile: number;
  source: string;
  lastUpdated: string;
  /** ~24 data points for sparkline */
  series: number[];
}

function deltaColor(delta: number, type: 'cost' | 'demand'): string {
  const up = delta > 0;
  return type === 'cost'
    ? up ? 'text-crit' : 'text-good'
    : up ? 'text-good' : 'text-crit';
}

export function Tile({ tile }: { tile: TileData }) {
  const sign = tile.deltaPercent > 0 ? '+' : '';

  return (
    <Link
      href={`/app/indicators/${encodeURIComponent(tile.code)}`}
      className="block bg-bg-elev border border-border rounded-[var(--radius-md)] p-4 hover:border-accent/40 transition-colors group"
    >
      <p className="text-xs text-fg-muted mb-2 leading-snug line-clamp-2">
        {tile.label}
      </p>

      <div className="flex items-end justify-between mb-3">
        <div className="min-w-0">
          <span className="text-2xl font-display font-semibold text-fg">
            {tile.value}
          </span>
          <span className="text-xs text-fg-muted ml-1">{tile.unit}</span>
        </div>
        <span
          className={`text-sm font-medium flex-shrink-0 ml-2 ${deltaColor(tile.deltaPercent, tile.deltaType)}`}
        >
          {sign}{tile.deltaPercent.toFixed(1)}%
        </span>
      </div>

      <Sparkline
        values={tile.series}
        positive={tile.deltaType === 'demand'}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-fg-muted">{tile.percentile}th pct</span>
        <span className="text-xs text-fg-muted truncate">
          {tile.source} · {tile.lastUpdated}
        </span>
      </div>
    </Link>
  );
}
