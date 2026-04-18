import type { DashboardTileMock } from "@/app/(marketing)/industries/[slug]/content";

type Props = {
  industryName: string;
  tiles: DashboardTileMock[];
};

function DeltaBadge({
  delta,
  sign,
  isCostInput,
}: {
  delta: string;
  sign: DashboardTileMock["weekDeltaSign"];
  isCostInput: boolean;
}) {
  if (sign === "flat") {
    return (
      <span className="text-xs font-mono text-fg-muted">{delta}</span>
    );
  }

  const isAdverse =
    (isCostInput && sign === "up") || (!isCostInput && sign === "down");

  return (
    <span
      className={`text-xs font-mono ${isAdverse ? "text-crit" : "text-good"}`}
    >
      {sign === "up" ? "▲" : "▼"} {delta}
    </span>
  );
}

function PercentileBar({ value }: { value: number }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-fg-muted">5yr range</span>
        <span className="text-xs font-mono text-fg-muted">
          {value}th pct
        </span>
      </div>
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ background: "var(--sl-border)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background:
              value >= 80
                ? "var(--sl-warn)"
                : value <= 25
                  ? "var(--sl-good)"
                  : "var(--sl-accent)",
          }}
        />
      </div>
    </div>
  );
}

function DashboardTile({ tile }: { tile: DashboardTileMock }) {
  return (
    <div
      className="rounded-md border border-border p-4 flex flex-col"
      style={{ background: "var(--sl-bg-elev)" }}
    >
      <p className="text-xs text-fg-muted leading-snug">{tile.label}</p>
      <p className="mt-2 text-xl font-mono font-semibold text-fg">
        {tile.value}
      </p>
      <div className="mt-1">
        <DeltaBadge
          delta={tile.weekDelta}
          sign={tile.weekDeltaSign}
          isCostInput={tile.isCostInput}
        />
        <span className="ml-2 text-xs text-fg-muted">/ wk</span>
      </div>
      <PercentileBar value={tile.percentile5yr} />
      <p className="mt-3 text-xs text-fg-muted border-t border-border pt-2">
        {tile.source}
      </p>
    </div>
  );
}

export default function SampleDashboard({ industryName, tiles }: Props) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-10">
        <p className="text-xs font-mono tracking-widest uppercase text-accent mb-2">
          Input Price Dashboard
        </p>
        <h2 className="text-2xl font-display font-semibold text-fg">
          Your cost environment, live — zero setup required.
        </h2>
        <p className="mt-2 text-fg-muted text-sm max-w-2xl">
          Pre-configured for {industryName.toLowerCase()} operators. Each tile
          shows the current value, weekly change, and where that number sits
          in its 5-year history. Red means elevated cost; green means favorable.
          Click any tile for the full history and chart.
        </p>
        <p className="mt-2 text-xs text-fg-muted italic">
          Values below are illustrative mock data. Your live dashboard pulls
          directly from FRED, EIA, USDA, and BLS.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tiles.map((tile) => (
          <DashboardTile key={tile.label} tile={tile} />
        ))}
      </div>
    </section>
  );
}
