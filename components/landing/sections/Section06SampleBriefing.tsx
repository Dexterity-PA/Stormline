'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { SplitTextReveal } from '@/components/motion'

type Paragraph = {
  id: string
  kind: 'p' | 'h' | 'callout'
  text: string
  annotation: {
    tag: string
    title: string
    body: string
    source: string
    pattern: string
  }
}

const BRIEFING: readonly Paragraph[] = [
  {
    id: 'b-1',
    kind: 'h',
    text: 'Monday briefing · Week of April 20, 2026 · Restaurants',
    annotation: {
      tag: 'Cadence',
      title: 'Delivered Monday, 6:00am local',
      body: 'Every briefing is written Sunday by our analyst team and reviewed by a human editor. No auto-publish. No model-generated headlines.',
      source: 'Editorial · human-in-loop',
      pattern: 'Mon · 6:00am · 600–900 words',
    },
  },
  {
    id: 'b-2',
    kind: 'p',
    text:
      'Boxed beef closed Friday at $318.40/cwt, up 2.1% week-over-week and 8.4% above the 12-week trailing average. Historical patterns suggest casual-dining menu pricing lags wholesale moves of this magnitude by 6–9 days.',
    annotation: {
      tag: 'Input cost',
      title: 'Why the beef move matters',
      body: 'The 8.4% trailing gap is the meaningful number, not the 2.1%. Operators who watch trailing deltas re-price faster and historically preserve 180–220 bps of gross margin through similar cycles.',
      source: 'USDA AMS · LM_XB459 weekly',
      pattern: '12-week trailing Z-score +1.8σ',
    },
  },
  {
    id: 'b-3',
    kind: 'callout',
    text:
      'Operator context · Operators who reviewed weekly wholesale protein through the 2023 cycle adjusted menus a median of 11 days earlier than peers.',
    annotation: {
      tag: 'Operator context',
      title: '"Operator context" — not "Operator actions"',
      body: 'Stormline never tells you what to do. We show you the historical pattern and the position of operators who behaved differently. Intelligence, not advice. Legally, operationally, philosophically.',
      source: 'Internal · voice & copy spec',
      pattern: 'Frame: historical, comparative, descriptive',
    },
  },
  {
    id: 'b-4',
    kind: 'p',
    text:
      'Diesel at $3.847/gal eased 0.4% and freight spot rates held at $2.21/mi. Distribution cost pressure is contained this week; the prior two weeks\u2019 tightening has reversed.',
    annotation: {
      tag: 'Distribution',
      title: 'Diesel + freight = your delivery bill',
      body: 'Most distributors pass diesel moves within 2 weeks and freight tightness within 1. A stable or easing week in both is the signal your delivery line won\u2019t surprise you at month-end.',
      source: 'EIA weekly diesel · DAT spot index',
      pattern: 'Two-week rolling window',
    },
  },
  {
    id: 'b-5',
    kind: 'p',
    text:
      'Eggs (Grade A) fell 4.2% as HPAI-related flock losses moderated. Bakery programs and breakfast menus benefit most; the 8-week highs broken this week are a leading signal for Q2 retail egg pricing.',
    annotation: {
      tag: 'Leading signal',
      title: 'Wholesale leads retail by ~3 weeks',
      body: 'Grade A wholesale is the upstream indicator for retail egg prices. A 4.2% wholesale drop typically telegraphs a 2.5–3.5% retail adjustment over the following 3–4 weeks.',
      source: 'USDA AMS · weekly egg market',
      pattern: '3-week retail transmission lag',
    },
  },
  {
    id: 'b-6',
    kind: 'p',
    text:
      'On the demand side, OpenTable seated diners index held flat week-over-week but the 4-week moving average turned negative for the first time since February. Consumer sentiment printed 77.9, down 1.4 points.',
    annotation: {
      tag: 'Demand signal',
      title: 'The 4-week turn is the important line',
      body: 'Single-week demand prints are noise. The rolling 4-week turning negative is the first durable signal we\u2019ve seen since the February soft patch. Watch traffic, not tickets.',
      source: 'OpenTable · U-Michigan',
      pattern: '4-week moving average inflection',
    },
  },
  {
    id: 'b-7',
    kind: 'p',
    text:
      'Credit metrics bear watching. HY OAS widened 28 bps in 48 hours and card delinquency ticked to 3.22%. Neither is at distress levels, but both are directionally consistent with tighter consumer credit into Q3.',
    annotation: {
      tag: 'Credit',
      title: 'Why restaurants should care about HY spreads',
      body: 'Restaurant demand is discretionary and leveraged to consumer credit conditions. A 25+ bps HY spread move typically precedes a 40–60 bps tightening in small-business card lines within 60 days.',
      source: 'ICE BofA HY OAS · Fed G.19',
      pattern: '60-day credit transmission',
    },
  },
  {
    id: 'b-8',
    kind: 'p',
    text:
      'Sources: USDA AMS LM_XB459 (boxed beef), EIA weekly retail diesel, BLS CPI-U food away from home, OpenTable Seated Diners, U-Michigan Consumer Sentiment, ICE BofA HY OAS, Federal Reserve G.19.',
    annotation: {
      tag: 'Attribution',
      title: 'Every claim, every source',
      body: 'We link every non-trivial claim to its upstream data series. If you disagree with an interpretation, you can check the raw data in one click. No black boxes.',
      source: 'FRED · USDA · EIA · BLS',
      pattern: 'Per-paragraph attribution',
    },
  },
]

