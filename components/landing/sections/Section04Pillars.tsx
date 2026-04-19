'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChartLive, SplitTextReveal } from '@/components/motion'
import { usePrefersReducedMotion } from '@/components/motion/usePrefersReducedMotion'

// ─────────────────────────────────────────────────────────────────────────────
// Column 1 — Weekly Briefing (static anatomy + rotating "live update" line)
// ─────────────────────────────────────────────────────────────────────────────

const BRIEFING_STATIC: readonly { kind: 'h' | 'p' | 'callout' | 'src'; text: string }[] = [
  { kind: 'h', text: 'Monday briefing · Apr 20, 2026' },
  { kind: 'p', text: 'Boxed beef closed Friday at $318.40/cwt, up 2.1% week-over-week and 8.4% above the 12-week trailing average.' },
  { kind: 'callout', text: 'Operator context · Operators who repriced within 2 weeks historically preserved 180–220 bps of gross margin through similar cycles.' },
  { kind: 'p', text: 'Diesel at $3.847/gal eased 0.4%. Freight spot rates held at $2.21/mi. Distribution pressure is contained this week.' },
  { kind: 'src', text: 'Sources · USDA AMS LM_XB459 · EIA weekly diesel · BLS CPI-U food away' },
]

const LIVE_UPDATES: readonly string[] = [
  'Eggs (Grade A) now –4.2% WoW — breakfast margin tailwind into Q2.',
  'HY OAS +28bps in 48h. SMB credit conditions tightening on the margin.',
  'OpenTable 4-week avg turns negative — first durable demand signal since February.',
  'HRC tariff band widened 4pp — construction input passthrough lag is 3–5 weeks.',
]

