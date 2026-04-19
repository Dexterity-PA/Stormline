'use client'

import { useState } from 'react'
import { SplitTextReveal } from '@/components/motion'

type SideContent = {
  kind: 'for' | 'not'
  eyebrow: string
  title: string
  body: string
  points: readonly string[]
}

const FOR: SideContent = {
  kind: 'for',
  eyebrow: 'Built for',
  title: 'Operators who make decisions every week.',
  body:
    'If you price, reprice, quote, purchase, or staff against a P&L that moves with the weather, the dollar, or Washington — Stormline is for you.',
  points: [
    '1–5 location independent restaurants ($800K–$8M revenue).',
    'Light construction & contractors ($2M–$30M revenue).',
    'Independent retail & regional operators ($1M–$20M revenue).',
    'Owner-operators, GMs, and fractional CFOs who need a Monday read.',
    'Anyone who would benefit from Bloomberg logic without the Bloomberg budget.',
  ],
}

const NOT_FOR: SideContent = {
  kind: 'not',
  eyebrow: 'Not built for',
  title: 'People who need financial advice.',
  body:
    'We produce intelligence, not advice. If you need to know what a trade is worth or what a security will do, Stormline is the wrong tool. That line isn’t a disclaimer — it’s the product.',
  points: [
    'Investment analysts, PMs, traders, or retail investors.',
    'Operators seeking tax, legal, or accounting advice.',
    'Enterprises (50+ locations) — your internal analytics team is the right stack.',
    'Anyone expecting "do X" recommendations. We frame in historical pattern.',
    'Industries outside food, construction, and retail — for now.',
  ],
}

export default function Section08WhoItsFor() {
  const [hover, setHover] = useState<'for' | 'not' | null>(null)

  const forFlex = hover === 'for' ? '1.5' : hover === 'not' ? '1' : '1.2'
  const notFlex = hover === 'not' ? '1.5' : hover === 'for' ? '1' : '1'

  return (
    <section
      data-section="8"
      className="relative isolate border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg)' }}
    >
      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-32">
        <div className="mb-14 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
            <span style={{ color: 'var(--sl-accent)' }}>08</span>
            <span>/</span>
            <span>Honest positioning</span>
          </div>
          <SplitTextReveal
            as="h2"
            mode="word"
            text="Who this is for — and who it isn’t."
            stagger={55}
            duration={900}
            className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
          />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            The fastest way to lose a customer is to sell them the wrong product. Here is the line, in writing.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <Side
            side={FOR}
            flex={forFlex}
            hovered={hover === 'for'}
            dimmed={hover === 'not'}
            onEnter={() => setHover('for')}
            onLeave={() => setHover(null)}
          />
          <Side
            side={NOT_FOR}
            flex={notFlex}
            hovered={hover === 'not'}
            dimmed={hover === 'for'}
            onEnter={() => setHover('not')}
            onLeave={() => setHover(null)}
          />
        </div>

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
          Intelligence, not advice · Stormline is not a registered investment adviser
        </p>
      </div>
    </section>
  )
}

function Side({
  side,
  flex,
  hovered,
  dimmed,
  onEnter,
  onLeave,
}: {
  side: SideContent
  flex: string
  hovered: boolean
  dimmed: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const isFor = side.kind === 'for'
  const accent = isFor ? 'var(--sl-accent)' : 'var(--sl-warn)'

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      tabIndex={0}
      style={{
        flex,
        transition: 'flex 500ms var(--sl-ease-out-expo), opacity 300ms',
        opacity: dimmed ? 0.55 : 1,
      }}
      className="group relative overflow-hidden rounded-[var(--sl-radius-lg)] border p-8 outline-none md:p-10 lg:p-12 lg:min-h-[520px]"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: isFor
            ? 'linear-gradient(180deg, color-mix(in oklab, var(--sl-accent) 3%, var(--sl-bg-elev)) 0%, var(--sl-bg-elev) 80%)'
            : 'linear-gradient(180deg, color-mix(in oklab, var(--sl-warn) 3%, var(--sl-bg)) 0%, var(--sl-bg) 80%)',
          transition: 'opacity 350ms',
          opacity: hovered ? 1 : 0.7,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-20 rounded-[inherit]"
        style={{ border: `1px solid ${accent}`, opacity: hovered ? 0.4 : 0 }}
      />

      <div
        className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em]"
        style={{ color: accent }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: accent }}
        />
        {side.eyebrow}
      </div>

      <h3 className="mb-5 font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-semibold leading-[1.1] tracking-tight text-fg">
        {side.title}
      </h3>
      <p className="mb-8 max-w-md text-[14.5px] leading-relaxed text-fg-muted">
        {side.body}
      </p>

      <ul className="space-y-3">
        {side.points.map((p, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[13.5px] leading-relaxed text-fg"
          >
            <span
              aria-hidden
              className="mt-[7px] inline-block h-[6px] w-[6px] shrink-0 rounded-full"
              style={{
                background: accent,
                opacity: 0.8,
              }}
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div
        className="pointer-events-none absolute right-6 top-6 font-mono text-[9px] uppercase tracking-[0.25em]"
        style={{ color: 'var(--sl-fg-dim)', opacity: hovered ? 0.8 : 0.4 }}
      >
        {isFor ? 'YES →' : '← NO'}
      </div>
    </div>
  )
}
