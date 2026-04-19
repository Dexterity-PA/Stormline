// components/dashboard/SignalsRail.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getOrgByClerkId } from "@/lib/db/queries/organizations";
import { getLatestNewsItems } from "@/lib/db/queries/news";
import type { NewsItem } from "@/lib/db/queries/news";

function formatTimeAgo(date: Date): string {
  const diffH = Math.round((Date.now() - date.getTime()) / 36e5);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.round(diffH / 24)}d ago`;
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <div className="py-2.5 border-b border-border last:border-0">
      <Link
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <p className="text-xs text-fg leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {item.headline}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-fg-muted">
            {item.source.replace(/_/g, " ")}
          </span>
          {item.whyItMatters && (
            <>
              <span className="text-[10px] text-fg-dim">·</span>
              <span className="text-[10px] text-accent truncate">
                {item.whyItMatters}
              </span>
            </>
          )}
          <span className="text-[10px] text-fg-dim ml-auto flex-shrink-0">
            {formatTimeAgo(item.createdAt)}
          </span>
        </div>
      </Link>
    </div>
  );
}

export async function SignalsRail() {
  const { orgId } = await auth();
  if (!orgId) return null;

  const org = await getOrgByClerkId(orgId);
  if (!org) return null;

  const items = await getLatestNewsItems(org.industry, 8);

  return (
    <aside aria-label="Industry signals" className="px-4 py-5 h-full">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-display font-semibold text-fg">Signals</h2>
        <span className="text-[10px] uppercase tracking-wider text-fg-muted">
          {org.industry}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-fg-muted px-3 py-3 rounded-[var(--radius-sm)] border border-dashed border-border">
          No news items yet. First fetch runs at 5am UTC.
        </p>
      ) : (
        <div>
          {items.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </aside>
  );
}
