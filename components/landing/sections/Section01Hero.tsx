'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { MagneticButton, CursorSpotlight, ParallaxLayer } from '@/components/motion'
import { usePrefersReducedMotion } from '@/components/motion/usePrefersReducedMotion'
import GlobeFallback from '../hero/GlobeFallback'
import {
  CASCADE_ALERTS,
  NEWS_TICKER_ITEMS,
  VESSELS,
  MINI_CHART_SERIES,
} from '../hero/heroOpeningData'
import type { HeroAnimState } from '../hero/heroAnimState'
import { DEFAULT_FINAL_STATE, PHASE1_START_STATE } from '../hero/heroAnimState'

const HeroGlobe = dynamic(() => import('../hero/HeroGlobe'), {
  ssr: false,
  loading: () => <GlobeFallback />,
})

const MOBILE_BP = 768
const HEADLINE = 'The world is moving. Your P&L hasn\u2019t caught up.'
const SUBHEAD =
  'Macro intelligence, translated into operator language, for the 6 million businesses without a CFO.'

function buildChartPath(
  points: number[],
  w: number,
  h: number,
  padX = 4,
  padY = 6,
): string {
  const innerW = w - padX * 2
  const innerH = h - padY * 2
  return points
    .map((v, i) => {
      const x = padX + (i / (points.length - 1)) * innerW
      const y = padY + (1 - v) * innerH
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function MiniChart({
  series,
  position,
}: {
  series: keyof typeof MINI_CHART_SERIES
  position: 'tl' | 'tr' | 'bl' | 'br'
}) {
  const cfg = MINI_CHART_SERIES[series]
  const W = 180
  const H = 72
  const color =
    cfg.tone === 'up-bad'
      ? 'var(--sl-crit)'
      : cfg.tone === 'down-bad'
      ? 'var(--sl-warn)'
      : 'var(--sl-good)'
  const deltaArrow =
    cfg.tone === 'down-bad' ? '\u2193' : '\u2191'
  const deltaLabel =
    cfg.tone === 'up-bad'
      ? '+2.4%'
      : cfg.tone === 'down-bad'
      ? '\u22121.1%'
      : '+0.6%'
  const posClass =
    position === 'tl'
      ? 'left-6 top-6'
      : position === 'tr'
      ? 'right-6 top-6'
      : position === 'bl'
      ? 'left-6 bottom-28'
      : 'right-6 bottom-28'
  const path = buildChartPath(cfg.points, W, H)
  return (
    <div
      data-mini-chart={series}
      className={`pointer-events-none absolute z-10 hidden md:block ${posClass}`}
      style={{
        width: W,
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      <div
        className="rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-wider"
        style={{
          background: 'var(--sl-surface-glass)',
          backdropFilter: 'blur(10px)',
          borderColor: 'var(--sl-border-strong)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-fg-muted">{cfg.label}</span>
          <span style={{ color }}>
            {deltaArrow} {deltaLabel}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          className="mt-1 block"
          aria-hidden
        >
          <path
            data-chart-line={series}
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </svg>
        <div className="mt-1 flex items-center gap-1 text-[9px] text-fg-dim">
          <span className="relative flex h-1 w-1">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: color }}
            />
            <span
              className="relative inline-flex h-1 w-1 rounded-full"
              style={{ background: color }}
            />
          </span>
          <span>{cfg.note}</span>
        </div>
      </div>
    </div>
  )
}

function useClock() {
  const [time, setTime] = useState<string>(() => {
    const d = new Date()
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(
      d.getUTCHours(),
    ).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`
  })
  useEffect(() => {
    const id = window.setInterval(() => {
      const d = new Date()
      setTime(
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(
          d.getUTCHours(),
        ).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`,
      )
    }, 1000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

function VesselGlyph({
  vessel,
  baseX,
  baseY,
}: {
  vessel: (typeof VESSELS)[number]
  baseX: number
  baseY: number
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      data-vessel={vessel.id}
      className="pointer-events-auto absolute"
      style={{
        left: `calc(50% + ${baseX}px)`,
        top: `calc(50% + ${baseY}px)`,
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, opacity',
        opacity: 0,
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <svg
        width="26"
        height="10"
        viewBox="0 0 26 10"
        fill="none"
        aria-hidden
        style={{
          filter:
            'drop-shadow(0 0 3px color-mix(in oklab, var(--sl-crit) 50%, transparent))',
        }}
      >
        {/* wake */}
        <path
          d="M-6 5h6"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* hull (top-down tanker silhouette) */}
        <path
          d="M2 5 L5 3 L21 3 L24 5 L21 7 L5 7 Z"
          fill="#e8ecf1"
          fillOpacity="0.92"
          stroke="#0a0e13"
          strokeWidth="0.6"
        />
        <rect x="10" y="4" width="6" height="2" fill="#0a0e13" opacity="0.7" />
      </svg>
      {hovered && (
        <div
          className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-[200px] -translate-x-1/2 rounded-md border p-2 font-mono text-[10px] uppercase tracking-wider shadow-[var(--sl-glow-accent)]"
          style={{
            background: 'var(--sl-surface-glass)',
            backdropFilter: 'blur(10px)',
            borderColor: 'var(--sl-border-strong)',
          }}
        >
          <div className="text-fg">{vessel.name}</div>
          <div className="mt-0.5 text-fg-muted">
            {vessel.classLabel} · Stalled {vessel.stalledHours}h
          </div>
        </div>
      )}
    </div>
  )
}

export default function Section01Hero() {
  const prefersReduced = usePrefersReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [runAnim, setRunAnim] = useState(false)
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0)

  const animRef = useRef<HeroAnimState>({ ...DEFAULT_FINAL_STATE })
  const rootRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const hormuzOverlayRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const blurRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<HTMLDivElement>(null)
  const datasourceRef = useRef<HTMLDivElement>(null)
  const smallRadarRef = useRef<HTMLDivElement>(null)

  const clock = useClock()

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < MOBILE_BP)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const skip = prefersReduced || isMobile
    if (skip) {
      animRef.current = { ...DEFAULT_FINAL_STATE }
      setRunAnim(false)
      setPhase(4)
      return
    }
    animRef.current = { ...PHASE1_START_STATE }
    setRunAnim(true)
    setPhase(1)
  }, [mounted, prefersReduced, isMobile])

  // GSAP master timeline
  useEffect(() => {
    if (!runAnim) return
    const state = animRef.current

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      // ─── PHASE 1 — THE STALL (0.0 → 1.5s) ───
      // HUD + corridor + vessels + radar + ticker fade in
      tl.set(
        ['[data-phase1-overlay]', '[data-vessel]', '[data-news-ticker]'],
        { opacity: 0 },
      )
      tl.to(
        ['[data-phase1-overlay]'],
        { opacity: 1, duration: 0.4, ease: 'power1.out' },
        0,
      )
      tl.to(
        '[data-vessel]',
        {
          opacity: 1,
          duration: 0.4,
          ease: 'power1.out',
          stagger: 0.04,
        },
        0.1,
      )
      tl.to(
        '[data-news-ticker]',
        { opacity: 1, duration: 0.4, ease: 'power1.out' },
        0,
      )
      // Microscopic vessel drift during stall
      gsap.utils.toArray<HTMLElement>('[data-vessel]').forEach((el, i) => {
        gsap.to(el, {
          x: '+=1.2',
          y: i % 2 === 0 ? '+=0.8' : '-=0.8',
          duration: 2 + (i % 3) * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      // ─── PHASE 2 — THE PULLBACK (1.5 → 3.2s) ───
      // Red flash
      tl.fromTo(
        '[data-red-flash]',
        { opacity: 0 },
        { opacity: 1, duration: 0.08, ease: 'power2.out' },
        1.5,
      )
      tl.to(
        '[data-red-flash]',
        { opacity: 0, duration: 0.27, ease: 'power2.in' },
        1.58,
      )
      // Motion blur overlay (Phase 2 only, peak during high-velocity)
      tl.fromTo(
        '[data-motion-blur]',
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power1.out' },
        1.55,
      )
      tl.to(
        '[data-motion-blur]',
        { opacity: 0, duration: 0.4, ease: 'power1.in' },
        2.7,
      )
      // Camera pullback — tween state fields; CameraController reads animRef
      tl.to(
        state,
        {
          cameraZ: DEFAULT_FINAL_STATE.cameraZ,
          cameraY: DEFAULT_FINAL_STATE.cameraY,
          globeScale: DEFAULT_FINAL_STATE.globeScale,
          globeRotX: DEFAULT_FINAL_STATE.globeRotX,
          duration: 1.7,
          ease: 'expo.out',
        },
        1.5,
      )
      // Globe spins ~540° during pullback, decelerating
      tl.to(
        state,
        {
          globeRotY: state.globeRotY + Math.PI * 3, // 540°
          duration: 1.7,
          ease: 'power3.out',
        },
        1.5,
      )
      // Fade Phase 1 overlays out as camera moves
      tl.to(
        ['[data-phase1-overlay]', '[data-vessel]'],
        { opacity: 0, duration: 0.4, ease: 'power2.in' },
        1.7,
      )
      // Markers fade in once scale settles
      tl.to(
        state,
        { markerOpacity: 1, duration: 0.6, ease: 'power1.out' },
        2.8,
      )

      // ─── PHASE 3 — THE CASCADE (3.2 → 4.5s) ───
      tl.call(() => setPhase(3), undefined, 3.2)
      // Cascade arcs + card mount gate
      tl.to(
        state,
        { cascadeOpacity: 1, duration: 0.4, ease: 'power1.out' },
        3.2,
      )
      // Alert cards slide in from outside, staggered 90ms
      const CARD_ENTRY = [
        { tx: -120, ty: -30 },
        { tx: 120, ty: -40 },
        { tx: 140, ty: 60 },
        { tx: -140, ty: 80 },
        { tx: 160, ty: -80 },
        { tx: -90, ty: 120 },
      ]
      CASCADE_ALERTS.forEach((a, i) => {
        const e = CARD_ENTRY[i % CARD_ENTRY.length]
        tl.fromTo(
          `[data-cascade-card="${a.id}"]`,
          { opacity: 0, x: e.tx, y: e.ty },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.55,
            ease: 'expo.out',
          },
          3.2 + i * 0.09,
        )
      })
      // Mini chart windows — fade in + draw their line path
      tl.fromTo(
        '[data-mini-chart]',
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.1,
        },
        3.4,
      )
      // Stroke-dasharray draw-in per chart
      gsap.utils.toArray<SVGPathElement>('[data-chart-line]').forEach((p, i) => {
        try {
          const len = p.getTotalLength()
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
          tl.to(
            p,
            {
              strokeDashoffset: 0,
              duration: 0.8,
              ease: 'power2.out',
            },
            3.4 + i * 0.1,
          )
        } catch {
          // getTotalLength may fail in rare envs; leave line static
        }
      })

      // ─── PHASE 4 — SETTLE (4.5 → 5.2s) ───
      tl.call(() => setPhase(4), undefined, 4.5)
      tl.to(
        state,
        {
          autoRotateSpeed: DEFAULT_FINAL_STATE.autoRotateSpeed,
          duration: 0.6,
          ease: 'power1.out',
        },
        4.3,
      )
      // Headline char-by-char reveal
      const chars = gsap.utils.toArray<HTMLElement>('[data-headline-char]')
      tl.fromTo(
        chars,
        { opacity: 0, y: '0.8em' },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'expo.out',
          stagger: 0.04,
        },
        4.5,
      )
      tl.fromTo(
        subheadRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' },
        5.1,
      )
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' },
        5.3,
      )
      tl.fromTo(
        [chipRef.current, badgeRef.current, datasourceRef.current],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
        5.3,
      )
      // Phase 4 persistent subtle radar at Hormuz
      tl.to(
        smallRadarRef.current,
        { opacity: 0.5, duration: 0.5 },
        4.5,
      )
      // Gentle pulsing of cascade cards
      tl.to(
        '[data-cascade-card]',
        {
          opacity: 0.75,
          duration: 1.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        },
        5.5,
      )
    }, rootRef)

    return () => ctx.revert()
  }, [runAnim])

  return (
    <section
      ref={rootRef}
      data-section="1"
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top, color-mix(in srgb, var(--sl-accent) 8%, transparent) 0%, var(--sl-bg-0) 55%), var(--sl-bg)',
      }}
    >
      <CursorSpotlight radius={500} />
      <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-60" />
      <div className="sl-noise" />

      {/* Live chip */}
      <div
        ref={chipRef}
        className="pointer-events-none absolute right-6 top-6 z-20 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-mono"
        style={{
          borderColor: 'var(--sl-border)',
          background: 'var(--sl-surface-glass)',
          backdropFilter: 'blur(10px)',
          opacity: runAnim ? 0 : 1,
        }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: 'var(--sl-crit)' }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--sl-crit)' }}
          />
        </span>
        <span className="text-fg-muted">Live · 8 active disruptions</span>
      </div>

      {/* Globe layer */}
      <ParallaxLayer
        speed={0.3}
        max={16}
        className="absolute inset-0 flex items-center justify-center px-[120px] py-20"
      >
        <div className="relative aspect-square w-full max-w-[min(780px,calc(100vmin-160px))]">
          <HeroGlobe animRef={animRef} />
        </div>
      </ParallaxLayer>

      {/* ─── PHASE 1 overlays: Hormuz stall ─── */}
      {runAnim && phase < 3 ? (
        <div
          ref={hormuzOverlayRef}
          data-phase1-overlay
          className="pointer-events-none absolute inset-0 z-[15]"
          style={{ opacity: 0 }}
        >
          {/* HUD readout top-left */}
          <div
            ref={hudRef}
            className="pointer-events-none absolute left-6 top-6 font-mono text-[11px] leading-[1.7] uppercase tracking-[0.18em]"
            style={{ color: 'var(--sl-fg-dim)' }}
          >
            <div>LIVE · {clock}</div>
            <div>26.5667° N · 56.2500° E</div>
            <div>
              <span style={{ color: 'var(--sl-fg-muted)' }}>DEPTH 60m</span>{' '}
              ·{' '}
              <span style={{ color: 'var(--sl-crit)' }}>TRAFFIC: STALLED</span>
            </div>
          </div>

          {/* Red corridor + scan line — centered at viewport middle */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 'min(680px, 72vw)',
              height: 'min(180px, 22vh)',
            }}
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-[2px]"
              style={{
                background: 'var(--sl-crit)',
                opacity: 0.18,
                transform: 'skewX(-12deg)',
              }}
            />
            <div
              className="sl-hormuz-scan absolute inset-0 overflow-hidden"
              style={{ transform: 'skewX(-12deg)' }}
            />
          </div>

          {/* Radar sweep circle, centered */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: 220, height: 220 }}
            aria-hidden
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="sl-radar-ring absolute inset-0 rounded-full border"
                style={{
                  borderColor: 'var(--sl-crit)',
                  opacity: 0,
                  animation: `sl-radar-pulse 1.8s ${
                    i * 0.6
                  }s cubic-bezier(0.25, 1, 0.5, 1) infinite`,
                }}
              />
            ))}
          </div>

          {/* Vessels — tight grouping near viewport center, the "strait" */}
          <div className="pointer-events-auto absolute inset-0">
            {VESSELS.map((v) => (
              <VesselGlyph
                key={v.id}
                vessel={v}
                baseX={v.x * 320}
                baseY={v.y * 180}
              />
            ))}
          </div>

          {/* Bottom pill */}
          <div
            className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{
              borderColor: 'var(--sl-crit)',
              background: 'var(--sl-surface-glass)',
              backdropFilter: 'blur(10px)',
              color: 'var(--sl-fg)',
            }}
          >
            <span style={{ color: 'var(--sl-crit)' }}>●</span> Strait of
            Hormuz · 14 Vessels Stalled · +72h
          </div>
        </div>
      ) : null}

      {/* Red flash (Phase 2) */}
      <div
        ref={flashRef}
        data-red-flash
        className="pointer-events-none absolute inset-0 z-[30]"
        style={{
          background: 'var(--sl-crit)',
          mixBlendMode: 'screen',
          opacity: 0,
        }}
      />

      {/* Motion blur overlay (Phase 2) */}
      <div
        ref={blurRef}
        data-motion-blur
        className="pointer-events-none absolute inset-0 z-[18]"
        style={{
          opacity: 0,
          background:
            'radial-gradient(closest-side, transparent 40%, rgb(7 9 13 / 0.55) 100%)',
          backdropFilter: 'blur(6px)',
        }}
      />

      {/* Persistent small radar at Hormuz (Phase 4) */}
      <div
        ref={smallRadarRef}
        className="pointer-events-none absolute z-[12]"
        style={{
          left: 'calc(50% + 120px)',
          top: 'calc(50% - 30px)',
          width: 36,
          height: 36,
          opacity: 0,
        }}
        aria-hidden
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border"
            style={{
              borderColor: 'var(--sl-crit)',
              opacity: 0,
              animation: `sl-radar-pulse 2.6s ${i * 1.0}s cubic-bezier(0.25, 1, 0.5, 1) infinite`,
            }}
          />
        ))}
      </div>

      {/* Mini charts */}
      <MiniChart series="wti" position="tl" />
      <MiniChart series="vix" position="tr" />
      <MiniChart series="spx" position="bl" />
      <MiniChart series="dxy" position="br" />

      {/* News ticker */}
      <div
        data-news-ticker
        className="pointer-events-none absolute bottom-3 left-0 right-0 z-[14] overflow-hidden font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: 'var(--sl-fg-dim)', opacity: runAnim ? 0 : 1 }}
      >
        <div
          className="sl-marquee flex min-w-max gap-10 px-6"
          style={{ ['--sl-marquee-dur' as string]: '48s' }}
        >
          {[...NEWS_TICKER_ITEMS, ...NEWS_TICKER_ITEMS, ...NEWS_TICKER_ITEMS].map(
            (t, i) => (
              <span key={i}>
                {t} <span className="px-3 text-fg-dim">•</span>
              </span>
            ),
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[16] mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
        <div
          ref={badgeRef}
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em]"
          style={{
            borderColor: 'var(--sl-border)',
            background: 'var(--sl-surface-glass)',
            color: 'var(--sl-fg-muted)',
            backdropFilter: 'blur(10px)',
            opacity: runAnim ? 0 : 1,
          }}
        >
          <span
            className="inline-block h-1 w-1 rounded-full"
            style={{ background: 'var(--sl-accent)' }}
          />
          Macro intelligence · operator language
        </div>

        <h1
          ref={headlineRef}
          aria-label={HEADLINE}
          className="max-w-4xl font-display text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-fg"
        >
          {Array.from(HEADLINE).map((ch, i) => (
            <span
              key={i}
              data-headline-char
              aria-hidden
              style={{
                display: 'inline-block',
                whiteSpace: ch === ' ' ? 'pre' : 'normal',
                opacity: runAnim ? 0 : 1,
                willChange: 'transform, opacity',
              }}
            >
              {ch}
            </span>
          ))}
        </h1>

        <p
          ref={subheadRef}
          className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg"
          style={{ opacity: runAnim ? 0 : 1 }}
        >
          {SUBHEAD}
        </p>

        <div
          ref={ctaRef}
          className="mt-10 flex flex-wrap items-center gap-3"
          style={{ opacity: runAnim ? 0 : 1 }}
        >
          <MagneticButton href="/sign-up" variant="primary" glow>
            Start 14-day trial
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 7h8M7 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <Link
            href="#sample-briefing"
            className="inline-flex items-center gap-2 rounded-[var(--sl-radius-md)] px-6 py-3 text-sm font-medium text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-accent)]"
          >
            See a sample briefing
            <span aria-hidden>↓</span>
          </Link>
        </div>

        <div
          ref={datasourceRef}
          className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-dim"
          style={{ opacity: runAnim ? 0 : 1 }}
        >
          <span>FRED · BLS · EIA · USDA</span>
          <span aria-hidden>•</span>
          <span>44 indicators tracked</span>
          <span aria-hidden>•</span>
          <span>Intelligence, not advice</span>
        </div>
      </div>
    </section>
  )
}
