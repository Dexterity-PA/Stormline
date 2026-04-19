"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Sparkline } from "./Sparkline";
import type { IndicatorTileData, DeltaType } from "@/lib/queries/dashboard";
import type { Density } from "@/app/app/actions";
import { togglePinAction } from "@/app/app/actions";

interface IndicatorTileProps {
  tile: IndicatorTileData;
  pinned: boolean;
  density: Density;
  /** When true and not currently pinned, the pin button is disabled (cap reached). */
  pinDisabled?: boolean;
}

function deltaColor(delta: number, type: DeltaType): string {
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

export function IndicatorTile({
  tile,
  pinned,
  density,
  pinDisabled,
}: IndicatorTileProps) {
  const [pending, startTransition] = useTransition();
  const sign = tile.deltaPercent > 0 ? "+" : "";
  const compact = density === "compact";

  function handleTogglePin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pinDisabled) return;
    const fd = new FormData();
    fd.set("code", tile.code);
    startTransition(() => {
      void togglePinAction(fd);
    });
  }

  return (
    <div className="relative group">
      <Link
        href={`/app/indicators/${encodeURIComponent(tile.code)}`}
        className={`block bg-bg-elev border border-border rounded-[var(--radius-md)] hover:border-accent/40 transition-colors ${
          compact ? "p-3" : "p-4"
        }`}
      >
        <p
          className={`text-xs text-fg-muted leading-snug line-clamp-2 ${
            compact ? "mb-1.5" : "mb-2"
          } pr-7`}
        >
          {tile.name}
        </p>

        <div
          className={`flex items-end justify-between ${compact ? "mb-2" : "mb-3"}`}
        >
          <div className="min-w-0">
            <span
              className={`font-display font-semibold text-fg ${
                compact ? "text-xl" : "text-2xl"
              }`}
            >
              {tile.value}
            </span>
            <span className="text-xs text-fg-muted ml-1">{tile.unit}</span>
          </div>
          <span
            className={`text-sm font-medium flex-shrink-0 ml-2 tabular-nums ${deltaColor(
              tile.deltaPercent,
              tile.deltaType,
            )}`}
          >
            {sign}
            {tile.deltaPercent.toFixed(1)}%
          </span>
        </div>

        <Sparkline
          values={tile.series}
          positive={tile.deltaType === "demand"}
          width={240}
          height={compact ? 28 : 40}
          className="w-full"
        />

        <div
          className={`${compact ? "mt-1.5" : "mt-2"} flex items-center justify-between gap-2`}
        >
          <span className="text-xs text-fg-muted tabular-nums">
            {tile.percentile != null
              ? `${tile.percentile}th pct`
              : "—"}
          </span>
          <span className="text-xs text-fg-muted truncate">
            {tile.source} · {tile.lastUpdated}
          </span>
        </div>

        {!compact && (
          <p className="mt-2 pt-2 border-t border-border/60 text-[11px] leading-snug text-fg-dim italic">
            {tile.operatorContext}
          </p>
        )}
      </Link>

      <button
        type="button"
        onClick={handleTogglePin}
        disabled={pending || (pinDisabled && !pinned)}
        aria-label={pinned ? "Unpin indicator" : "Pin indicator"}
        title={
          pinned
            ? "Unpin"
            : pinDisabled
              ? "Pin limit reached (8)"
              : "Pin to top"
        }
        className={`absolute top-2 right-2 h-6 w-6 rounded-[var(--radius-sm)] flex items-center justify-center transition-all ${
          pinned
            ? "text-accent bg-accent/10 border border-accent/30"
            : "text-fg-dim border border-transparent hover:text-fg hover:bg-bg-elev-2 opacity-0 group-hover:opacity-100"
        } ${pending ? "opacity-50" : ""} disabled:cursor-not-allowed`}
      >
        <PinGlyph filled={pinned} />
      </button>
    </div>
  );
}

function PinGlyph({ filled }: { filled: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 1.5v6m0 0L4.5 11h7L8 7.5zm0 6V14" />
    </svg>
  );
}
