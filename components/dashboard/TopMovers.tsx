import Link from "next/link";
import { Sparkline } from "./Sparkline";
import type { MoverTile } from "@/lib/queries/dashboard";

interface TopMoversProps {
  movers: MoverTile[];
}

function deltaClass(delta: number, type: MoverTile["deltaType"]): string {
  if (delta === 0) return "text-fg-muted";
  const up = delta > 0;
  return type === "cost"
    ? up
      ? "text-crit"
      : "text-good"
    : up
      ? "text-good"
      : "text-crit";
}

export function TopMovers({ movers }: TopMoversProps) {
  if (movers.length === 0) {
    return (
      <section aria-label="Top movers">
        <h2 className="text-sm font-display font-semibold text-fg mb-2">
          Top movers
        </h2>
        <div className="rounded-[var(--radius-md)] border border-border bg-bg-elev px-4 py-3 text-xs text-fg-muted">
          No observation data available yet for this industry.
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Top movers">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-display font-semibold text-fg">
          Top movers
        </h2>
        <span className="text-xs text-fg-muted">
          Period-over-period · sorted by absolute change
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {movers.map((m) => {
          const sign = m.deltaPercent > 0 ? "+" : "";
          return (
            <Link
              key={m.code}
              href={`/app/indicators/${encodeURIComponent(m.code)}`}
              className="block rounded-[var(--radius-sm)] border border-border bg-bg-elev px-3 py-2.5 hover:border-accent/40 transition-colors"
            >
              <p className="text-[11px] text-fg-muted line-clamp-1 mb-1">
                {m.name}
              </p>
              <div className="flex items-baseline justify-between gap-1 mb-1.5">
                <span className="text-sm font-display font-semibold text-fg tabular-nums">
                  {m.value}
                  <span className="text-[10px] text-fg-muted ml-1 font-normal">
                    {m.unit}
                  </span>
                </span>
                <span
                  className={`text-xs font-medium tabular-nums ${deltaClass(m.deltaPercent, m.deltaType)}`}
                >
                  {sign}
                  {m.deltaPercent.toFixed(1)}%
                </span>
              </div>
              <Sparkline
                values={m.series}
                positive={m.deltaType === "demand"}
                width={140}
                height={20}
                className="w-full"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
