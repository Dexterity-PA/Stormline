'use client'

import { MagneticButton, SplitTextReveal } from '@/components/motion'

export default function Section13FinalCTA() {
  return (
    <section
      data-section="13"
      className="relative isolate overflow-hidden border-t"
      style={{
        borderColor: 'var(--sl-border)',
        background:
          'radial-gradient(60% 80% at 50% 100%, color-mix(in oklab, var(--sl-accent) 12%, transparent), transparent 70%), var(--sl-bg)',
      }}
    >
      <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-40" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--sl-border-strong) 30%, var(--sl-border-strong) 70%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-32 text-center sm:py-40">
        <div className="mb-6 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-fg-dim">
          <span className="relative flex h-1.5 w-1.5" aria-hidden>
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: 'var(--sl-accent)' }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--sl-accent)' }}
            />
          </span>
          <span>13 · Start</span>
        </div>

        <SplitTextReveal
          as="h2"
          mode="word"
          text="Stop running your business blind."
          stagger={70}
          duration={1100}
          className="mx-auto max-w-4xl font-display text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-fg"
        />

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
          The world is moving. Your P&amp;L is about to catch up. See what the
          indicators say before the invoice arrives.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <MagneticButton
            href="/sign-up"
            variant="primary"
            className="text-sm md:text-[15px]"
            glow
          >
            Start 14-day trial
            <span aria-hidden className="ml-2">
              →
            </span>
          </MagneticButton>

          <MagneticButton href="/industries/restaurants" variant="ghost" className="text-sm">
            See a sample briefing
          </MagneticButton>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 border-t pt-10 text-center sm:grid-cols-3"
          style={{ borderColor: 'var(--sl-border)' }}
        >
          <Reassure
            title="No card required"
            body="14 days of full access. Put in a card only if you decide to stay."
          />
          <Reassure
            title="No contracts"
            body="Monthly billing. One click to cancel. Keep access through the period."
          />
          <Reassure
            title="No advice"
            body="Intelligence framed in historical pattern. You stay in the decision seat."
          />
        </div>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-fg-dim">
          Mon · 6:00am local · Your first briefing after signup
        </p>
      </div>
    </section>
  )
}

function Reassure({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg">
        <span
          className="inline-block h-1 w-1 rounded-full"
          style={{ background: 'var(--sl-accent)' }}
        />
        {title}
      </div>
      <p className="max-w-[32ch] text-[12.5px] leading-relaxed text-fg-muted">
        {body}
      </p>
    </div>
  )
}
