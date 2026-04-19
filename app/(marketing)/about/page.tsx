import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Stormline',
  description:
    "The signal gap between a Fortune 500 CFO and a 30-person business owner is not intelligence — it's signal density.",
}

export default function AboutPage() {
  return (
    <main style={{ background: 'var(--sl-bg)' }}>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="mb-4 text-xs font-mono font-semibold uppercase tracking-widest text-accent">
          About
        </p>
        <h1 className="font-display text-3xl font-semibold text-fg md:text-4xl">
          The signal gap
        </h1>

        <div className="mt-10 space-y-6 text-base leading-relaxed text-fg-muted">
          <p>
            A Fortune 500 CFO monitors macro conditions daily — commodity futures, regional credit
            conditions, demand signals — and translates them into operating decisions before they
            appear in a P&amp;L. A 20-person restaurant owner sees them three months later in food
            cost percentages.
          </p>
          <p>
            Historical patterns indicate this gap is not intelligence. It is signal density.
            Institutional tools have been priced and designed for institutional teams. The
            underlying data — FRED, EIA, USDA, BLS — is public, updated daily, and directly
            relevant to every operator who buys beef, diesel, or lumber.
          </p>
          <p>
            Stormline closes the signal gap. Weekly briefings, pre-configured dashboards, and
            real-time event alerts — built around the specific cost buckets that move the margins
            of restaurants, contractors, and independent retailers.
          </p>
          <p>
            Every piece of output is framed as historical pattern and market trend. Stormline is
            market intelligence, not advice.
          </p>
        </div>

        {/* Team */}
        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold text-fg">Team</h2>
          <div className="mt-6">
            <div
              className="flex items-center gap-4 rounded-lg border border-border p-5"
              style={{ background: 'var(--sl-bg-elev)' }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border">
                <span className="font-mono text-xs text-fg-muted">PA</span>
              </div>
              <div>
                <p className="font-medium text-fg">Praneeth Annapureddy</p>
                <p className="text-sm text-fg-muted">Founder</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission statement */}
        <div
          className="mt-16 rounded-lg border border-border p-6"
          style={{ background: 'var(--sl-bg-elev)' }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
            Mission
          </p>
          <p className="text-sm leading-relaxed text-fg-muted">
            Bloomberg Terminal logic, translated into operating decisions, for the 6 million
            US businesses that can&rsquo;t afford a CFO.
          </p>
        </div>
      </div>
    </main>
  )
}
