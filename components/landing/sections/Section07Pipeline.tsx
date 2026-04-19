'use client'

import { useEffect, useRef, useState } from 'react'
import { NumberRoll, SplitTextReveal } from '@/components/motion'

type Stage = {
  num: string
  title: string
  body: string
  meta: string
}

const STAGES: readonly Stage[] = [
  {
    num: '01',
    title: 'Public macro sources',
    body: 'FRED, EIA, USDA, BLS, Census. Direct feeds, no intermediaries. Every series has a primary source we can link in a footnote.',
    meta: '14 feeds',
  },
  {
    num: '02',
    title: 'Scrape + ingest',
    body: 'Hourly Python scrapers normalize units, timezones, and revisions. Late-arriving prints trigger re-writes, not retractions.',
    meta: 'Hourly · httpx',
  },
  {
    num: '03',
    title: 'Indicator registry',
    body: '44 canonical indicators mapped to operator-relevance: cost vs demand vs rate vs FX. Percentiles computed against 5-year history.',
    meta: '44 indicators',
  },
  {
    num: '04',
    title: 'Analyst synthesis',
    body: 'Sunday, the week’s moves run through a versioned Claude prompt. A human editor reviews every briefing before it queues.',
    meta: 'Human-in-loop',
  },
  {
    num: '05',
    title: 'Delivered to you',
    body: 'Monday at 6:00am local, the briefing lands in your inbox. Dashboard updates hourly. Alerts fire the moment a threshold crosses.',
    meta: 'Mon · 6:00am',
  },
]

function PipelineDesktop() {
  return (
    <div className="relative hidden lg:block">
      <svg
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-[46px] h-4 w-full"
        viewBox="0 0 1000 16"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sl-pipeline-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--sl-accent)" stopOpacity="0" />
            <stop offset="15%" stopColor="var(--sl-accent)" stopOpacity="0.5" />
            <stop offset="85%" stopColor="var(--sl-accent)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--sl-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={0}
          x2={1000}
          y1={8}
          y2={8}
          stroke="var(--sl-border-strong)"
          strokeWidth={1}
          strokeDasharray="3 5"
        />
        <line
          x1={0}
          x2={1000}
          y1={8}
          y2={8}
          stroke="url(#sl-pipeline-grad)"
          strokeWidth={2}
        />
      </svg>

      <div className="grid grid-cols-5 gap-6">
        {STAGES.map((s) => (
          <StageCard key={s.num} stage={s} />
        ))}
      </div>
    </div>
  )
}

function PipelineMobile() {
  return (
    <div className="relative flex flex-col gap-4 lg:hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-[30px] top-8 w-px"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, var(--sl-border-strong) 20%, var(--sl-border-strong) 80%, transparent 100%)',
        }}
      />
      {STAGES.map((s) => (
        <StageCard key={s.num} stage={s} mobile />
      ))}
    </div>
  )
}

function StageCard({ stage, mobile = false }: { stage: Stage; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setVisible(true)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={mobile ? 'relative flex items-start gap-4 pl-0' : 'relative'}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : 'translate3d(0, 12px, 0)',
        transition:
          'opacity 700ms var(--sl-ease-out-expo), transform 700ms var(--sl-ease-out-expo)',
      }}
    >
      {mobile && (
        <div
          className="relative z-10 flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border"
          style={{
            borderColor: 'var(--sl-border)',
            background: 'var(--sl-bg)',
          }}
        >
          <span
            className="font-mono text-[12px] font-semibold"
            style={{ color: 'var(--sl-accent)' }}
          >
            {stage.num}
          </span>
        </div>
      )}

      {!mobile && (
        <div className="relative mb-5 flex justify-center">
          <div
            className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border"
            style={{
              borderColor: 'var(--sl-border)',
              background: 'var(--sl-bg)',
            }}
          >
            <span
              className="absolute inset-0 animate-ping rounded-full"
              style={{
                background: 'var(--sl-accent)',
                opacity: visible ? 0.12 : 0,
                animationDuration: '2.4s',
              }}
            />
            <span
              className="font-mono text-[13px] font-semibold"
              style={{ color: 'var(--sl-accent)' }}
            >
              {stage.num}
            </span>
          </div>
        </div>
      )}

      <div
        className={
          mobile
            ? 'flex-1 rounded-[var(--sl-radius-md)] border p-5'
            : 'rounded-[var(--sl-radius-md)] border p-5'
        }
        style={{
          borderColor: 'var(--sl-border)',
          background: 'var(--sl-bg-elev)',
        }}
      >
        <h3 className="mb-2 font-display text-base font-semibold text-fg">
          {stage.title}
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-fg-muted">
          {stage.body}
        </p>
        <div
          className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{
            borderColor: 'var(--sl-border)',
            color: 'var(--sl-fg-dim)',
          }}
        >
          <span
            className="inline-block h-1 w-1 rounded-full"
            style={{ background: 'var(--sl-accent)' }}
          />
          {stage.meta}
        </div>
      </div>
    </div>
  )
}

function FlowDesktop() {
  return (
    <div className="relative my-10 hidden h-12 w-full lg:block">
      <svg
        className="h-full w-full"
        viewBox="0 0 1000 48"
        preserveAspectRatio="none"
        aria-hidden
      >
        <line
          x1={0}
          x2={1000}
          y1={24}
          y2={24}
          stroke="var(--sl-border)"
          strokeWidth={1}
          strokeDasharray="2 6"
        />
        <g transform="translate(0, 24)">
          {[0, 0.3, 0.6, 1.0, 1.4, 1.8, 2.2, 2.6].map((d, i) => (
            <circle
              key={i}
              r={2.5}
              fill="var(--sl-accent)"
              opacity={0.85}
              style={{
                filter:
                  'drop-shadow(0 0 4px color-mix(in oklab, var(--sl-accent) 60%, transparent))',
              }}
            >
              <animateMotion
                dur="3.5s"
                repeatCount="indefinite"
                begin={`${d}s`}
                path="M 0 0 L 1000 0"
              />
            </circle>
          ))}
        </g>
      </svg>
    </div>
  )
}

export default function Section07Pipeline() {
  return (
    <section
      data-section="7"
      className="relative isolate border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg-0)' }}
    >
      <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-32">
        <div className="mb-16 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
            <span style={{ color: 'var(--sl-accent)' }}>07</span>
            <span>/</span>
            <span>Data pipeline · end to end</span>
          </div>
          <SplitTextReveal
            as="h2"
            mode="word"
            text="Public data in. Operator context out."
            stagger={55}
            duration={900}
            className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
          />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Every briefing is a five-stage pipeline from primary source to your inbox. Every step is traceable. Every claim is attributable. No black boxes, no proprietary indices, no resold newsletters.
          </p>
        </div>

        <PipelineDesktop />
        <FlowDesktop />
        <PipelineMobile />

        <div
          className="mt-20 grid grid-cols-2 gap-4 rounded-[var(--sl-radius-lg)] border p-8 md:grid-cols-4"
          style={{
            borderColor: 'var(--sl-border)',
            background: 'var(--sl-bg-elev)',
          }}
        >
          <Stat value={44} label="Canonical indicators" />
          <Stat value={14} label="Primary data feeds" />
          <Stat value={162} label="Data points per briefing" />
          <Stat value={3} label="Industries tuned" />
        </div>

        <p
          className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ color: 'var(--sl-fg-dim)' }}
        >
          FRED · EIA · USDA · BLS · Census · OpenTable · ICE BofA · DAT
        </p>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <NumberRoll
        value={value}
        duration={1800}
        className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-none text-fg"
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
        {label}
      </span>
    </div>
  )
}
