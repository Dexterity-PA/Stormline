'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChartLive, SplitTextReveal } from '@/components/motion'

type Indicator = {
  code: string
  label: string
  value: string
  unit: string
  pct: number
  data: number[]
}

type Industry = {
  slug: string
  num: string
  name: string
  headline: string
  blurb: string
  signature: Indicator[]
  glyph: 'plate' | 'frame' | 'shelf'
  accent: string
}

const INDUSTRIES: readonly Industry[] = [
  {
    slug: 'restaurants',
    num: '01',
    name: 'Restaurants',
    headline: 'Your food cost changed before the menu did.',
    blurb:
      'Boxed beef, poultry, cooking oil, wheat. Discretionary spend, credit delinquency, regional traffic. Everything that makes the Monday reprice decision — on one screen.',
    glyph: 'plate',
    accent: 'var(--sl-accent)',
    signature: [
      {
        code: 'BEEF',
        label: 'Boxed beef · choice',
        value: '318.40',
        unit: '$/cwt',
        pct: 2.1,
        data: [290, 295, 293, 301, 305, 304, 309, 311, 314, 316, 318],
      },
      {
        code: 'POULTRY',
        label: 'Broiler chicken',
        value: '1.41',
        unit: '$/lb',
        pct: 0.7,
        data: [1.45, 1.44, 1.42, 1.41, 1.39, 1.4, 1.41, 1.4, 1.41, 1.42, 1.41],
      },
      {
        code: 'OIL',
        label: 'Cooking oil index',
        value: '127.8',
        unit: 'idx',
        pct: -0.9,
        data: [130, 131, 132, 131, 130, 129, 129, 128, 128, 128, 127.8],
      },
    ],
  },
  {
    slug: 'construction',
    num: '02',
    name: 'Light construction',
    headline: 'The next 90 days are already in lumber futures.',
    blurb:
      'Lumber, HRC steel, PVC resin, diesel. Housing starts, permits, remodel demand, 30Y mortgage. Read the leading signals before the estimator hands in the quote.',
    glyph: 'frame',
    accent: '#c1894a',
    signature: [
      {
        code: 'LUMBER',
        label: 'Lumber futures',
        value: '542.50',
        unit: '$/kbf',
        pct: 3.8,
        data: [490, 500, 505, 510, 515, 520, 525, 528, 532, 538, 542.5],
      },
      {
        code: 'STEEL',
        label: 'HRC steel',
        value: '742',
        unit: '$/ton',
        pct: 1.2,
        data: [710, 715, 720, 725, 728, 730, 734, 736, 738, 740, 742],
      },
      {
        code: 'HSTARTS',
        label: 'Housing starts',
        value: '1.42M',
        unit: 'SAAR',
        pct: 3.2,
        data: [1.32, 1.33, 1.34, 1.35, 1.36, 1.37, 1.38, 1.39, 1.4, 1.41, 1.42],
      },
    ],
  },
  {
    slug: 'retail',
    num: '03',
    name: 'Independent retail',
    headline: 'Foot traffic tells you three weeks early.',
    blurb:
      'Retail foot traffic, card delinquency, consumer sentiment, retail sales ex-auto. Credit conditions, payroll, regional discretionary — the inputs to inventory and staffing.',
    glyph: 'shelf',
    accent: '#6aa3c7',
    signature: [
      {
        code: 'FOOT-TRF',
        label: 'Retail foot traffic',
        value: '+1.2',
        unit: '% WoW',
        pct: 1.2,
        data: [99.5, 99.8, 100.1, 100.3, 100.6, 100.8, 101.1, 101.3, 101.5, 101.7, 101.9],
      },
      {
        code: 'UMCSENT',
        label: 'Consumer sentiment',
        value: '77.9',
        unit: '',
        pct: -1.4,
        data: [80, 79.5, 79.2, 79, 78.8, 78.5, 78.2, 78, 77.9, 77.8, 77.9],
      },
      {
        code: 'CARD-DLQ',
        label: 'Card delinquency',
        value: '3.22',
        unit: '%',
        pct: 0.14,
        data: [2.9, 2.95, 3.0, 3.05, 3.08, 3.1, 3.14, 3.16, 3.18, 3.2, 3.22],
      },
    ],
  },
]

function PlateGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <circle cx={100} cy={100} r={80} fill="none" stroke="var(--sl-border)" strokeWidth={1} />
      <circle cx={100} cy={100} r={60} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 3" />
      <circle cx={100} cy={100} r={40} fill="none" stroke="var(--sl-border-strong)" strokeWidth={1} />
      <circle cx={100} cy={100} r={3} fill={color} />
      <line x1={100} y1={20} x2={100} y2={180} stroke="var(--sl-border)" strokeWidth={0.5} opacity={0.5} />
      <line x1={20} y1={100} x2={180} y2={100} stroke="var(--sl-border)" strokeWidth={0.5} opacity={0.5} />
    </svg>
  )
}

function FrameGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <polyline
        points="30,170 30,80 100,30 170,80 170,170"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line x1={30} y1={170} x2={170} y2={170} stroke="var(--sl-border)" strokeWidth={1} />
      <line x1={30} y1={125} x2={170} y2={125} stroke="var(--sl-border)" strokeWidth={0.5} strokeDasharray="2 3" />
      <line x1={70} y1={170} x2={70} y2={55} stroke="var(--sl-border)" strokeWidth={0.5} strokeDasharray="2 3" />
      <line x1={130} y1={170} x2={130} y2={55} stroke="var(--sl-border)" strokeWidth={0.5} strokeDasharray="2 3" />
      <circle cx={100} cy={30} r={3} fill={color} />
    </svg>
  )
}

function ShelfGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <line x1={20} y1={60} x2={180} y2={60} stroke="var(--sl-border)" strokeWidth={1} />
      <line x1={20} y1={110} x2={180} y2={110} stroke="var(--sl-border)" strokeWidth={1} />
      <line x1={20} y1={160} x2={180} y2={160} stroke="var(--sl-border)" strokeWidth={1} />
      {[40, 60, 85, 110, 140, 165].map((x) => (
        <rect key={`a-${x}`} x={x} y={30} width={14} height={28} fill="none" stroke={color} strokeWidth={1} opacity={0.8} />
      ))}
      {[40, 65, 95, 120, 145, 170].map((x) => (
        <rect key={`b-${x}`} x={x} y={80} width={12} height={28} fill="none" stroke="var(--sl-fg-muted)" strokeWidth={1} opacity={0.6} />
      ))}
      {[45, 70, 95, 125, 150].map((x) => (
        <rect key={`c-${x}`} x={x} y={130} width={16} height={28} fill="none" stroke="var(--sl-fg-dim)" strokeWidth={1} opacity={0.5} />
      ))}
    </svg>
  )
}

