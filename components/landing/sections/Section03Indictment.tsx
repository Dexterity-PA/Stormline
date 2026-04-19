'use client'

import { useEffect, useRef, useState } from 'react'
import { SplitTextReveal } from '@/components/motion'
import { usePrefersReducedMotion } from '@/components/motion/usePrefersReducedMotion'

type DiagramKind = 'a' | 'b' | 'c'

type SceneProps = {
  index: number
  eyebrow: string
  headline: string
  body: string
  sideLabel: string
  diagramKind: DiagramKind
}

// ease-out-expo: fast start, settled tail — matches the organic curve we want
// for scroll-scrubbed chart endpoints.
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

function DiagramMenuVsBeef({ progress }: { progress: number }) {
  const p = easeOutExpo(Math.max(0, Math.min(1, (progress - 0.15) / 0.7)))
  const width = 520
  const height = 240
  const menuY = 160
  // Cubic bezier control points. c1 creates early restraint (curve sags
  // slightly below baseline then accelerates up), c2 is the steep final rise.
  const beefEnd = 160 - p * 90
  const c1x = width * 0.28
  const c1y = 160 - p * 10
  const c2x = width * 0.72
  const c2y = 160 - p * 70
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="w-full">
      <defs>
        <linearGradient id="sl-d1-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sl-crit)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--sl-crit)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={0}
          x2={width}
          y1={40 + i * 50}
          y2={40 + i * 50}
          stroke="var(--sl-border)"
          strokeDasharray="2 4"
          opacity={0.5}
        />
      ))}
      <line
        x1={20}
        x2={width - 20}
        y1={menuY}
        y2={menuY}
        stroke="var(--sl-fg-muted)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* Menu price label: anchored at 60% along the dashed line, sits below */}
      <text
        x={20 + (width - 40) * 0.6}
        y={menuY + 16}
        fontSize="11"
        textAnchor="middle"
        fill="var(--sl-fg-muted)"
        fontFamily="var(--sl-font-mono)"
        style={{ maxWidth: 180 }}
      >
        Your menu price · flat
      </text>
      <path
        d={`M 20 ${menuY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${width - 20} ${beefEnd}`}
        stroke="var(--sl-crit)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M 20 ${menuY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${width - 20} ${beefEnd} L ${width - 20} ${height - 20} L 20 ${height - 20} Z`}
        fill="url(#sl-d1-area)"
      />
      <circle cx={width - 20} cy={beefEnd} r={4} fill="var(--sl-crit)" />
      {/* Subtle leader from beef label down to data point */}
      <line
        x1={width - 20}
        x2={width - 20}
        y1={beefEnd - 14}
        y2={beefEnd - 6}
        stroke="var(--sl-crit)"
        strokeWidth={1}
        opacity={0.5}
      />
      {/* Boxed beef label: 16px clearance above red line endpoint */}
      <text
        x={width - 20}
        y={beefEnd - 16}
        fontSize="11"
        textAnchor="end"
        fill="var(--sl-crit)"
        fontFamily="var(--sl-font-mono)"
        style={{ maxWidth: 180 }}
      >
        Boxed beef +{(p * 14).toFixed(1)}% QoQ
      </text>
      <text x={20} y={height - 6} fontSize="10" fill="var(--sl-fg-dim)" fontFamily="var(--sl-font-mono)">
        Q1 · Q2 · Q3 · Q4
      </text>
    </svg>
  )
}

