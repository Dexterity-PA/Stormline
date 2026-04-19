import Link from "next/link";
import type { DashboardAlert } from "@/lib/queries/dashboard";

const SEVERITY_CLASS: Record<DashboardAlert["severity"], string> = {
  high: "border-crit/40 bg-crit/5 text-crit",
  medium: "border-warn/40 bg-warn/5 text-warn",
  low: "border-border bg-bg-elev text-fg-muted",
};

const CATEGORY_LABEL: Record<string, string> = {
  hurricane: "Hurricane",
  tariff: "Tariff",
  fomc: "FOMC",
  credit: "Credit",
  commodity_move: "Commodity",
  other: "Other",
};

function formatTimeSince(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffH = Math.round((now - then) / 36e5);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.round(diffH / 24)}d ago`;
}

export function AlertsRail({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <aside aria-label="Active alerts" className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-display font-semibold text-fg">
          Active alerts
        </h2>
        <Link
          href="/app/alerts"
          className="text-xs text-accent hover:underline"
        >
          View all →
        </Link>
      </div>

      {alerts.length === 0 ? (
        <p className="text-xs text-fg-muted px-3 py-3 rounded-[var(--radius-sm)] border border-dashed border-border">
          No active alerts in the last 14 days.
        </p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id}>
              <Link
                href={`/app/alerts/${a.id}`}
                className={`block rounded-[var(--radius-sm)] border px-3 py-2.5 transition-colors hover:border-accent/40 ${SEVERITY_CLASS[a.severity]}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    {CATEGORY_LABEL[a.category] ?? a.category} · {a.severity}
                  </span>
                  <span className="text-[10px] text-fg-muted">
                    {formatTimeSince(a.publishedAt)}
                  </span>
                </div>
                <p className="text-xs text-fg leading-snug line-clamp-3">
                  {a.headline}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
