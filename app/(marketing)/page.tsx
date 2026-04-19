import type { Metadata } from 'next'
import Link from 'next/link'
import Hero from '@/components/marketing/Hero'
import Pillars from '@/components/marketing/Pillars'

export const metadata: Metadata = {
  title: 'Stormline — Macro Intelligence for Operators',
  description:
    'Weekly operational briefings, input price dashboards, and event alerts — tuned for restaurants, contractors, and independent retailers.',
}

const INDUSTRIES = [
  {
    slug: 'restaurants',
    label: 'Restaurants',
    description:
      'Beef, poultry, cooking oil, produce index, labor cost, and regional discretionary spend — tracked weekly, framed for operators.',
    signals: ['Wholesale beef & protein costs', 'Labor wage index (BLS)', 'Regional discretionary spend'],
  },
  {
    slug: 'construction',
    label: 'Light Construction',
    description:
      'Lumber, steel, copper, PVC, diesel, skilled labor wage index, housing starts, mortgage rates — the full input cost picture for residential remodelers.',
    signals: ['Lumber & steel prices', 'Diesel fuel index (EIA)', 'Housing permits (Census)'],
  },
  {
    slug: 'retail',
    label: 'Independent Retail',
    description:
      'Cotton index, freight rates, foot traffic proxy, consumer sentiment, and credit card delinquency — the macro signals behind store-level margins.',
    signals: ['Freight & import cost index', 'Consumer sentiment (FRED)', 'Credit delinquency rate'],
  },
] as const

export default function LandingPage() {
  return (
    <main style={{ background: 'var(--sl-bg)' }}>
      <Hero />
      <Pillars />

      {/* Industries preview */}
      <section className="border-b border-border" style={{ background: 'var(--sl-bg-elev)' }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold text-fg md:text-3xl">
            Built for your industry
          </h2>
          <p className="mt-3 max-w-xl text-fg-muted">
            Historical patterns indicate each industry responds differently to the same macro signal.
            Stormline&rsquo;s signal maps are tuned per vertical.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {INDUSTRIES.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industries/${ind.slug}`}
                className="group rounded-lg border border-border p-6 transition-colors hover:border-accent"
                style={{ background: 'var(--sl-bg)' }}
              >
                <h3 className="font-display text-base font-semibold text-fg">
                  {ind.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {ind.description}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {ind.signals.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-xs text-fg-muted">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden={true} />
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs font-medium text-accent transition-opacity group-hover:opacity-75">
                  View signal map →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="border-b border-border bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold text-fg md:text-3xl">
            What operators are saying
          </h2>
          {/* TODO: Replace with real operator testimonials before launch */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {(['restaurant', 'contractor', 'retailer'] as const).map((role) => (
              <div
                key={role}
                className="rounded-lg border border-border p-6"
                style={{ background: 'var(--sl-bg-elev)' }}
              >
                <p className="text-sm italic leading-relaxed text-fg-muted">
                  &ldquo;[Testimonial placeholder — replace with real operator quote before launch.]&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full border border-border bg-bg" />
                  <div>
                    <p className="text-sm font-medium text-fg">Operator Name</p>
                    <p className="text-xs text-fg-muted capitalize">{role} · City, State</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-semibold text-fg md:text-4xl">
            Start reading the signals.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-fg-muted">
            Historical data suggests operators who act on macro trends early preserve
            margin. Stormline delivers that context every Monday.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Start free — 14-day trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-border px-6 py-3 text-sm font-medium text-fg-muted transition-colors hover:border-accent hover:text-fg"
            >
              Compare plans
            </Link>
          </div>
          <p className="mt-3 text-xs text-fg-muted">No credit card required.</p>
        </div>
      </section>
    </main>
  )
}
