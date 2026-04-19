// components/sidebar/TodayCard.tsx
import { getRegimeSnapshot } from "@/lib/queries/dashboard";

const REGIME_DOT: Record<string, string> = {
  Restrictive: "bg-warn",
  Accommodative: "bg-good",
  Mixed: "bg-accent",
};

function formatTodayDate(now: Date): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

function isDst(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return date.getTimezoneOffset() < Math.max(jan, jul);
}

function getMarketStatus(now: Date): { open: boolean; label: string } {
  const etOffset = isDst(now) ? -4 : -5;
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const etHour = ((utcHour + etOffset + 24) % 24);
  const utcDay = now.getUTCDay();
  // approximate ET day (good enough for open/close indicator)
  const etDay = utcHour + etOffset < 0 ? ((utcDay + 6) % 7) : utcDay;
  const isWeekday = etDay >= 1 && etDay <= 5;
  const open = isWeekday && etHour >= 9.5 && etHour < 16;
  return { open, label: open ? "Markets open" : "Markets closed" };
}

function nextMondayLabel(now: Date): string {
  const d = new Date(now);
  const day = d.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setUTCDate(d.getUTCDate() + daysUntilMonday);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function TodayCard() {
  const now = new Date();
  const market = getMarketStatus(now);
  const regime = await getRegimeSnapshot("national");
  const dotClass = REGIME_DOT[regime.label] ?? REGIME_DOT["Mixed"]!;
  const briefingDate = nextMondayLabel(now);

  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-bg-elev px-3 py-2.5 space-y-2">
      <p className="text-[11px] font-medium text-fg">{formatTodayDate(now)}</p>

      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
            market.open ? "bg-good" : "bg-fg-dim"
          }`}
          aria-hidden
        />
        <span className="text-[10px] text-fg-muted">{market.label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotClass}`}
          aria-hidden
        />
        <span className="text-[10px] text-fg-muted">
          {regime.label} · {regime.detail}
        </span>
      </div>

      <p className="text-[10px] text-fg-dim">
        Next briefing: <span className="text-fg-muted">{briefingDate}</span>
      </p>
    </div>
  );
}
