'use client'

import { NumberRoll } from '@/components/motion'

type Stat = {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  label: string
  sub: string
}

const STATS: readonly Stat[] = [
  {
    value: 44,
    label: 'Canonical indicators',
    sub: 'Across cost, demand, rate, FX',
  },
  {
    value: 3,
    label: 'Industries tuned',
    sub: 'Restaurants · Construction · Retail',
  },
  {
    value: 199,
    prefix: '$',
    label: 'Starting price · monthly',
    sub: 'Core plan · one industry · weekly briefing',
  },
  {
    value: 14,
    suffix: ' days',
    label: 'Free trial',
    sub: 'Full access · no card · cancel any time',
  },
]

export default function Section10StatsBand() {
  return (
    <section
      data-section="10"
      className="relative isolate overflow-hidden border-y"
      style={{
        borderColor: 'var(--sl-border)',
        background:
          'radial-gradient(70% 120% at 50% 0%, color-mix(in oklab, var(--sl-accent) 8%, transparent), transparent 60%), var(--sl-bg)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--sl-accent) 50%, transparent 100%)',
          opacity: 0.6,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--sl-accent) 50%, transparent 100%)',
          opacity: 0.4,
        }}
      />

      <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28">
        <div className="mb-12 flex items-center justify-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.3em] text-fg-dim">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: 'var(--sl-accent)' }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: 'var(--sl-accent)' }}
            />
          </span>
          Stormline by the numbers
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 lg:grid-cols-4 lg:gap-8">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="group relative flex flex-col items-start"
              style={{ animation: 'sl-reveal-up 800ms var(--sl-ease-out-expo) both', animationDelay: `${i * 90}ms` }}
            >
              <NumberRoll
                value={s.value}
                prefix={s.prefix ?? ''}
                suffix={s.suffix ?? ''}
                decimals={s.decimals ?? 0}
                duration={1800}
                className="block whitespace-nowrap font-display text-[clamp(2.6rem,5.4vw,4.6rem)] font-semibold leading-none tracking-[-0.03em] text-fg"
              />
              <div
                className="mt-4 h-px w-10 transition-all duration-500 group-hover:w-16"
                style={{ background: 'var(--sl-accent)' }}
              />
              <div className="mt-4 font-display text-[15px] font-semibold text-fg">
                {s.label}
              </div>
              <div className="mt-1 text-[12.5px] text-fg-muted">{s.sub}</div>
            </div>
          ))}
        </div>

        <p className="mt-16 text-center text-sm text-fg-muted">
          Intelligence, not advice. Every claim linked to its primary source.
        </p>
      </div>
    </section>
  )
}
