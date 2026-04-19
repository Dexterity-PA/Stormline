'use client'

import { useState } from 'react'
import { SplitTextReveal } from '@/components/motion'

type QA = {
  num: string
  q: string
  a: string
}

const QAS: readonly QA[] = [
  {
    num: '01',
    q: 'Is Stormline an investment service?',
    a: 'No. Stormline is an intelligence product, not an investment adviser, broker, or research firm. We do not issue buy/sell recommendations on any security, commodity, or asset. We surface public macro data with operator-relevant context. If you are looking to make investment decisions, this is the wrong tool.',
  },
  {
    num: '02',
    q: 'How is this different from Bloomberg, Cube, or QuickBooks?',
    a: 'Bloomberg is a data firehose priced for institutions. Cube is FP&A software for CFOs. QuickBooks is bookkeeping. Rosenberg is macro commentary for institutional investors. Stormline is an operator-tuned briefing and dashboard for SMBs in three specific industries. None of the above occupy this seat.',
  },
  {
    num: '03',
    q: 'What’s actually in the Monday briefing?',
    a: 'A 600\u2013900 word analyst-written read on the inputs, demand signals, and macro shifts that touched your industry last week, framed in historical pattern. Every non-trivial claim links to its primary source. Human editor reviews every briefing \u2014 no auto-publish.',
  },
  {
    num: '04',
    q: 'Which industries do you cover?',
    a: 'Three tracks at launch: independent restaurants (1\u20135 locations), light construction and contractors ($2M\u2013$30M), and independent retail ($1M\u2013$20M). Each track has its own indicator registry, briefing format, and alert thresholds.',
  },
  {
    num: '05',
    q: 'Where does the data come from?',
    a: 'Primary public sources: FRED, EIA, USDA AMS, BLS, Census, OpenTable, ICE BofA, and Federal Reserve G.19. No resold newsletters, no proprietary indices, no black boxes. Every series has a link in the briefing footnotes.',
  },
  {
    num: '06',
    q: 'How often is the dashboard updated?',
    a: 'Hourly for market-priced series (beef, lumber, diesel, steel). Daily for macro series where daily is the native cadence. Weekly or monthly for series published at that cadence (housing starts, sentiment, etc.). Every tile shows the freshness timestamp.',
  },
  {
    num: '07',
    q: 'Do you offer financial, tax, or legal advice?',
    a: 'No. Stormline never issues advice. We frame everything in historical pattern — "operators in similar conditions have," "the prior cycle telegraphed," "historical data indicates." That line isn’t a disclaimer; it’s the product philosophy. For advice, work with a licensed professional.',
  },
  {
    num: '08',
    q: 'How do event alerts work?',
    a: 'Pre-tuned thresholds fire via SMS (Pro+) and email when an indicator crosses a historical significance level \u2014 hurricane tracks into your region, tariff band widening, FOMC decisions, credit spread widening past 2σ. Pro subscribers can set custom thresholds.',
  },
  {
    num: '09',
    q: 'Can I export data for my own analysis?',
    a: 'Pro and Multi plans include CSV export and a read-only API endpoint for indicator time-series. Core plan is read-only in the app. We do not store, process, or have access to your financial or POS data \u2014 Stormline is read-only intelligence that flows one way: public data in, context out.',
  },
  {
    num: '10',
    q: 'Is there a free trial? Do I need to put in a card?',
    a: 'Yes \u2014 14 days of full access on every plan. No credit card required. Your first Monday briefing arrives the morning after you sign up. Cancel any time before day 14 and you pay nothing.',
  },
  {
    num: '11',
    q: 'Can I add more team members?',
    a: 'Yes. Every plan includes unlimited users at your shop. No seat pricing. Add your GM, your partner, your controller, your kitchen manager \u2014 same price.',
  },
  {
    num: '12',
    q: 'How do I cancel?',
    a: 'One click in settings. No phone calls, no retention team, no cancellation surveys. Cancel anytime; you keep access through the end of the billing period you paid for.',
  },
]

export default function Section12FAQ() {
  const [open, setOpen] = useState<string | null>(QAS[0].num)

  return (
    <section
      data-section="12"
      className="relative isolate border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg-0)' }}
    >
      <div className="relative mx-auto max-w-5xl px-6 py-28 sm:py-32">
        <div className="mb-14 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
            <span style={{ color: 'var(--sl-accent)' }}>12</span>
            <span>/</span>
            <span>Questions · asked & answered</span>
          </div>
          <SplitTextReveal
            as="h2"
            mode="word"
            text="The 12 questions operators actually ask."
            stagger={50}
            duration={900}
            className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
          />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            If your question isn’t here, email <a href="mailto:hello@stormline.co" className="underline decoration-fg-dim underline-offset-4 transition-colors hover:decoration-fg">hello@stormline.co</a>. A human answers within a day.
          </p>
        </div>

        <div
          className="divide-y rounded-[var(--sl-radius-lg)] border"
          style={{
            borderColor: 'var(--sl-border)',
            background: 'var(--sl-bg-elev)',
          }}
        >
          {QAS.map((qa) => (
            <FAQItem
              key={qa.num}
              qa={qa}
              isOpen={open === qa.num}
              onToggle={() => setOpen((cur) => (cur === qa.num ? null : qa.num))}
            />
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[10.5px] uppercase tracking-[0.25em] text-fg-dim">
          Intelligence, not advice · hello@stormline.co
        </p>
      </div>
    </section>
  )
}

function FAQItem({
  qa,
  isOpen,
  onToggle,
}: {
  qa: QA
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="transition-colors"
      style={{
        borderColor: 'var(--sl-border)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--sl-accent)_2%,transparent)]"
      >
        <div className="flex items-start gap-5">
          <span
            className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: 'var(--sl-accent)' }}
          >
            {qa.num}
          </span>
          <span className="font-display text-[15.5px] font-semibold leading-snug text-fg">
            {qa.q}
          </span>
        </div>
        <span
          aria-hidden
          className="mt-[5px] inline-block h-3 w-3 shrink-0 transition-transform duration-[var(--sl-dur-md)]"
          style={{
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            color: 'var(--sl-fg-muted)',
          }}
        >
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
            <path d="M6 1 V11 M1 6 H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <div
        className="overflow-hidden transition-[grid-template-rows] duration-[var(--sl-dur-md)]"
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 pl-[54px] pr-12 text-[14px] leading-relaxed text-fg-muted">
            {qa.a}
          </p>
        </div>
      </div>
    </div>
  )
}
