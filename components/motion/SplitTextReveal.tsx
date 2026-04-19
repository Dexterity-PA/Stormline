'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type Props = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  mode?: 'char' | 'word'
  stagger?: number
  delay?: number
  duration?: number
  className?: string
  gradient?: boolean
  trigger?: 'mount' | 'scroll'
  threshold?: number
}

export default function SplitTextReveal({
  text,
  as = 'h1',
  mode = 'word',
  stagger,
  delay = 0,
  duration = 900,
  className = '',
  gradient = false,
  trigger = 'scroll',
  threshold = 0.3,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [active, setActive] = useState(false)
  const shown = active || prefersReduced

  const autoStagger = stagger ?? (mode === 'char' ? 18 : 45)

  useEffect(() => {
    if (prefersReduced) return
    if (trigger === 'mount') {
      const t = window.setTimeout(() => setActive(true), 60)
      return () => window.clearTimeout(t)
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true)
            io.disconnect()
          }
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [trigger, threshold, prefersReduced])

  const tokens =
    mode === 'char'
      ? Array.from(text).map((c) => (c === ' ' ? '\u00A0' : c))
      : text.split(/(\s+)/)

  const Tag = as as 'h1'

  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={`${gradient ? 'sl-text-gradient' : ''} ${className}`}
      aria-label={text}
    >
      {tokens.map((t, i) => {
        if (/^\s+$/.test(t)) return <span key={i}>{t}</span>
        const itemDelay = delay + i * autoStagger
        const style: CSSProperties = {
          display: 'inline-block',
          opacity: shown ? 1 : 0,
          transform: shown ? 'translate3d(0,0,0)' : 'translate3d(0, 1em, 0)',
          transition: `opacity ${duration}ms var(--sl-ease-out-expo) ${itemDelay}ms, transform ${duration}ms var(--sl-ease-out-expo) ${itemDelay}ms`,
          willChange: 'transform, opacity',
        }
        return (
          <span key={i} aria-hidden style={style} className={mode === 'char' ? 'sl-split-char' : 'sl-split-word'}>
            {t}
          </span>
        )
      })}
    </Tag>
  )
}
