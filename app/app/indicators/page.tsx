import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { INDICATOR_REGISTRY } from '@/lib/indicators/registry';

type FilterIndustry = 'all' | 'restaurant' | 'construction' | 'retail';

const INDUSTRY_FILTER_OPTIONS: { value: FilterIndustry; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'construction', label: 'Construction' },
  { value: 'retail', label: 'Retail' },
];

interface PageProps {
  searchParams: Promise<{ industry?: string }>;
}

export default async function IndicatorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = (params.industry ?? 'all') as FilterIndustry;

  const filtered =
    filter === 'all'
      ? INDICATOR_REGISTRY
      : INDICATOR_REGISTRY.filter((ind) =>
          ind.industryTags.includes(filter as Exclude<FilterIndustry, 'all'>),
        );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">
          Indicator Library
        </h1>
        <p className="text-sm text-fg-muted mt-0.5">
          {INDICATOR_REGISTRY.length} indicators across macro, industry, and
          regional data sources.
        </p>
      </div>

      {/* Filter — link-based, no JS */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {INDUSTRY_FILTER_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value === 'all' ? '/app/indicators' : `/app/indicators?industry=${opt.value}`}
            className={`px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors ${
              filter === opt.value
                ? 'bg-accent/10 text-accent font-medium border border-accent/20'
                : 'text-fg-muted hover:text-fg hover:bg-bg-elev border border-transparent'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="border border-border rounded-[var(--radius-md)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="text-left px-4 py-3 text-xs font-medium text-fg-muted uppercase tracking-wider">
                Indicator
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-fg-muted uppercase tracking-wider hidden sm:table-cell">
                Source
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-fg-muted uppercase tracking-wider hidden md:table-cell">
                Frequency
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-fg-muted uppercase tracking-wider">
                Industries
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((ind) => (
              <tr
                key={ind.code}
                className="hover:bg-bg-elev transition-colors group"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/app/indicators/${encodeURIComponent(ind.code)}`}
                    className="text-fg group-hover:text-accent transition-colors font-medium"
                  >
                    {ind.name}
                  </Link>
                  <p className="text-xs text-fg-muted mt-0.5">{ind.code}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-fg-muted uppercase text-xs font-mono">
                    {ind.source}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-fg-muted text-xs capitalize">
                    {ind.frequency}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {ind.industryTags.map((tag) => (
                      <Badge key={tag} variant="industry" label={tag} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-fg-muted">
        Data sourced from FRED (Federal Reserve), EIA, USDA, BLS, and NHC.
        All indicators reflect publicly available data.
      </p>
    </div>
  );
}