export default function Section06SampleBriefing() {
  const paragraphRefs = useRef<(HTMLElement | null)[]>([])
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const visibility = new Map<number, number>()
    paragraphRefs.current.forEach((el, idx) => {
      if (!el) return
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visibility.set(idx, entry.intersectionRatio)
          }
          let maxIdx = 0
          let maxRatio = -1
          for (const [i, r] of visibility.entries()) {
            if (r > maxRatio) {
              maxRatio = r
              maxIdx = i
            }
          }
          if (maxRatio > 0) setActiveIdx(maxIdx)
        },
        {
          root: null,
          rootMargin: '-40% 0px -40% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1],
        },
      )
      io.observe(el)
      observers.push(io)
    })
    return () => {
      for (const io of observers) io.disconnect()
    }
  }, [])

  const active = useMemo(() => BRIEFING[activeIdx], [activeIdx])

  return (
    <section
      data-section="6"
      className="relative isolate border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg)' }}
    >
      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-32">
        <div className="mb-16 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
            <span style={{ color: 'var(--sl-accent)' }}>06</span>
            <span>/</span>
            <span>Sample briefing · anatomy</span>
          </div>
          <SplitTextReveal
            as="h2"
            mode="word"
            text="What a Monday briefing actually reads like."
            stagger={50}
            duration={900}
            className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
          />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Scroll through a real-format briefing. The rail on the right explains the reasoning behind each paragraph — the data, the historical pattern, and why it matters to your week.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="relative">
            <div
              className="rounded-[var(--sl-radius-lg)] border p-8 md:p-12"
              style={{
                borderColor: 'var(--sl-border)',
                background: 'var(--sl-bg-elev)',
              }}
            >
              <div
                className="mb-6 flex items-center justify-between border-b pb-4"
                style={{ borderColor: 'var(--sl-border)' }}
              >
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--sl-accent)' }}
                  />
                  Briefing · restaurants
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
                  847 words · 4 min read
                </span>
              </div>

              <article className="space-y-5">
                {BRIEFING.map((p, i) => {
                  const isActive = i === activeIdx
                  const common = {
                    ref: (el: HTMLElement | null) => {
                      paragraphRefs.current[i] = el
                    },
                    style: {
                      opacity: isActive ? 1 : 0.55,
                      transition: 'opacity 350ms var(--sl-ease-out-expo)',
                    },
                  }
                  if (p.kind === 'h') {
                    return (
                      <h3
                        key={p.id}
                        {...common}
                        className="font-display text-lg font-semibold text-fg"
                      >
                        {p.text}
                      </h3>
                    )
                  }
                  if (p.kind === 'callout') {
                    return (
                      <aside
                        key={p.id}
                        {...common}
                        className="rounded-[var(--sl-radius-sm)] border-l-2 px-4 py-3 text-[14px] leading-relaxed text-fg"
                        style={{
                          ...common.style,
                          borderColor: 'var(--sl-accent)',
                          background: 'color-mix(in oklab, var(--sl-accent) 5%, transparent)',
                        }}
                      >
                        {p.text}
                      </aside>
                    )
                  }
                  return (
                    <p
                      key={p.id}
                      {...common}
                      className="text-[14.5px] leading-relaxed text-fg-muted md:text-[15px]"
                    >
                      {p.text}
                    </p>
                  )
                })}
              </article>
            </div>
          </div>

          <aside className="relative">
            <div className="sticky top-24">
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
                <span
                  className="inline-block h-1 w-1 rounded-full"
                  style={{ background: 'var(--sl-accent)' }}
                />
                Annotation · scroll to explore
              </div>
              <div
                className="relative overflow-hidden rounded-[var(--sl-radius-lg)] border p-6"
                style={{
                  borderColor: 'var(--sl-border)',
                  background: 'var(--sl-bg-elev)',
                }}
              >
                <div
                  key={active.id}
                  style={{
                    animation: 'sl-reveal-up 500ms var(--sl-ease-out-expo) both',
                  }}
                >
                  <div
                    className="mb-3 inline-block rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]"
                    style={{
                      borderColor: 'var(--sl-accent)',
                      color: 'var(--sl-accent)',
                    }}
                  >
                    {active.annotation.tag}
                  </div>
                  <h4 className="mb-2 font-display text-base font-semibold text-fg">
                    {active.annotation.title}
                  </h4>
                  <p className="mb-5 text-[13.5px] leading-relaxed text-fg-muted">
                    {active.annotation.body}
                  </p>

                  <div
                    className="mb-3 border-t pt-4"
                    style={{ borderColor: 'var(--sl-border)' }}
                  >
                    <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-fg-dim">
                      Source
                    </div>
                    <div className="text-[12px] text-fg">
                      {active.annotation.source}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-fg-dim">
                      Pattern
                    </div>
                    <div className="text-[12px] text-fg">
                      {active.annotation.pattern}
                    </div>
                  </div>
                </div>

                <div
                  className="mt-6 flex items-center gap-1.5 border-t pt-4"
                  style={{ borderColor: 'var(--sl-border)' }}
                >
                  {BRIEFING.map((p, i) => (
                    <div
                      key={p.id}
                      className="h-[3px] flex-1 rounded-full transition-colors duration-[var(--sl-dur-md)]"
                      style={{
                        background:
                          i === activeIdx
                            ? 'var(--sl-accent)'
                            : 'var(--sl-border-strong)',
                        opacity: i === activeIdx ? 1 : 0.4,
                      }}
                    />
                  ))}
                </div>
                <div
                  className="mt-2 text-right font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: 'var(--sl-fg-dim)' }}
                >
                  {String(activeIdx + 1).padStart(2, '0')} / {String(BRIEFING.length).padStart(2, '0')}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
