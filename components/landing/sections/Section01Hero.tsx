'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MagneticButton, SplitTextReveal, CursorSpotlight, ParallaxLayer } from '@/components/motion'
import GlobeFallback from '../hero/GlobeFallback'

const HeroGlobe = dynamic(() => import('../hero/HeroGlobe'), {
  ssr: false,
  loading: () => <GlobeFallback />,
})

function ScrollHint() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2"
    >
      <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-fg-dim">
        <span>Scroll</span>
        <svg
          width="12"
          height="28"
          viewBox="0 0 12 28"
          fill="none"
          style={{ animation: 'sl-drift 2.4s var(--sl-ease-in-out) infinite' }}
        >
          <rect
            x="1"
            y="1"
            width="10"
            height="20"
            rx="5"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="6" cy="7" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

function ActiveMarkerCount() {
  return (
    <div className="pointer-events-none absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-mono"
      style={{
        borderColor: 'var(--sl-border)',
        background: 'var(--sl-surface-glass)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ background: 'var(--sl-crit)' }}
        />
        <span
          className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--sl-crit)' }}
        />
      </span>
      <span className="text-fg-muted">Live · 8 active disruptions</span>
    </div>
  )
}

export default function Section01Hero() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 50)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section
      data-section="1"
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top, color-mix(in srgb, var(--sl-accent) 8%, transparent) 0%, var(--sl-bg-0) 55%), var(--sl-bg)',
      }}
    >
      <CursorSpotlight radius={500} />
      <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-60" />
      <div className="sl-noise" />

      <ActiveMarkerCount />

      {/* Globe layer — padded so the full sphere is always visible */}
      <ParallaxLayer
        speed={0.3}
        max={16}
        className="absolute inset-0 flex items-center justify-center px-[120px] py-20"
      >
        <div
          className="relative aspect-square w-full max-w-[min(780px,calc(100vmin-160px))] opacity-0"
          style={{
            animation: ready
              ? 'sl-reveal-up 1600ms var(--sl-ease-out-expo) 400ms forwards'
              : undefined,
          }}
        >
          <HeroGlobe />
        </div>
      </ParallaxLayer>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em]"
          style={{
            borderColor: 'var(--sl-border)',
            background: 'var(--sl-surface-glass)',
            color: 'var(--sl-fg-muted)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span
            className="inline-block h-1 w-1 rounded-full"
            style={{ background: 'var(--sl-accent)' }}
          />
          Macro intelligence · operator language
        </div>

        <SplitTextReveal
          as="h1"
          trigger="mount"
          mode="word"
          stagger={60}
          duration={1000}
          text="The world is moving. Your P&L hasn’t caught up."
          className="max-w-4xl font-display text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-fg"
        />

        <SplitTextReveal
          as="p"
          trigger="mount"
          mode="word"
          stagger={20}
          delay={900}
          duration={800}
          text="Macro intelligence, translated into operator language, for the 6 million businesses without a CFO."
          className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg"
        />

        <div
          className="mt-10 flex flex-wrap items-center gap-3 opacity-0"
          style={{
            animation: ready
              ? 'sl-reveal-up 900ms var(--sl-ease-out-expo) 1400ms forwards'
              : undefined,
          }}
        >
          <MagneticButton href="/sign-up" variant="primary" glow>
            Start 14-day trial
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <Link
            href="#sample-briefing"
            className="inline-flex items-center gap-2 rounded-[var(--sl-radius-md)] px-6 py-3 text-sm font-medium text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-accent)]"
          >
            See a sample briefing
            <span aria-hidden>↓</span>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-dim">
          <span>FRED · BLS · EIA · USDA</span>
          <span aria-hidden>•</span>
          <span>44 indicators tracked</span>
          <span aria-hidden>•</span>
          <span>Intelligence, not advice</span>
        </div>
      </div>

      <ScrollHint />
    </section>
  )
}
