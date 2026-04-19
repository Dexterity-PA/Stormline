"use client";

import { useMemo, useTransition } from "react";
import { IndicatorTile } from "./IndicatorTile";
import { setDensityAction, type Density } from "@/app/app/actions";
import type { IndicatorTileData } from "@/lib/queries/dashboard";

const MAX_PINNED = 8;

interface TileGridProps {
  tiles: IndicatorTileData[];
  pinned: string[];
  density: Density;
}

export function TileGrid({ tiles, pinned, density }: TileGridProps) {
  const [densityPending, startDensity] = useTransition();
  const pinnedSet = useMemo(() => new Set(pinned), [pinned]);

  const ordered = useMemo(() => {
    const pinnedTiles: IndicatorTileData[] = [];
    const rest: IndicatorTileData[] = [];
    for (const t of tiles) {
      if (pinnedSet.has(t.code)) pinnedTiles.push(t);
      else rest.push(t);
    }
    // Preserve user-defined pin order (most recently pinned first).
    pinnedTiles.sort(
      (a, b) => pinned.indexOf(a.code) - pinned.indexOf(b.code),
    );
    return [...pinnedTiles, ...rest];
  }, [tiles, pinned, pinnedSet]);

  function handleDensity(next: Density) {
    if (next === density) return;
    const fd = new FormData();
    fd.set("density", next);
    startDensity(() => {
      void setDensityAction(fd);
    });
  }

  const pinDisabled = pinned.length >= MAX_PINNED;

  return (
    <section aria-label="Indicators">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm font-display font-semibold text-fg">
            Indicators
          </h2>
          <span className="text-xs text-fg-muted">
            {tiles.length} tracked · {pinned.length}/{MAX_PINNED} pinned
          </span>
        </div>

        <div
          role="group"
          aria-label="Density"
          className={`inline-flex items-center bg-bg-elev border border-border rounded-[var(--radius-sm)] p-0.5 text-xs ${
            densityPending ? "opacity-60" : ""
          }`}
        >
          <DensityButton
            current={density}
            value="comfortable"
            onClick={() => handleDensity("comfortable")}
          >
            Comfortable
          </DensityButton>
          <DensityButton
            current={density}
            value="compact"
            onClick={() => handleDensity("compact")}
          >
            Compact
          </DensityButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {ordered.map((tile) => (
          <IndicatorTile
            key={tile.code}
            tile={tile}
            pinned={pinnedSet.has(tile.code)}
            density={density}
            pinDisabled={pinDisabled}
          />
        ))}
      </div>
    </section>
  );
}

function DensityButton({
  current,
  value,
  onClick,
  children,
}: {
  current: Density;
  value: Density;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-2.5 py-1 rounded-[4px] transition-colors ${
        active
          ? "bg-accent/15 text-accent"
          : "text-fg-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
