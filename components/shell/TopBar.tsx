'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const REGIONS = [
  { value: 'national', label: 'National' },
  { value: 'TX', label: 'Texas' },
  { value: 'CA', label: 'California' },
  { value: 'FL', label: 'Florida' },
  { value: 'NY', label: 'New York' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'CO', label: 'Colorado' },
  { value: 'GA', label: 'Georgia' },
  { value: 'IL', label: 'Illinois' },
  { value: 'OH', label: 'Ohio' },
] as const;

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const region = searchParams.get('region') ?? 'national';

  function handleRegionChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('region', value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-border bg-bg">
      {/* Spacer for mobile hamburger (rendered by MobileSidebar as fixed-position) */}
      <div className="w-8 md:hidden" />

      <div className="flex items-center gap-4 ml-auto">
        <span className="text-xs text-fg-muted">Region</span>
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1 focus:outline-none focus:border-accent"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-fg-muted hidden sm:block">
          Updated Apr 18, 2026 · 9:00 AM ET
        </span>
      </div>
    </header>
  );
}
