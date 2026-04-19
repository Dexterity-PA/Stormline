import Link from "next/link";
import type { BriefingPreview } from "@/lib/queries/dashboard";

function formatRange(weekStart: string, weekEnd: string): string {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(`${weekEnd}T00:00:00Z`);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

export function BriefingCard({ briefing }: { briefing: BriefingPreview | null }) {
  if (!briefing) {
    return (
      <section
        aria-label="Latest briefing"
        className="rounded-[var(--radius-md)] border border-dashed border-border bg-bg-elev px-4 py-3.5"
      >
        <p className="text-xs uppercase tracking-wider text-fg-dim mb-1">
          Latest briefing
        </p>
        <p className="text-sm text-fg-muted">
          No published briefing yet — drafts appear here once reviewed.
        </p>
      </section>
    );
  }

  return (
    <Link
      href={`/app/briefings/${briefing.id}`}
      aria-label={`Latest briefing: ${briefing.headline}`}
      className="block rounded-[var(--radius-md)] border border-border bg-bg-elev px-4 py-3.5 hover:border-accent/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] uppercase tracking-wider font-medium text-accent">
          Latest briefing
        </p>
        <span className="text-[10px] text-fg-muted tabular-nums">
          {formatRange(briefing.weekStart, briefing.weekEnd)}
        </span>
      </div>
      <p className="text-sm font-display font-medium text-fg leading-snug mb-1">
        {briefing.headline}
      </p>
      <p className="text-xs text-fg-muted line-clamp-2 leading-snug">
        {briefing.excerpt}
      </p>
    </Link>
  );
}