function DiagramMarkupSplit({ progress }: { progress: number }) {
  const p = easeOutExpo(Math.max(0, Math.min(1, (progress - 0.2) / 0.7)))
  const width = 520
  const height = 240
  const splitX = 180
  const midY = 130
  const topY = 130 - p * 50
  const bottomY = 130 + p * 35
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="w-full">
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={0}
          x2={width}
          y1={40 + i * 50}
          y2={40 + i * 50}
          stroke="var(--sl-border)"
          strokeDasharray="2 4"
          opacity={0.5}
        />
      ))}
      <line x1={20} x2={splitX} y1={midY} y2={midY} stroke="var(--sl-fg-muted)" strokeWidth={2} />
      <path
        d={`M ${splitX} ${midY} C ${splitX + 80} ${midY}, ${splitX + 160} ${topY}, ${width - 20} ${topY}`}
        stroke="var(--sl-warn)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={width - 20} cy={topY} r={4} fill="var(--sl-warn)" />
      <text x={width - 24} y={topY - 10} fontSize="11" textAnchor="end" fill="var(--sl-warn)" fontFamily="var(--sl-font-mono)">
        Supplier markup +{(p * 9).toFixed(1)}%
      </text>
      <path
        d={`M ${splitX} ${midY} C ${splitX + 80} ${midY}, ${splitX + 160} ${bottomY}, ${width - 20} ${bottomY}`}
        stroke="var(--sl-accent)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={width - 20} cy={bottomY} r={4} fill="var(--sl-accent)" />
      <text x={width - 24} y={bottomY + 18} fontSize="11" textAnchor="end" fill="var(--sl-accent)" fontFamily="var(--sl-font-mono)">
        Market baseline +{(p * 5).toFixed(1)}%
      </text>
      <text x={splitX + 6} y={midY - 8} fontSize="10" fill="var(--sl-fg-dim)" fontFamily="var(--sl-font-mono)">
        Quote splits
      </text>
    </svg>
  )
}

