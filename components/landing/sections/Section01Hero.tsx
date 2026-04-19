'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import GlobeFallback from '../hero/GlobeFallback'

const HeroGlobe = dynamic(() => import('../hero/HeroGlobe'), {
  ssr: false,
  loading: () => <GlobeFallback />,
})

type Tile = {
  label: string
  value: string
  delta: string
  deltaTone: 'pos' | 'neg' | 'warn'
  position: string
}

const TILES: Tile[] = [
  {
    label: 'WTI Crude',
    value: '$82.40',
    delta: '+1.8%',
    deltaTone: 'warn',
    position: 'left-6 top-6',
  },
  {
    label: 'S&P 500',
    value: '5,214.08',
    delta: '+0.3%',
    deltaTone: 'pos',
    position: 'left-6 bottom-6',
  },
  {
    label: 'DXY',
    value: '104.22',
    delta: '-0.1%',
    deltaTone: 'neg',
    position: 'right-6 bottom-6',
  },
]

function toneColor(tone: Tile['deltaTone']) {
  if (tone === 'pos') return 'var(--sl-ok)'
  if (tone === 'neg') return 'var(--sl-fg-muted)'
  return 'var(--sl-warn)'
}

function MarketTile({ tile }: { tile: Tile }) {
  return (
    <div
      className={`pointer-events-none absolute z-10 ${tile.position} rounded-md border px-3 py-2 font-mono`}
      style={{
        borderColor: 'var(--sl-border)',
        background: 'var(--sl-surface-glass)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-fg-dim">
        {tile.label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="text-sm font-semibold text-fg">{tile.value}</span>
        <span
          className="text-[11px]"
          style={{ color: toneColor(tile.deltaTone) }}
        >
          {tile.delta}
        </span>
      </div>
    </div>
  )
}

function LiveDisruptions() {
  return (
    <div
      className="pointer-events-none absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-mono"
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

      <LiveDisruptions />
      {TILES.map((t) => (
        <MarketTile key={t.label} tile={t} />
      ))}

      {/* Globe layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative aspect-square w-full max-w-[min(920px,100vmin)] translate-y-[6%] opacity-0"
          style={{
            animation:
              'sl-reveal-up 1200ms var(--sl-ease-out-expo) 200ms forwards',
          }}
        >
          <HeroGlobe />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] opacity-0"
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
          className="max-w-4xl font-display text-[clamp(2rem,4.5vw,4.25rem)] font-semibold leading-[1.0] tracking-[-0.02em] text-fg text-balance opacity-0"
          style={{
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
    </section>
  )
}
