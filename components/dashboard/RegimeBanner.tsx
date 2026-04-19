import Link from "next/link";
import type { RegimeSnapshot } from "@/lib/queries/dashboard";

interface RegimeBannerProps {
  regime: RegimeSnapshot;
}

const REGIME_TONE: Record<string, { dot: string; label: string }> = {
  Restrictive: { dot: "bg-warn", label: "text-warn" },
  Accommodative: { dot: "bg-good", label: "text-good" },
  Mixed: { dot: "bg-accent", label: "text-accent" },
};

export function RegimeBanner({ regime }: RegimeBannerProps) {
  const tone = REGIME_TONE[regime.label] ?? REGIME_TONE.Mixed!;
  const alertCount = regime.highSeverityAlertCount;

  return (
    <section
      aria-label="Macro regime"
      className="rounded-[var(--radius-md)] border border-border bg-bg-elev px-5 py-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`h-2 w-2 rounded-full ${tone.dot}`} aria-hidden />
            <span
              className={`text-xs uppercase tracking-wider font-medium ${tone.label}`}
            >
              {regime.label}
            </span>
            <span className="text-xs text-fg-muted">· {regime.detail}</span>
          </div>
          {regime.headline ? (
            <Link
              href={
                regime.briefingId ? `/app/briefings/${regime.briefingId}` : "/app/briefings"
              }
              className="block text-base lg:text-lg font-display font-medium text-fg hover:text-accent transition-colors line-clamp-2"
            >
              {regime.headline}
            </Link>
          ) : (
            <p className="text-base lg:text-lg font-display font-medium text-fg-muted">
              No published briefing yet for this industry/region
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {regime.drivers.map((d) => (
            <div
              key={d.code}
              className="px-3 py-2 rounded-[var(--radius-sm)] border border-border bg-bg min-w-[110px]"
            >
              <p className="text-[10px] uppercase tracking-wider text-fg-dim">
                {d.label}
              </p>
              <p className="text-sm font-mono text-fg tabular-nums mt-0.5">
                {d.value}
                <span className="text-fg-muted text-[10px] ml-1">{d.unit}</span>
              </p>
              {d.percentile != null && (
                <p className="text-[10px] text-fg-muted mt-0.5 tabular-nums">
                  {d.percentile}th pct
                </p>
              )}
            </div>
          ))}

          <Link
            href="/app/alerts"
            className={`px-3 py-2 rounded-[var(--radius-sm)] border min-w-[110px] transition-colors ${
              alertCount > 0
                ? "border-crit/40 bg-crit/5 hover:border-crit/70"
                : "border-border bg-bg hover:border-accent/40"
            }`}
          >
            <p className="text-[10px] uppercase tracking-wider text-fg-dim">
              Active alerts
            </p>
            <p
              className={`text-sm font-mono tabular-nums mt-0.5 ${
                alertCount > 0 ? "text-crit" : "text-fg"
              }`}
            >
              {alertCount}
              <span className="text-fg-muted text-[10px] ml-1">high sev</span>
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