function DiagramLumberDrawdown({ drawActive }: { drawActive: boolean }) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const [pathLen, setPathLen] = useState(0)
  const prefersReduced = usePrefersReducedMotion()
  const width = 520
  const height = 240
  const points: readonly (readonly [number, number])[] = [
    [20, 180],
    [60, 170],
    [100, 130],
    [140, 110],
    [180, 80],
    [220, 68],
    [260, 95],
    [300, 140],
    [340, 170],
    [380, 185],
    [420, 175],
    [460, 160],
    [500, 155],
  ] as const
  const d = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`)
    .join(' ')
  const drawdownStart = 220
  const drawdownEnd = 380

  useEffect(() => {
    const el = pathRef.current
    if (!el) return
    setPathLen(el.getTotalLength())
  }, [])

  const dashArray = pathLen || 1200
  const offsetActive = prefersReduced || drawActive ? 0 : dashArray
  const regionOpacity = prefersReduced ? 1 : drawActive ? 1 : 0
  const regionDelayMs = prefersReduced ? 0 : 1400

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="w-full">
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={0}
          x2={width}
          y1={40 + i * 50}
          y2={40 + i * 50}
          stroke="var(--sl-border)"
          strokeDasharray="2 4"
          opacity={0.5}
        />
      ))}
      <g
        style={{
          opacity: regionOpacity,
          transition: `opacity 600ms var(--sl-ease-out-expo) ${regionDelayMs}ms`,
        }}
      >
        <rect
          x={drawdownStart}
          y={40}
          width={drawdownEnd - drawdownStart}
          height={180}
          fill="var(--sl-crit)"
          opacity={0.08}
        />
        <line
          x1={drawdownStart}
          x2={drawdownStart}
          y1={40}
          y2={220}
          stroke="var(--sl-crit)"
          strokeDasharray="3 3"
          opacity={0.5}
        />
        <line
          x1={drawdownEnd}
          x2={drawdownEnd}
          y1={40}
          y2={220}
          stroke="var(--sl-crit)"
          strokeDasharray="3 3"
          opacity={0.5}
        />
        <text
          x={(drawdownStart + drawdownEnd) / 2}
          y={55}
          fontSize="11"
          textAnchor="middle"
          fill="var(--sl-crit)"
          fontFamily="var(--sl-font-mono)"
        >
          9-month margin drawdown
        </text>
      </g>
      <path
        ref={pathRef}
        d={d}
        stroke="var(--sl-accent)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: dashArray,
          strokeDashoffset: offsetActive,
          transition: prefersReduced
            ? undefined
            : 'stroke-dashoffset 1400ms var(--sl-ease-out-expo)',
        }}
      />
      <text x={20} y={30} fontSize="11" fill="var(--sl-fg-muted)" fontFamily="var(--sl-font-mono)">
        Lumber futures · illustrative
      </text>
      <text x={20} y={height - 6} fontSize="10" fill="var(--sl-fg-dim)" fontFamily="var(--sl-font-mono)">
        Month 0 · 3 · 6 · 9 · 12
      </text>
    </svg>
  )
}

function Scene({ index, eyebrow, headline, body, sideLabel, diagramKind }: SceneProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [pinned, setPinned] = useState(false)
  const [subheadVisible, setSubheadVisible] = useState(false)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let ticking = false
    const update = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = r.height - vh
      const traveled = Math.max(0, Math.min(total, -r.top))
      setProgress(total > 0 ? traveled / total : 0)
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        raf = requestAnimationFrame(update)
        ticking = true
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Scene-enter observer — fires exactly once the scene first pins in view.
  // Drives the headline→subhead sequencing and the lumber draw-in.
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setPinned(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Subhead waits until ~80% of headline reveal completes, then fades in
  // 400ms below. Assumed headline reveal ≈ 1200ms total; 80% ≈ 960ms.
  useEffect(() => {
    if (!pinned) return
    if (prefersReduced) {
      setSubheadVisible(true)
      return
    }
    const id = window.setTimeout(() => setSubheadVisible(true), 960)
    return () => window.clearTimeout(id)
  }, [pinned, prefersReduced])

  const diagram =
    diagramKind === 'a' ? (
      <DiagramMenuVsBeef progress={progress} />
    ) : diagramKind === 'b' ? (
      <DiagramMarkupSplit progress={progress} />
    ) : (
      <DiagramLumberDrawdown drawActive={pinned} />
    )

  return (
    <div ref={ref} className="relative h-[220vh]">
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen items-center overflow-hidden"
        style={{
          background:
            index % 2 === 0
              ? 'var(--sl-bg)'
              : 'linear-gradient(180deg, var(--sl-bg) 0%, var(--sl-bg-0) 100%)',
        }}
      >
        <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-50" />

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div>
            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
              <span style={{ color: 'var(--sl-accent)' }}>
                {String(index).padStart(2, '0')}
              </span>
              <span>/</span>
              <span>{eyebrow}</span>
            </div>
            <SplitTextReveal
              as="h2"
              mode="word"
              text={headline}
              stagger={55}
              duration={800}
              className="font-display text-[clamp(2rem,4.5vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
            />
            <p
              className="mt-8 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg"
              style={{
                opacity: subheadVisible ? 1 : 0,
                transform: subheadVisible ? 'translate3d(0,0,0)' : 'translate3d(0, 12px, 0)',
                transition:
                  'opacity 400ms var(--sl-ease-out-expo), transform 400ms var(--sl-ease-out-expo)',
              }}
            >
              {body}
            </p>
          </div>

          <div className="relative">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
              <span
                className="inline-block h-1 w-1 rounded-full"
                style={{ background: 'var(--sl-accent)' }}
              />
              {sideLabel}
            </div>
            <div
              className="relative rounded-[var(--sl-radius-lg)] border p-6"
              style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg-elev)' }}
            >
              {diagram}
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
              <span>Historical pattern · illustrative</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Section03Indictment() {
  return (
    <section data-section="3" className="relative isolate">
      <Scene
        index={1}
        diagramKind="a"
        eyebrow="Indictment · 01"
        sideLabel="Menu price vs. input cost"
        headline="You set your menu prices before checking the beef report."
        body="Historical patterns suggest restaurants that review wholesale protein costs weekly reprice 11 days faster than peers. Intelligence, not advice."
      />
      <Scene
        index={2}
        diagramKind="b"
        eyebrow="Indictment · 02"
        sideLabel="Supplier quote decomposition"
        headline="Your supplier quote went up 14%. You don’t know if that’s you or the market."
        body="When the market baseline moves only 5%, the other 9% is discretionary margin the supplier captured. Stormline shows the split, not the invoice."
      />
      <Scene
        index={3}
        diagramKind="c"
        eyebrow="Indictment · 03"
        sideLabel="Lumber · last cycle"
        headline="The last time lumber did this, your margin died for 9 months. You found out in October."
        body="Historical data indicates the prior cycle telegraphed itself three months before contractors felt it. Pattern recognition is a leading signal."
      />
    </section>
  )
}
