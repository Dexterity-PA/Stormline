'use client'

import { useEffect, useRef, useState, type CSSProperties, type PropsWithChildren } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type Props = PropsWithChildren<{
  delay?: number
  duration?: number
  offset?: number
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  once?: boolean
  threshold?: number
}>

export default function RevealOnScroll({
  children,
  delay = 0,
  duration = 700,
  offset = 20,
  as = 'div',
  className = '',
  once = true,
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [shown, setShown] = useState(false)
  const visible = shown || prefersReduced

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            if (once) io.disconnect()
          } else if (!once) {
            setShown(false)
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once, threshold, prefersReduced])

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate3d(0,0,0)' : `translate3d(0, ${offset}px, 0)`,
    transition: `opacity ${duration}ms var(--sl-ease-out-expo) ${delay}ms, transform ${duration}ms var(--sl-ease-out-expo) ${delay}ms`,
    willChange: 'transform, opacity',
  }

  const Tag = as as 'div'
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={className} style={style}>
      {children}
    </Tag>
  )
}
