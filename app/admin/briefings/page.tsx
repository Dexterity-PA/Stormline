import Link from 'next/link';
import { ReviewQueue, type QueueBriefing } from '@/components/admin/ReviewQueue';
import { Badge } from '@/components/admin/Badge';

const BRIEFINGS: QueueBriefing[] = [
  {
    id: 'b-2026-04-14-restaurant',
    title: 'Restaurant Brief — Week of Apr 14, 2026',
    industry: 'restaurant',
    region: 'National',
    status: 'draft',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-13 22:04',
  },
  {
    id: 'b-2026-04-14-construction',
    title: 'Construction Brief — Week of Apr 14, 2026',
    industry: 'construction',
    region: 'National',
    status: 'draft',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-13 22:11',
  },
  {
    id: 'b-2026-04-14-retail',
    title: 'Retail Brief — Week of Apr 14, 2026',
    industry: 'retail',
    region: 'National',
    status: 'draft',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-13 22:18',
  },
  {
    id: 'b-2026-04-07-restaurant',
    title: 'Restaurant Brief — Week of Apr 7, 2026',
    industry: 'restaurant',
    region: 'National',
    status: 'published',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-06 22:01',
  },
  {
    id: 'b-2026-04-07-construction',
    title: 'Construction Brief — Week of Apr 7, 2026',
    industry: 'construction',
    region: 'National',
    status: 'published',
    generated_by: 'claude-sonnet-4@prompt-v1.2',
    created_at: '2026-04-06 22:08',
  },
];

const drafts = BRIEFINGS.filter((b) => b.status === 'draft');
const published = BRIEFINGS.filter((b) => b.status !== 'draft');

export default function BriefingsPage() {
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
