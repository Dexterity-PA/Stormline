import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-admin';
import { listBriefings } from '@/lib/db/queries/briefings';
import { ReviewQueue, type QueueBriefing } from '@/components/admin/ReviewQueue';
import { Badge } from '@/components/admin/Badge';
import { industryEnum, briefingStatusEnum } from '@/lib/db/schema';

type SearchParams = {
  industry?: string;
  region?: string;
  status?: string;
};

export default async function BriefingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const sp = await searchParams;

  const validIndustry = (v: unknown): v is (typeof industryEnum.enumValues)[number] =>
    typeof v === 'string' && (industryEnum.enumValues as readonly string[]).includes(v);
  const validStatus = (v: unknown): v is (typeof briefingStatusEnum.enumValues)[number] =>
    typeof v === 'string' && (briefingStatusEnum.enumValues as readonly string[]).includes(v);

  const industry = validIndustry(sp.industry) ? sp.industry : undefined;
  const status = validStatus(sp.status) ? sp.status : undefined;
  const regionState = typeof sp.region === 'string' && sp.region.length === 2
    ? sp.region.toUpperCase()
    : undefined;

  const { data: briefings } = await listBriefings({
    industry,
    regionState,
    status,
    limit: 50,
  });

  const toQueueItem = (b: (typeof briefings)[number]): QueueBriefing => ({
    id: b.id,
    title: `${b.industry.charAt(0).toUpperCase() + b.industry.slice(1)} Brief — Week of ${b.weekStart}`,
    industry: b.industry,
    region: b.regionState ?? b.regionMetro ?? 'National',
    status: b.status as QueueBriefing['status'],
    generated_by: b.generatedBy,
    created_at: b.createdAt.toISOString().replace('T', ' ').slice(0, 16),
  });

  const drafts = briefings.filter((b) => b.status === 'draft').map(toQueueItem);
  const published = briefings.filter((b) => b.status === 'published').map(toQueueItem);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-semibold text-fg">
            Briefing Review Queue
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Human-in-loop required. No briefing auto-publishes.
          </p>
        </div>
        <Link
          href="/admin/briefings/new"
          className="px-4 py-2 rounded-md text-sm border border-border text-fg-muted hover:text-fg hover:border-fg/30 transition-colors"
        >
          + Trigger Generation
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap items-center gap-3 text-sm">
        <select
          name="industry"
          defaultValue={industry ?? ''}
          className="px-3 py-1.5 rounded-sm bg-bg border border-border text-fg text-sm"
        >
          <option value="">All industries</option>
          {industryEnum.enumValues.map((i) => (
            <option key={i} value={i}>
              {i.charAt(0).toUpperCase() + i.slice(1)}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={status ?? ''}
          className="px-3 py-1.5 rounded-sm bg-bg border border-border text-fg text-sm"
        >
          <option value="">All statuses</option>
          {briefingStatusEnum.enumValues.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <input
          name="region"
          defaultValue={regionState ?? ''}
          placeholder="State (e.g. TX)"
          maxLength={2}
          className="w-28 px-3 py-1.5 rounded-sm bg-bg border border-border text-fg text-sm placeholder:text-fg-muted"
        />

        <button
          type="submit"
          className="px-3 py-1.5 rounded-sm text-sm border border-border text-fg-muted hover:text-fg hover:border-fg/30 transition-colors"
        >
          Filter
        </button>

        {(industry ?? status ?? regionState) && (
          <Link
            href="/admin/briefings"
            className="text-xs text-fg-muted hover:text-fg transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-mono text-fg-muted uppercase tracking-wider">
            Awaiting Review
          </h2>
          <Badge variant="draft">{drafts.length} draft</Badge>
        </div>
        <ReviewQueue items={drafts} />
      </div>

      <div>
        <h2 className="text-sm font-mono text-fg-muted uppercase tracking-wider mb-3">
          Recently Published
        </h2>
        <ReviewQueue items={published} />
      </div>
    </div>
  );
}
