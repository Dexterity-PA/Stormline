'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type Props = {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  strokeWidth?: number
  className?: string
  showArea?: boolean
  showDots?: boolean
  duration?: number
  ariaLabel?: string
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const mx = (p0.x + p1.x) / 2
    d += ` Q ${mx.toFixed(2)} ${p0.y.toFixed(2)}, ${mx.toFixed(2)} ${((p0.y + p1.y) / 2).toFixed(2)}`
    d += ` T ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`
  }
  return d
}

export default function ChartLive({
  data,
  width = 600,
  height = 180,
  stroke = 'var(--sl-accent)',
  fill = 'var(--sl-accent)',
  strokeWidth = 2,
  className = '',
  showArea = true,
  showDots = false,
  duration = 1600,
  ariaLabel,
}: Props) {
  const ref = useRef<SVGSVGElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [started, setStarted] = useState(false)
  const active = started || prefersReduced
  const gradId = useId()

  const { linePath, areaPath, min, max } = useMemo(() => {
    const pad = 8
    const n = data.length
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const points = data.map((v, i) => ({
      x: pad + (i * (width - pad * 2)) / Math.max(1, n - 1),
      y: pad + (1 - (v - min) / range) * (height - pad * 2),
    }))
    const linePath = smoothPath(points)
    const areaPath = `${linePath} L ${(width - pad).toFixed(2)} ${height - pad} L ${pad} ${height - pad} Z`
    return { linePath, areaPath, min, max }
  }, [data, width, height])

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [prefersReduced])

  useEffect(() => {
    if (!active) return
    const p = pathRef.current
    if (!p) return
    const len = p.getTotalLength()
    p.style.setProperty('--sl-path-len', String(len))
    p.style.setProperty('--sl-draw-dur', `${duration}ms`)
  }, [active, duration])

  const lastY =
    data.length > 0
      ? 8 + (1 - (data[data.length - 1] - min) / ((max - min) || 1)) * (height - 16)
      : 0

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      className={className}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showArea && active && (
        <path
          d={areaPath}
          fill={`url(#${gradId})`}
          style={{
            opacity: 0,
            animation: prefersReduced
              ? undefined
              : `sl-reveal-up ${duration}ms var(--sl-ease-out-expo) forwards`,
            animationDelay: `${duration * 0.4}ms`,
            ...(prefersReduced ? { opacity: 1 } : null),
          }}
        />
      )}
      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active && !prefersReduced ? 'sl-path-draw' : ''}
        style={
          active
            ? undefined
            : { strokeDasharray: 10000, strokeDashoffset: 10000 }
        }
      />
      {showDots && active && data.length > 0 && (
        <circle cx={width - 8} cy={lastY} r={3} fill={stroke} />
      )}
    </svg>
  )
}
