'use client';

import { useState } from 'react';
import { BriefingCard } from './BriefingCard';
import type { BriefingCardData } from './BriefingCard';

type FilterIndustry = 'all' | 'restaurant' | 'construction' | 'retail';

const FILTER_OPTIONS: { value: FilterIndustry; label: string }[] = [
  { value: 'all', label: 'All industries' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'construction', label: 'Construction' },
  { value: 'retail', label: 'Retail' },
];

export function BriefingListFilter({
  briefings,
}: {
  briefings: BriefingCardData[];
}) {
  const [filter, setFilter] = useState<FilterIndustry>('all');

  const filtered =
    filter === 'all'
      ? briefings
      : briefings.filter((b) => b.industry === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors ${
              filter === opt.value
                ? 'bg-accent/10 text-accent font-medium border border-accent/20'
                : 'text-fg-muted hover:text-fg hover:bg-bg-elev border border-transparent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-fg-muted text-sm py-8 text-center">
          No briefings match this filter.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BriefingCard key={b.id} briefing={b} />
          ))}
        </div>
      )}
    </div>
  );
}
