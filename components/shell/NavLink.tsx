'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  // Exact match for /app dashboard; prefix match for all other routes
  const isActive =
    href === '/app' ? pathname === '/app' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-colors ${
        isActive
          ? 'bg-accent/10 text-accent font-medium'
          : 'text-fg-muted hover:text-fg hover:bg-bg-elev'
      }`}
    >
      {children}
    </Link>
  );
}
