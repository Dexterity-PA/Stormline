import { AlertsRail } from "@/components/dashboard/AlertsRail";
import { BriefingCard } from "@/components/dashboard/BriefingCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RegimeBanner } from "@/components/dashboard/RegimeBanner";
import { TileGrid } from "@/components/dashboard/TileGrid";
import { TopMovers } from "@/components/dashboard/TopMovers";
import { loadDashboardPrefs } from "./actions";
import { getDashboardData } from "@/lib/queries/dashboard";
import type { Industry } from "@/lib/indicators/types";

const INDUSTRIES: readonly Industry[] = [
  "restaurant",
  "construction",
  "retail",
];

function isIndustry(value: string | undefined): value is Industry {
  return !!value && (INDUSTRIES as readonly string[]).includes(value);
}

interface PageProps {
  searchParams: Promise<{ industry?: string; region?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const industry: Industry = isIndustry(params.industry)
    ? params.industry
    : "restaurant";
  const region = params.region ?? "national";

  const [data, prefs] = await Promise.all([
    getDashboardData({ industry, region }),
    loadDashboardPrefs(),
  ]);

  const asOf =
    data.tiles
      .map((t) => t.lastUpdated)
      .sort()
      .at(-1) ?? null;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <DashboardHeader industry={industry} region={region} asOf={asOf} />

      <RegimeBanner regime={data.regime} />

      <BriefingCard briefing={data.latestBriefing} />

      <TopMovers movers={data.topMovers} />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <TileGrid
          tiles={data.tiles}
          pinned={prefs.pinned}
          density={prefs.density}
        />
        <AlertsRail alerts={data.alerts} />
      </div>

      <p className="text-[11px] text-fg-muted border-t border-border pt-4">
        Stormline provides market intelligence, not financial, legal, or tax
        advice. Trends and historical patterns shown here describe what has
        occurred in similar conditions. Consult licensed professionals for
        decisions specific to your business.
      </p>
    </div>
  );
}
