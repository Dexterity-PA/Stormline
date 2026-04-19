import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getBriefingById } from '@/lib/db/queries/briefings';
import { Badge, type BadgeVariant } from '@/components/admin/Badge';
import { BriefingEditor } from '@/components/admin/BriefingEditor';

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const briefing = await getBriefingById(id);
  if (!briefing) notFound();

  const title = `${briefing.industry.charAt(0).toUpperCase() + briefing.industry.slice(1)} Brief — Week of ${briefing.weekStart}`;
  const region = briefing.regionState ?? briefing.regionMetro ?? 'National';
  const createdAt = briefing.createdAt.toISOString().replace('T', ' ').slice(0, 16);

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 border-b border-border px-6 py-4 bg-bg-elev flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/briefings"
            className="text-xs text-fg-muted hover:text-fg transition-colors shrink-0"
          >
            ← Briefings
          </Link>
          <span className="text-fg-muted text-xs">/</span>
          <span className="text-sm font-medium text-fg truncate">{title}</span>
          {region !== 'National' && (
            <span className="text-xs text-fg-muted font-mono shrink-0">[{region}]</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Badge variant={briefing.status as BadgeVariant}>{briefing.status}</Badge>
          <span className="text-xs font-mono text-fg-muted">{briefing.generatedBy}</span>
          <span className="text-xs text-fg-muted">{createdAt}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <BriefingEditor
          id={briefing.id}
          initialContent={briefing.bodyMd}
          isPublished={briefing.status === 'published'}
        />
      </div>
    </div>
  );
}
