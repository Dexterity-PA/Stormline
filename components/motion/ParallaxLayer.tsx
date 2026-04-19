'use client'

import { useEffect, useRef, type CSSProperties, type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  speed?: number
  max?: number
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: CSSProperties
}>

export default function ParallaxLayer({
  children,
  speed = 0.2,
  max = 12,
  as = 'div',
  className = '',
  style,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let raf = 0
    let ticking = false
    const update = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const mid = r.top + r.height / 2 - vh / 2
      const offset = Math.max(-max, Math.min(max, -mid * speed * 0.05))
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`
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
  }, [speed, max])

  const Tag = as as 'div'
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={{ willChange: 'transform', ...style }}
    >
      {children}
    </Tag>
  )
}