function IndustryPanel({
  industry,
  isActive,
}: {
  industry: Industry
  isActive: boolean
}) {
  const Glyph =
    industry.glyph === 'plate'
      ? PlateGlyph
      : industry.glyph === 'frame'
        ? FrameGlyph
        : ShelfGlyph

  return (
    <div
      className="relative flex min-w-full snap-start flex-col overflow-hidden rounded-[var(--sl-radius-lg)] border lg:flex-row"
      style={{
        borderColor: 'var(--sl-border)',
        background: 'var(--sl-bg-elev)',
        opacity: isActive ? 1 : 0.55,
        transition: 'opacity 400ms var(--sl-ease-out-expo)',
      }}
    >
      <div className="flex-1 p-8 md:p-12 lg:p-14">
        <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
          <span style={{ color: industry.accent }}>{industry.num}</span>
          <span>·</span>
          <span>{industry.name}</span>
        </div>
        <h3 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.015em] text-fg">
          {industry.headline}
        </h3>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-fg-muted md:text-base">
          {industry.blurb}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {industry.signature.map((ind) => {
            const up = ind.pct > 0
            return (
              <div
                key={ind.code}
                className="rounded-[var(--sl-radius-sm)] border p-3"
                style={{
                  borderColor: 'var(--sl-border)',
                  background: 'var(--sl-bg)',
                }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-fg-dim">
                    {ind.code}
                  </span>
                  <span
                    className="font-mono text-[10px] tabular-nums"
                    style={{ color: up ? industry.accent : 'var(--sl-good)' }}
                  >
                    {up ? '+' : ''}
                    {ind.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="mb-1 text-[10.5px] text-fg-muted">{ind.label}</div>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="font-display text-lg font-semibold text-fg">
                    {ind.value}
                  </span>
                  <span className="text-[10px] text-fg-dim">{ind.unit}</span>
                </div>
                <div className="h-8">
                  <ChartLive
                    data={[...ind.data]}
                    height={32}
                    width={180}
                    stroke={industry.accent}
                    fill={industry.accent}
                    strokeWidth={1.25}
                    duration={1200}
                    ariaLabel={`${ind.label} trend`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href={`/industries/${industry.slug}`}
            className="group inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-[var(--sl-border-strong)]"
            style={{
              borderColor: 'var(--sl-border)',
              background: 'var(--sl-bg)',
            }}
          >
            See {industry.name.toLowerCase()}
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
            Sample briefing · sample dashboard
          </span>
        </div>
      </div>

      <div
        className="relative flex items-center justify-center p-8 lg:w-[360px] lg:shrink-0"
        style={{
          background:
            'radial-gradient(55% 60% at 50% 50%, color-mix(in oklab, var(--sl-accent) 5%, transparent), transparent)',
          borderLeft: '1px solid var(--sl-border)',
        }}
      >
        <div className="relative h-56 w-56 md:h-72 md:w-72">
          <Glyph color={industry.accent} />
        </div>
        <div
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ color: 'var(--sl-fg-dim)' }}
        >
          {industry.name}
        </div>
      </div>
    </div>
  )
}

export default function Section05Industries() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let raf = 0
    let ticking = false
    const update = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActiveIdx(Math.max(0, Math.min(INDUSTRIES.length - 1, idx)))
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        raf = requestAnimationFrame(update)
        ticking = true
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const scrollTo = (idx: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <section
      data-section="5"
      className="relative isolate border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg-0)' }}
    >
      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-32">
        <div className="mb-12 flex items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
              <span style={{ color: 'var(--sl-accent)' }}>05</span>
              <span>/</span>
              <span>Three industries · tuned</span>
            </div>
            <SplitTextReveal
              as="h2"
              mode="word"
              text="Built for the three shops most exposed to macro noise."
              stagger={50}
              duration={900}
              className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
            />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {INDUSTRIES.map((ind, i) => (
              <button
                key={ind.slug}
                type="button"
                onClick={() => scrollTo(i)}
                className="font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
                style={{
                  color: activeIdx === i ? 'var(--sl-fg)' : 'var(--sl-fg-dim)',
                  borderBottom: activeIdx === i ? '1px solid var(--sl-accent)' : '1px solid transparent',
                  paddingBottom: 6,
                }}
              >
                {ind.num} · {ind.name}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="sl-mask-fade-x flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scroll-padding-inline:0]"
          style={{ scrollbarWidth: 'none' }}
        >
          {INDUSTRIES.map((ind, i) => (
            <IndustryPanel
              key={ind.slug}
              industry={ind}
              isActive={activeIdx === i}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {INDUSTRIES.map((ind, i) => (
            <button
              key={ind.slug}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show ${ind.name}`}
              className="h-1.5 rounded-full transition-all duration-[var(--sl-dur-md)]"
              style={{
                width: activeIdx === i ? 28 : 12,
                background:
                  activeIdx === i ? 'var(--sl-accent)' : 'var(--sl-border-strong)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