function BriefingPreview() {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [active, setActive] = useState(false)
  const [liveIdx, setLiveIdx] = useState(0)

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
    const id = window.setInterval(() => {
      setLiveIdx((i) => (i + 1) % LIVE_UPDATES.length)
    }, 8000)
    return () => window.clearInterval(id)
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

      <div className="sl-mask-fade-y relative flex-1 overflow-hidden px-6 py-5" style={{ minHeight: 360 }}>
        {BRIEFING_STATIC.map((line, i) => {
          if (line.kind === 'h')
            return (
              <h4 key={i} className="mb-3 font-display text-base font-semibold text-fg">
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

      <div
        className="flex items-center gap-3 border-t px-5 py-3"
        style={{ borderColor: 'var(--sl-border)' }}
      >
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--sl-accent)' }}
        >
          <span className="relative inline-flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-80"
              style={{ background: 'var(--sl-accent)' }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--sl-accent)' }}
            />
          </span>
          Live
        </span>
        <span
          key={liveIdx}
          className="min-w-0 flex-1 truncate text-[11.5px] text-fg-muted"
          style={{ animation: prefersReduced ? undefined : 'sl-crossfade 800ms var(--sl-ease-out-expo) both' }}
        >
          {LIVE_UPDATES[liveIdx]}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Column 2 — Input Dashboard (6-tile grid + ticking values + live sparkline)
// ─────────────────────────────────────────────────────────────────────────────

type Tile = {
  code: string
  label: string
  baseValue: number
  valueFormat: (n: number) => string
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
    baseValue: 318.4,
    valueFormat: (n) => n.toFixed(2),
    unit: '$/cwt',
    pct: 2.1,
    kind: 'cost',
    percentile: 88,
    data: [290, 295, 293, 301, 305, 304, 309, 311, 312, 314, 316, 318],
  },
  {
    code: 'DIESEL',
    label: 'Diesel (US)',
    baseValue: 3.847,
    valueFormat: (n) => n.toFixed(3),
    unit: '$/gal',
    pct: -0.4,
    kind: 'cost',
    percentile: 42,
    data: [4.01, 3.99, 3.95, 3.92, 3.9, 3.88, 3.87, 3.86, 3.85, 3.84, 3.84, 3.85],
  },
  {
    code: 'CHICKEN',
    label: 'Boneless breast',
    baseValue: 2.48,
    valueFormat: (n) => n.toFixed(2),
    unit: '$/lb',
    pct: -0.8,
    kind: 'cost',
    percentile: 51,
    data: [2.72, 2.69, 2.66, 2.63, 2.6, 2.56, 2.54, 2.52, 2.5, 2.49, 2.48, 2.48],
  },
  {
    code: 'EGG',
    label: 'Grade A eggs',
    baseValue: 3.89,
    valueFormat: (n) => n.toFixed(2),
    unit: '$/doz',
    pct: -4.2,
    kind: 'cost',
    percentile: 28,
    data: [4.8, 4.72, 4.6, 4.5, 4.4, 4.3, 4.22, 4.15, 4.1, 4.02, 3.95, 3.89],
  },
  {
    code: 'RESTIDX',
    label: 'Restaurant traffic',
    baseValue: 102.3,
    valueFormat: (n) => n.toFixed(1),
    unit: 'idx',
    pct: 0.8,
    kind: 'demand',
    percentile: 61,
    data: [99.2, 99.5, 100.1, 100.3, 100.8, 101.1, 101.4, 101.7, 101.9, 102.0, 102.1, 102.3],
  },
  {
    code: 'OPENTBL',
    label: 'Seated diners',
    baseValue: 98.7,
    valueFormat: (n) => n.toFixed(1),
    unit: 'idx',
    pct: -1.2,
    kind: 'demand',
    percentile: 38,
    data: [102.1, 101.6, 101.2, 100.8, 100.3, 99.9, 99.5, 99.3, 99.1, 98.9, 98.8, 98.7],
  },
]

function PercentileRing({
  value,
  kind,
  active,
}: {
  value: number
  kind: Tile['kind']
  active: boolean
}) {
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
        <circle cx={24} cy={24} r={r} stroke="var(--sl-border)" strokeWidth={3} fill="none" />
        <circle
          cx={24}
          cy={24}
          r={r}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeDasharray={active ? `${filled} ${c}` : `0 ${c}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1400ms var(--sl-ease-out-expo)' }}
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

function TileCard({
  tile,
  focused,
  onEnter,
  ticked,
  dataOverride,
  ringActive,
}: {
  tile: Tile
  focused: boolean
  onEnter: () => void
  ticked: number
  dataOverride: number[]
  ringActive: boolean
}) {
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
      className="group relative flex flex-col overflow-hidden rounded-[var(--sl-radius-md)] border p-4 text-left transition-[border-color,transform] duration-[var(--sl-dur-md)] hover:border-[var(--sl-border-strong)] hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--sl-accent)]"
      style={{
        borderColor: focused ? 'var(--sl-accent)' : 'var(--sl-border)',
        background: 'var(--sl-bg-elev)',
        minHeight: 158,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
            {tile.code}
          </div>
          <div className="mt-1 text-[11px] text-fg-muted">{tile.label}</div>
        </div>
        <PercentileRing value={tile.percentile} kind={tile.kind} active={ringActive} />
      </div>

      <div className="mb-1 flex items-baseline gap-1.5">
        <span
          className="font-display text-2xl font-semibold text-fg"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {tile.valueFormat(ticked)}
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
          data={dataOverride}
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
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [active, setActive] = useState(false)
  const [focused, setFocused] = useState<string>('BEEF')
  const [tick, setTick] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const focusedTile = TILES.find((t) => t.code === focused) ?? TILES[0]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(true)
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Value jitter every 3s — ±0.1% so it feels live without being distracting
  useEffect(() => {
    if (!active || prefersReduced) return
    const id = window.setInterval(() => {
      setTick((t) => t + 1)
      setElapsed(0)
    }, 3000)
    return () => window.clearInterval(id)
  }, [active, prefersReduced])

  // 1Hz elapsed counter; resets on each tick
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [active])

  // Deterministic-looking jitter per tile per tick
  const tickedValues = TILES.map((t, i) => {
    if (prefersReduced) return t.baseValue
    const seed = Math.sin(tick * 7.3 + i * 2.1)
    return t.baseValue * (1 + seed * 0.001)
  })
  const dataOverrides = TILES.map((t, i) => {
    if (prefersReduced) return [...t.data]
    const seed = Math.sin(tick * 3.1 + i * 5.7)
    const next = t.data[t.data.length - 1] * (1 + seed * 0.002)
    return [...t.data.slice(1), next]
  })

  return (
    <div
      ref={ref}
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
        <span>6 of 12 shown</span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {TILES.map((t, i) => (
          <TileCard
            key={t.code}
            tile={t}
            focused={focused === t.code}
            onEnter={() => setFocused(t.code)}
            ticked={tickedValues[i]}
            dataOverride={dataOverrides[i]}
            ringActive={active}
          />
        ))}
      </div>

      <div
        className="mt-auto flex items-center justify-between gap-3 border-t px-5 py-3 text-[11px]"
        style={{ borderColor: 'var(--sl-border)', color: 'var(--sl-fg-muted)' }}
      >
        <span>
          <span className="font-mono uppercase tracking-[0.15em] text-fg-dim">Focus · </span>
          <span className="text-fg">
            {focusedTile.label} — {focusedTile.percentile}th pct vs 5yr
          </span>
        </span>
        <span
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] tabular-nums text-fg-dim"
          aria-live="polite"
        >
          Last update: {elapsed}s ago
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Column 3 — Event Alerts (phone mock, alerts slide in from top continuously)
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
  {
    id: 'eggs',
    channel: 'Email',
    title: 'Egg wholesale –4.2%',
    body: 'HPAI pressure easing. Bakery + breakfast menu tailwind next 3 weeks.',
    tone: 'info',
    time: '5:18pm',
  },
  {
    id: 'demand',
    channel: 'Push',
    title: 'OpenTable 4wk turns negative',
    body: 'First durable demand signal since February. Watch traffic, not tickets.',
    tone: 'warn',
    time: '6:02pm',
  },
]

const STACK_SIZE = 4

function AlertsPhone() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)
  const [rotation, setRotation] = useState(0)
  const prefersReduced = usePrefersReducedMotion()

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
    const id = window.setInterval(() => {
      setRotation((r) => (r + 1) % ALERTS.length)
    }, 10000)
    return () => window.clearInterval(id)
  }, [active, prefersReduced])

  // Build the currently-visible stack of STACK_SIZE alerts, newest on top.
  const stack: Alert[] = []
  for (let i = 0; i < STACK_SIZE; i++) {
    stack.push(ALERTS[(rotation + i) % ALERTS.length])
  }

  return (
    <div
      ref={ref}
      className="relative flex h-full justify-center overflow-hidden rounded-[var(--sl-radius-lg)] border px-6 py-8"
      style={{
        borderColor: 'var(--sl-border)',
        background:
          'radial-gradient(60% 60% at 50% 30%, color-mix(in oklab, var(--sl-accent) 8%, transparent), transparent), var(--sl-bg-elev)',
      }}
    >
      <div className="relative w-full max-w-[300px]" style={{ aspectRatio: '9 / 18' }}>
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

          <div className="relative flex flex-col gap-2 px-1">
            {stack.map((a, i) => (
              <AlertCard
                key={`${a.id}-${rotation}-${i}`}
                alert={a}
                slot={i}
                prefersReduced={prefersReduced}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertCard({
  alert,
  slot,
  prefersReduced,
}: {
  alert: Alert
  slot: number
  prefersReduced: boolean
}) {
  const toneColor =
    alert.tone === 'crit'
      ? 'var(--sl-crit)'
      : alert.tone === 'warn'
        ? 'var(--sl-warn)'
        : 'var(--sl-accent)'
  // Slot 0 = newest, fully bright. Later slots dim slightly. Last slot fades out.
  const opacity = slot === STACK_SIZE - 1 ? 0.4 : slot === 0 ? 1 : 0.85
  return (
    <div
      className="relative rounded-[14px] border px-3 py-2.5"
      style={{
        borderColor: 'var(--sl-border)',
        background: 'color-mix(in oklab, var(--sl-bg-elev) 94%, transparent)',
        backdropFilter: 'blur(8px)',
        opacity,
        transform: prefersReduced ? undefined : 'translate3d(0,0,0)',
        animation:
          prefersReduced || slot > 0
            ? undefined
            : 'sl-alert-slide-in 600ms var(--sl-ease-out-expo) both',
        transition: 'opacity 500ms var(--sl-ease-out-expo)',
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

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3 lg:gap-6">
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
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{pillar.blurb}</p>
        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{ borderColor: 'var(--sl-border)', color: 'var(--sl-fg-muted)' }}
        >
          <span
            className="inline-block h-1 w-1 rounded-full"
            style={{ background: 'var(--sl-accent)' }}
          />
          {pillar.badge}
        </div>
      </div>

      <div className="flex flex-1" style={{ minHeight: 560 }}>
        {pillar.component === 'briefing' && <BriefingPreview />}
        {pillar.component === 'dashboard' && <DashboardTiles />}
        {pillar.component === 'alerts' && <AlertsPhone />}
      </div>
    </div>
  )
}
