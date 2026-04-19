'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChartLive, SplitTextReveal } from '@/components/motion'
import { usePrefersReducedMotion } from '@/components/motion/usePrefersReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// Column 1 — Weekly Briefing (animated email/PDF preview)
// ─────────────────────────────────────────────────────────────────────────────

const BRIEFING_LINES: readonly { kind: 'h' | 'p' | 'callout' | 'src'; text: string }[] = [
  { kind: 'h', text: 'Monday briefing · Apr 20, 2026' },
  { kind: 'p', text: 'Boxed beef closed Friday at $318.40/cwt, up 2.1% week-over-week and 8.4% above the 12-week trailing average.' },
  { kind: 'p', text: 'Historical patterns suggest a 6–9 day lag before casual-dining menu pricing adjusts to a move of this magnitude.' },
  { kind: 'callout', text: 'Operator context · Operators who reprice within 2 weeks have historically preserved 180–220 bps of gross margin through similar cycles.' },
  { kind: 'p', text: 'Diesel at $3.847/gal eased 0.4%. Freight spot rates held at $2.21/mi. Distribution cost pressure is contained this week.' },
  { kind: 'p', text: 'Eggs (Grade A) fell 4.2% as HPAI-related flock losses moderated. Bakery and breakfast programs benefit most.' },
  { kind: 'src', text: 'Sources · USDA AMS LM_XB459 · EIA weekly diesel · BLS CPI-U food away' },
]

function BriefingPreview() {
  const [offset, setOffset] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(true)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!active || prefersReduced) return
    let raf = 0
    const start = performance.now()
    const total = 9000
    const range = 120
    const tick = (now: number) => {
      const t = ((now - start) % total) / total
      setOffset(t * range)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, prefersReduced])

  return (
    <div
      ref={ref}
      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--sl-radius-lg)] border transition-colors"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg-elev)' }}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ borderColor: 'var(--sl-border)', color: 'var(--sl-fg-dim)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--sl-accent)' }}
          />
          Briefing · restaurants
        </div>
        <span>6:02am local</span>
      </div>

      <div
        className="sl-mask-fade-y relative flex-1 overflow-hidden px-6 py-5"
        style={{ minHeight: 360 }}
      >
        <div
          style={{
            transform: `translate3d(0, ${-offset}px, 0)`,
            transition: prefersReduced ? 'none' : 'transform 60ms linear',
          }}
        >
          {[...BRIEFING_LINES, ...BRIEFING_LINES].map((line, i) => {
            if (line.kind === 'h')
              return (
                <h4
                  key={i}
                  className="mb-3 font-display text-base font-semibold text-fg"
                >
                  {line.text}
                </h4>
              )
            if (line.kind === 'callout')
              return (
                <div
                  key={i}
                  className="my-3 rounded-[var(--sl-radius-sm)] border-l-2 px-3 py-2 text-[13px] leading-relaxed text-fg"
                  style={{
                    borderColor: 'var(--sl-accent)',
                    background: 'color-mix(in oklab, var(--sl-accent) 6%, transparent)',
                  }}
                >
                  {line.text}
                </div>
              )
            if (line.kind === 'src')
              return (
                <p
                  key={i}
                  className="mb-4 mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim"
                >
                  {line.text}
                </p>
              )
            return (
              <p key={i} className="mb-3 text-[13px] leading-relaxed text-fg-muted">
                {line.text}
              </p>
            )
          })}
        </div>
      </div>

      <div
        className="flex items-center justify-between border-t px-5 py-3 text-[11px]"
        style={{ borderColor: 'var(--sl-border)', color: 'var(--sl-fg-muted)' }}
      >
        <span className="font-mono uppercase tracking-[0.15em] text-fg-dim">
          Mon · 6:00am · 600–900 words
        </span>
        <span className="font-mono text-fg-dim">PDF · Email</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Column 2 — Input Dashboard (2x2 tiles with sparklines + percentile rings)
// ─────────────────────────────────────────────────────────────────────────────

type Tile = {
  code: string
  label: string
  value: string
  unit: string
  pct: number
  kind: 'cost' | 'demand'
  data: number[]
  percentile: number
}

