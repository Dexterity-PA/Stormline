'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import GlobeFallback from '../hero/GlobeFallback'

const HeroGlobe = dynamic(() => import('../hero/HeroGlobe'), {
  ssr: false,
  loading: () => <GlobeFallback />,
})

export default function Section01Hero() {
  return (
    <section
      data-section="1"
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top, color-mix(in srgb, var(--sl-accent) 8%, transparent) 0%, var(--sl-bg-0) 55%), var(--sl-bg)',
      }}
    >
      <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-60" />
      <div className="sl-noise" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 px-8 py-28 md:py-36 lg:grid-cols-2 lg:gap-16">
        {/* Left column — text */}
        <div className="min-w-0">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] opacity-0"
            style={{
              borderColor: 'var(--sl-border)',
              background: 'var(--sl-surface-glass)',
              color: 'var(--sl-fg-muted)',
              backdropFilter: 'blur(10px)',
              animation:
                'sl-reveal-up 700ms var(--sl-ease-out-expo) 100ms forwards',
            }}
          >
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: 'var(--sl-accent)' }}
            />
            Macro intelligence · operator language
          </div>

          <h1
            className="font-display font-semibold leading-[1.0] tracking-[-0.02em] text-fg text-balance opacity-0"
            style={{
              fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
              animation:
                'sl-reveal-up 900ms var(--sl-ease-out-expo) 250ms forwards',
            }}
          >
            The world is moving. Your P&amp;L hasn’t caught up.
          </h1>

          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg opacity-0"
            style={{
              animation:
                'sl-reveal-up 900ms var(--sl-ease-out-expo) 450ms forwards',
            }}
          >
            Macro intelligence, translated into operator language, for the 6 million
            businesses without a CFO.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-3 opacity-0"
            style={{
              animation:
                'sl-reveal-up 900ms var(--sl-ease-out-expo) 650ms forwards',
            }}
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-[var(--sl-radius-md)] px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-accent)]"
              style={{
                background: 'var(--sl-accent)',
                color: 'var(--sl-bg)',
              }}
            >
              Start 14-day trial
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="#sample-briefing"
              className="inline-flex items-center gap-2 rounded-[var(--sl-radius-md)] px-6 py-3 text-sm font-medium text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-accent)]"
            >
              See a sample briefing
              <span aria-hidden>↓</span>
            </Link>
          </div>

          <div
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-dim opacity-0"
            style={{
              animation:
                'sl-reveal-up 900ms var(--sl-ease-out-expo) 850ms forwards',
            }}
          >
            <span>FRED · BLS · EIA · USDA</span>
            <span aria-hidden>•</span>
            <span>44 indicators tracked</span>
            <span aria-hidden>•</span>
            <span>Intelligence, not advice</span>
          </div>
        </div>

        {/* Right column — globe */}
        <div className="relative flex min-w-0 items-center justify-center">
          <div
            className="relative aspect-square w-full max-w-[560px] overflow-hidden rounded-full opacity-0"
            style={{
              border: '1px solid var(--sl-border)',
              animation:
                'sl-reveal-up 1200ms var(--sl-ease-out-expo) 200ms forwards',
            }}
          >
            <HeroGlobe />
          </div>
        </div>
      </div>
    </section>
  )
}
