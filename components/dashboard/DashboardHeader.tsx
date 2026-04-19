import Link from "next/link";
import type { Industry } from "@/lib/indicators/types";

interface DashboardHeaderProps {
  industry: Industry;
  region: string;
  /** ISO timestamp of the most recent observation across all tiles */
  asOf: string | null;
}

const INDUSTRY_LABELS: Record<Industry, string> = {
  restaurant: "Restaurants",
  construction: "Construction",
  retail: "Retail",
};

const INDUSTRIES: Industry[] = ["restaurant", "construction", "retail"];

function buildHref(industry: Industry, region: string): string {
  const params = new URLSearchParams();
  params.set("industry", industry);
  if (region !== "national") params.set("region", region);
  return `/app?${params.toString()}`;
}

function formatAsOf(iso: string | null): string {
  if (!iso) return "no data yet";
  const d = new Date(iso);
  return `Latest data ${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

export function DashboardHeader({
  industry,
  region,
  asOf,
}: DashboardHeaderProps) {
  const regionLabel = region === "national" ? "National" : region.toUpperCase();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
      <div>
        <h1 className="text-xl font-display font-semibold text-fg">
          Dashboard
        </h1>
        <p className="text-xs text-fg-muted mt-0.5">
          {INDUSTRY_LABELS[industry]} · {regionLabel} · {formatAsOf(asOf)}
        </p>
      </div>

      <nav
        aria-label="Industry"
        className="flex items-center gap-1 bg-bg-elev border border-border rounded-[var(--radius-sm)] p-0.5"
      >
        {INDUSTRIES.map((ind) => {
          const active = ind === industry;
          return (
            <Link
              key={ind}
              href={buildHref(ind, region)}
              aria-current={active ? "page" : undefined}
              className={`px-3 py-1.5 text-xs rounded-[4px] transition-colors ${
                active
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              {INDUSTRY_LABELS[ind]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