const TILES: readonly Tile[] = [
  {
    code: 'BEEF',
    label: 'Boxed beef',
    value: '318.40',
    unit: '$/cwt',
    pct: 2.1,
    kind: 'cost',
    percentile: 88,
    data: [290, 295, 293, 301, 305, 304, 309, 311, 312, 314, 316, 318],
  },
  {
    code: 'DIESEL',
    label: 'Diesel (US)',
    value: '3.847',
    unit: '$/gal',
    pct: -0.4,
    kind: 'cost',
    percentile: 42,
    data: [4.01, 3.99, 3.95, 3.92, 3.9, 3.88, 3.87, 3.86, 3.85, 3.84, 3.84, 3.85],
  },
  {
    code: 'RESTIDX',
    label: 'Restaurant traffic',
    value: '102.3',
    unit: 'idx',
    pct: 0.8,
    kind: 'demand',
    percentile: 61,
    data: [99.2, 99.5, 100.1, 100.3, 100.8, 101.1, 101.4, 101.7, 101.9, 102.0, 102.1, 102.3],
  },
  {
    code: 'EGG',
    label: 'Grade A eggs',
    value: '3.89',
    unit: '$/doz',
    pct: -4.2,
    kind: 'cost',
    percentile: 28,
    data: [4.8, 4.72, 4.6, 4.5, 4.4, 4.3, 4.22, 4.15, 4.1, 4.02, 3.95, 3.89],
  },
]

