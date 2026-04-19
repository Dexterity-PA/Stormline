'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type Props = {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  format?: (n: number) => string
}

const defaultFormat = (n: number, d: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })

export default function NumberRoll({
  value,
  duration = 1800,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  format,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [started, setStarted] = useState(false)
  const [display, setDisplay] = useState(0)
  const shownValue = prefersReduced ? value : display

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
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [prefersReduced])

  useEffect(() => {
    if (!started || prefersReduced) return
    const start = performance.now()
    let raf = 0
    const ease = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setDisplay(value * ease(t))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, value, duration, prefersReduced])

  const out = format ? format(shownValue) : defaultFormat(shownValue, decimals)

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {prefix}
      {out}
      {suffix}
    </span>
  )
}
