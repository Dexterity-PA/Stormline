'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NavLink } from './NavLink';

const NAV_MAIN = [
  { href: '/app', label: 'Dashboard' },
  { href: '/app/briefings', label: 'Briefings' },
  { href: '/app/alerts', label: 'Alerts' },
  { href: '/app/indicators', label: 'Indicators' },
] as const;

const NAV_SETTINGS = [
  { href: '/app/settings/profile', label: 'Profile' },
  { href: '/app/settings/notifications', label: 'Notifications' },
  { href: '/app/settings/billing', label: 'Billing' },
] as const;

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger trigger — fixed top-left, mobile only */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-4 z-50 p-1.5 rounded-[var(--radius-sm)] text-fg-muted hover:text-fg hover:bg-bg-elev transition-colors"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect y="2" width="18" height="2" rx="1" />
          <rect y="8" width="18" height="2" rx="1" />
          <rect y="14" width="18" height="2" rx="1" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-bg border-r border-border flex flex-col transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          <Link
            href="/app"
            aria-label="Stormline home"
            className="inline-flex items-center"
            onClick={() => setOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG, no benefit from next/image */}
            <img
              src="/brand/logo.svg"
              alt="Stormline"
              width={360}
              height={72}
              className="h-6 w-auto select-none"
            />
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="p-1 text-fg-muted hover:text-fg transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.293 3.293a1 1 0 011.414 0L8 6.586l3.293-3.293a1 1 0 111.414 1.414L9.414 8l3.293 3.293a1 1 0 01-1.414 1.414L8 9.414l-3.293 3.293a1 1 0 01-1.414-1.414L6.586 8 3.293 4.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <nav
          className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
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
      </div>
    </>
  );
}
