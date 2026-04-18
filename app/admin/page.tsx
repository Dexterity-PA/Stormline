import Link from 'next/link';

const STATS = [
  { label: 'Drafts Pending',     value: '3',  sub: 'briefings awaiting review',  color: 'text-warn',   href: '/admin/briefings'  },
  { label: 'Alerts in Queue',    value: '1',  sub: 'draft alert awaiting review', color: 'text-warn',   href: '/admin/alerts'     },
  { label: 'Indicators Tracked', value: '30', sub: 'across 3 industries',         color: 'text-accent', href: '/admin/indicators' },
  { label: 'Active Orgs',        value: '5',  sub: 'total organizations',         color: 'text-good',   href: '/admin/orgs'       },
];

const ACTIVITY = [
  { ts: '2026-04-13 22:18', msg: 'Briefing drafted: Retail Brief — Week of Apr 14',         actor: 'inngest/generate-weekly-briefings' },
  { ts: '2026-04-13 22:11', msg: 'Briefing drafted: Construction Brief — Week of Apr 14',   actor: 'inngest/generate-weekly-briefings' },
  { ts: '2026-04-13 22:04', msg: 'Briefing drafted: Restaurant Brief — Week of Apr 14',     actor: 'inngest/generate-weekly-briefings' },
  { ts: '2026-04-13 09:15', msg: 'Alert published: Beef Commodity Move >2σ',                actor: 'praneeth (admin)'                  },
  { ts: '2026-04-07 22:05', msg: 'Briefing published: Restaurant Brief — Week of Apr 7',    actor: 'praneeth (admin)'                  },
];

export default function AdminPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-display font-semibold text-fg">Overview</h1>
        <p className="text-sm text-fg-muted mt-1">
          Admin dashboard — mock data, no DB calls.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="block rounded-md border border-border bg-bg-elev p-4 hover:border-accent/40 transition-colors"
          >
            <p className={`text-3xl font-display font-semibold ${s.color}`}>
              {s.value}
            </p>
            <p className="mt-1 text-sm text-fg font-medium">{s.label}</p>
            <p className="mt-0.5 text-xs text-fg-muted">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-mono text-fg-muted uppercase tracking-wider mb-3">
          Recent Activity
        </h2>
        <div className="border border-border rounded-md divide-y divide-border">
          {ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-start gap-4 px-4 py-3">
              <span className="text-xs font-mono text-fg-muted shrink-0 pt-0.5 w-36">
                {item.ts}
              </span>
              <span className="text-sm text-fg flex-1">{item.msg}</span>
              <span className="text-xs font-mono text-fg-muted shrink-0">
                {item.actor}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-mono text-fg-muted uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/briefings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
          >
            Review 3 Drafts
          </Link>
          <Link
            href="/admin/briefings/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm border border-border text-fg-muted hover:text-fg hover:border-fg/30 transition-colors"
          >
            Trigger Generation
          </Link>
          <Link
            href="/admin/alerts"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-warn/10 text-warn border border-warn/30 hover:bg-warn/20 transition-colors"
          >
            Review Alert Draft
          </Link>
        </div>
      </div>
    </div>
  );
}
