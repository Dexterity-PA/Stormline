'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: 'Overview',   href: '/admin',             exact: true,  badge: null },
  { label: 'Briefings',  href: '/admin/briefings',   exact: false, badge: 3    },
  { label: 'Alerts',     href: '/admin/alerts',      exact: false, badge: 1    },
  { label: 'Indicators', href: '/admin/indicators',  exact: false, badge: null },
  { label: 'Orgs',       href: '/admin/orgs',        exact: false, badge: null },
  { label: 'Prompts',    href: '/admin/prompts',     exact: false, badge: null },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="w-56 shrink-0 border-r border-border bg-bg-elev flex flex-col"
      aria-label="Admin navigation"
    >
      <div className="px-4 py-3 border-b border-border">
        <span className="text-xs font-mono text-fg-muted tracking-widest uppercase select-none">
          Admin Shell
        </span>
      </div>

      <ul className="flex-1 py-2">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  'flex items-center justify-between px-4 py-2 text-sm transition-colors',
                  active
                    ? 'text-fg bg-accent/10 border-r-2 border-accent font-medium'
                    : 'text-fg-muted hover:text-fg hover:bg-fg/5',
                ].join(' ')}
              >
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded-sm bg-warn/20 text-warn">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-4 py-3 border-t border-border">
        <span className="text-xs font-mono text-fg-muted/50">v0.1.0-alpha</span>
      </div>
    </nav>
  );
}
