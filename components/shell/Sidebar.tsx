import { Suspense } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { NavLink } from "./NavLink";
import { TodayCard } from "@/components/sidebar/TodayCard";
import { WatchlistModule } from "@/components/sidebar/WatchlistModule";
import { AskStormline } from "@/components/sidebar/AskStormline";

const NAV_MAIN = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/briefings", label: "Briefings" },
  { href: "/app/alerts", label: "Alerts" },
  { href: "/app/indicators", label: "Indicators" },
] as const;

const NAV_SETTINGS = [
  { href: "/app/settings/profile", label: "Profile" },
  { href: "/app/settings/notifications", label: "Notifications" },
  { href: "/app/settings/billing", label: "Billing" },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 flex-col h-screen bg-bg border-r border-border sticky top-0">
      <div className="px-4 py-5 border-b border-border">
        <Link href="/app" aria-label="Stormline home" className="inline-flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG, no benefit from next/image */}
          <img
            src="/brand/logo.svg"
            alt="Stormline"
            width={360}
            height={72}
            className="h-6 w-auto select-none"
          />
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_MAIN.map((item) => (
          <NavLink key={item.href} href={item.href}>
            {item.label}
          </NavLink>
        ))}

        <div className="pt-5 pb-1 px-3">
          <span className="text-xs text-fg-muted uppercase tracking-wider font-medium">
            Settings
          </span>
        </div>

        {NAV_SETTINGS.map((item) => (
          <NavLink key={item.href} href={item.href}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 space-y-3">
        <Suspense
          fallback={
            <div className="h-20 rounded-[var(--radius-sm)] border border-border bg-bg-elev animate-pulse" />
          }
        >
          <TodayCard />
        </Suspense>

        <Suspense fallback={null}>
          <WatchlistModule />
        </Suspense>
      </div>

      <AskStormline />

      <div className="px-4 py-4 border-t border-border">
        <UserButton />
      </div>
    </aside>
  );
}
