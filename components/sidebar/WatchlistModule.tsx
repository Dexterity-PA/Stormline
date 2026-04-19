// components/sidebar/WatchlistModule.tsx
import Link from "next/link";
import { loadDashboardPrefs } from "@/app/app/actions";
import { getObservationsForCodes } from "@/lib/queries/observations";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { INDICATOR_REGISTRY } from "@/lib/indicators/registry";
import { classifyDelta } from "@/lib/queries/dashboard";

const MAX_WATCHLIST = 5;

function formatWatchlistValue(value: number, unit: string): string {
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 0 : abs >= 10 ? 1 : 2;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  if (unit === "%" || unit === "index" || unit.length > 6) return formatted;
  return `${formatted} ${unit}`;
}

export async function WatchlistModule() {
  // TODO(stream-d): When Stream D (onboarding) ships, it will write pinned codes to
  // onboarding_state.pinned_indicator_codes. Stream D owns reconciliation: migrate
  // Clerk prefs.pinned → onboarding_state, then flip this read to the DB table.
  // Until then, Clerk metadata is the source of truth.
  const prefs = await loadDashboardPrefs();
  const codes = prefs.pinned.slice(0, MAX_WATCHLIST);

  if (codes.length === 0) {
    return (
      <div className="pt-3 border-t border-border">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-semibold text-fg uppercase tracking-wider">
            Watchlist
          </h3>
        </div>
        <p className="text-[11px] text-fg-muted leading-snug">
          Pin indicators from the{" "}
          <Link href="/app" className="text-accent hover:underline">
            dashboard
          </Link>{" "}
          to track them here.
        </p>
      </div>
    );
  }

  const obs = await getObservationsForCodes(codes, 3);

  const items = codes
    .map((code) => {
      const def = INDICATOR_REGISTRY.find((d) => d.code === code);
      if (!def) return null;
      const series = obs[code] ?? [];
      const latest = series.at(-1);
      if (!latest) return null;
      return {
        code,
        name: def.name,
        unit: def.unit,
        value: latest.value,
        sparkline: series.slice(-12).map((p) => p.value),
        positive: classifyDelta(def.costBucket) === "demand",
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="pt-3 border-t border-border">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xs font-semibold text-fg uppercase tracking-wider">
          Watchlist
        </h3>
        <Link
          href="/app/indicators?pinned=1"
          className="text-[10px] text-accent hover:underline"
        >
          View all →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-fg-muted">
          No data yet for pinned indicators.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.code}>
              <Link
                href={`/app/indicators/${encodeURIComponent(item.code)}`}
                className="flex items-center gap-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-bg-elev px-1 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-fg-muted truncate leading-none">
                    {item.name}
                  </p>
                  <p className="text-xs font-mono text-fg tabular-nums mt-0.5">
                    {formatWatchlistValue(item.value, item.unit)}
                  </p>
                </div>
                <Sparkline
                  values={item.sparkline}
                  positive={item.positive}
                  width={40}
                  height={20}
                  className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