function PercentileRing({ value, kind }: { value: number; kind: Tile['kind'] }) {
  const r = 18
  const c = 2 * Math.PI * r
  const filled = c * (value / 100)
  const color =
    kind === 'cost'
      ? value > 75
        ? 'var(--sl-crit)'
        : value > 50
          ? 'var(--sl-warn)'
          : 'var(--sl-good)'
      : value > 50
        ? 'var(--sl-good)'
        : 'var(--sl-warn)'
  const id = useId()
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
        <circle
          cx={24}
          cy={24}
          r={r}
          stroke="var(--sl-border)"
          strokeWidth={3}
          fill="none"
        />
        <circle
          cx={24}
          cy={24}
          r={r}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeDasharray={`${filled} ${c}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1200ms var(--sl-ease-out-expo)' }}
        >
          <title id={id}>{value}th percentile</title>
        </circle>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[10px] font-semibold text-fg">{value}</span>
      </div>
    </div>
  )
}

function TileCard({ tile, expanded, onEnter }: { tile: Tile; expanded: boolean; onEnter: () => void }) {
  const up = tile.pct > 0
  const color =
    tile.kind === 'cost'
      ? up
        ? 'var(--sl-warn)'
        : 'var(--sl-good)'
      : up
        ? 'var(--sl-good)'
        : 'var(--sl-warn)'

  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onFocus={onEnter}
      className="group relative flex flex-col overflow-hidden rounded-[var(--sl-radius-md)] border p-4 text-left transition-[border-color,transform] duration-[var(--sl-dur-md)] hover:border-[var(--sl-border-strong)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--sl-accent)]"
      style={{
        borderColor: expanded ? 'var(--sl-border-strong)' : 'var(--sl-border)',
        background: 'var(--sl-bg-elev)',
        minHeight: 168,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
            {tile.code}
          </div>
          <div className="mt-1 text-[11px] text-fg-muted">{tile.label}</div>
        </div>
        <PercentileRing value={tile.percentile} kind={tile.kind} />
      </div>

      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-semibold text-fg">
          {tile.value}
        </span>
        <span className="text-[11px] text-fg-dim">{tile.unit}</span>
      </div>

      <div className="flex items-center gap-1 text-[11px]" style={{ color }}>
        <span aria-hidden>{up ? '↑' : '↓'}</span>
        <span className="font-mono tabular-nums">
          {up ? '+' : ''}
          {tile.pct.toFixed(1)}% WoW
        </span>
      </div>

      <div className="mt-3 h-12 w-full">
        <ChartLive
          data={[...tile.data]}
          height={48}
          width={220}
          stroke={color}
          fill={color}
          showArea
          strokeWidth={1.5}
          duration={1400}
          ariaLabel={`${tile.label} 12-week trend`}
        />
      </div>
    </button>
  )
}

function DashboardTiles() {
  const [focused, setFocused] = useState<string>('BEEF')
  const tile = TILES.find((t) => t.code === focused) ?? TILES[0]

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-[var(--sl-radius-lg)] border"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg)' }}
    >
      <div
        className="flex items-center justify-between border-b px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ borderColor: 'var(--sl-border)', color: 'var(--sl-fg-dim)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--sl-accent)' }}
          />
          Dashboard · your inputs
        </div>
        <span>4 of 12 shown</span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {TILES.map((t) => (
          <TileCard
            key={t.code}
            tile={t}
            expanded={focused === t.code}
            onEnter={() => setFocused(t.code)}
          />
        ))}
      </div>

      <div
        className="mt-auto border-t px-5 py-3 text-[11px]"
        style={{ borderColor: 'var(--sl-border)', color: 'var(--sl-fg-muted)' }}
      >
        <span className="font-mono uppercase tracking-[0.15em] text-fg-dim">
          Focus ·{' '}
        </span>
        <span className="text-fg">
          {tile.label} — {tile.percentile}th pct vs 5yr · updated hourly
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Column 3 — Event Alerts (phone mock, staggered SMS/email notifications)
// ─────────────────────────────────────────────────────────────────────────────

type Alert = {
  id: string
  channel: 'SMS' | 'Email' | 'Push'
  title: string
  body: string
  tone: 'warn' | 'crit' | 'info'
  time: string
}

const ALERTS: readonly Alert[] = [
  {
    id: 'hurr',
    channel: 'SMS',
    title: 'Gulf storm · Cat 3 forecast',
    body: 'Landfall expected 72h. Historical pattern: poultry + diesel spike within 5 days.',
    tone: 'crit',
    time: '6:14am',
  },
  {
    id: 'tariff',
    channel: 'Email',
    title: 'Tariff update · steel',
    body: 'HRC tariff band widened 4pp. Construction material index leading indicator.',
    tone: 'warn',
    time: '6:32am',
  },
  {
    id: 'fomc',
    channel: 'Push',
    title: 'FOMC · rate hold',
    body: 'No move this meeting. 30Y fixed mortgage stable. Remodel demand unchanged.',
    tone: 'info',
    time: '2:03pm',
  },
  {
    id: 'spread',
    channel: 'SMS',
    title: 'HY credit spreads widening',
    body: 'OAS +28bps in 48h. SMB credit tightening signal — watch receivables.',
    tone: 'warn',
    time: '4:41pm',
  },
]

function AlertsPhone() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)
  const [animatedVisible, setAnimatedVisible] = useState(0)
  const prefersReduced = usePrefersReducedMotion()
  const visible = prefersReduced && active ? ALERTS.length : animatedVisible

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(true)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!active || prefersReduced) return
    const timers: number[] = []
    for (let i = 0; i < ALERTS.length; i++) {
      timers.push(
        window.setTimeout(
          () => setAnimatedVisible((v) => Math.max(v, i + 1)),
          450 + i * 700,
        ),
      )
    }
    return () => {
      for (const t of timers) window.clearTimeout(t)
    }
  }, [active, prefersReduced])

  return (
    <div
      ref={ref}
      className="relative flex h-full items-center justify-center overflow-hidden rounded-[var(--sl-radius-lg)] border px-6 py-8"
      style={{
        borderColor: 'var(--sl-border)',
        background:
          'radial-gradient(60% 60% at 50% 30%, color-mix(in oklab, var(--sl-accent) 8%, transparent), transparent), var(--sl-bg-elev)',
      }}
    >
      <div
        className="relative mx-auto w-full max-w-[300px]"
        style={{ aspectRatio: '9 / 18' }}
      >
        <div
          className="absolute inset-0 rounded-[36px] border p-3"
          style={{
            borderColor: 'var(--sl-border-strong)',
            background: 'var(--sl-bg-0)',
            boxShadow:
              '0 30px 60px -20px color-mix(in oklab, var(--sl-accent) 25%, transparent), 0 0 0 1px var(--sl-border) inset',
          }}
        >
          <div
            className="absolute left-1/2 top-2 h-[18px] w-24 -translate-x-1/2 rounded-full"
            style={{ background: 'var(--sl-bg)' }}
          />

          <div
            className="mt-6 mb-3 flex items-center justify-between px-3 font-mono text-[10px]"
            style={{ color: 'var(--sl-fg-muted)' }}
          >
            <span>9:41</span>
            <span>Stormline</span>
          </div>

          <div className="flex flex-col gap-2 px-1">
            {ALERTS.map((a, i) => (
              <AlertCard key={a.id} alert={a} shown={i < visible} delay={i * 80} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertCard({
  alert,
  shown,
  delay,
}: {
  alert: Alert
  shown: boolean
  delay: number
}) {
  const toneColor =
    alert.tone === 'crit'
      ? 'var(--sl-crit)'
      : alert.tone === 'warn'
        ? 'var(--sl-warn)'
        : 'var(--sl-accent)'
  return (
    <div
      className="relative rounded-[14px] border px-3 py-2.5"
      style={{
        borderColor: 'var(--sl-border)',
        background: 'color-mix(in oklab, var(--sl-bg-elev) 94%, transparent)',
        backdropFilter: 'blur(8px)',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translate3d(0,0,0) scale(1)' : 'translate3d(0, 8px, 0) scale(0.98)',
        transition: `opacity 550ms var(--sl-ease-out-expo) ${delay}ms, transform 550ms var(--sl-ease-out-expo) ${delay}ms`,
      }}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: toneColor }}
          />
          <span
            className="font-mono text-[9px] uppercase tracking-[0.15em]"
            style={{ color: 'var(--sl-fg-dim)' }}
          >
            {alert.channel} · Stormline
          </span>
        </div>
        <span className="font-mono text-[9px] text-fg-dim">{alert.time}</span>
      </div>
      <div className="mb-0.5 text-[11.5px] font-semibold text-fg leading-snug">
        {alert.title}
      </div>
      <p className="text-[10.5px] leading-snug text-fg-muted">{alert.body}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section orchestrator
// ─────────────────────────────────────────────────────────────────────────────

type Pillar = {
  num: string
  label: string
  title: string
  blurb: string
  badge: string
  component: 'briefing' | 'dashboard' | 'alerts'
}

const PILLARS: readonly Pillar[] = [
  {
    num: '01',
    label: 'Weekly briefing',
    title: 'Monday, 6am, before you open.',
    blurb:
      'A 600–900 word operational read on the inputs, demand signals, and macro shifts that touch your week. Intelligence, not advice.',
    badge: 'Mon · 6:00am local',
    component: 'briefing',
  },
  {
    num: '02',
    label: 'Input dashboard',
    title: 'Your inputs. Your percentiles.',
    blurb:
      'Live tiles for the 8–12 indicators that actually move your P&L. Sparklines, 5-year percentile rings, historical context on every tile.',
    badge: 'Updated hourly',
    component: 'dashboard',
  },
  {
    num: '03',
    label: 'Event alerts',
    title: 'When the world moves, you hear first.',
    blurb:
      'SMS and email the moment a pre-defined threshold crosses. Hurricane tracks, tariff moves, FOMC decisions, credit spreads — only what affects you.',
    badge: 'SMS · Email · Push',
    component: 'alerts',
  },
]

export default function Section04Pillars() {
  return (
    <section
      data-section="4"
      className="relative isolate border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg)' }}
    >
      <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-32">
        <div className="mb-16 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
            <span style={{ color: 'var(--sl-accent)' }}>04</span>
            <span>/</span>
            <span>What you get · three pillars</span>
          </div>
          <SplitTextReveal
            as="h2"
            mode="word"
            text="Three things land in your inbox. That's the product."
            stagger={50}
            duration={900}
            className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
          />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            No dashboards to check. No dashboards to learn. A briefing on Monday, a live tile grid when you want it, and a text message when something actually moves.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          {PILLARS.map((p) => (
            <PillarColumn key={p.num} pillar={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PillarColumn({ pillar }: { pillar: Pillar }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
          <span style={{ color: 'var(--sl-accent)' }}>{pillar.num}</span>
          <span>·</span>
          <span>{pillar.label}</span>
        </div>
        <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-fg">
          {pillar.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          {pillar.blurb}
        </p>
        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{
            borderColor: 'var(--sl-border)',
            color: 'var(--sl-fg-muted)',
          }}
        >
          <span
            className="inline-block h-1 w-1 rounded-full"
            style={{ background: 'var(--sl-accent)' }}
          />
          {pillar.badge}
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: 460 }}>
        {pillar.component === 'briefing' && <BriefingPreview />}
        {pillar.component === 'dashboard' && <DashboardTiles />}
        {pillar.component === 'alerts' && <AlertsPhone />}
      </div>
    </div>
  )
}
