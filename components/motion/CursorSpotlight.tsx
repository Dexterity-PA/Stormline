'use client'

import { useEffect, useRef } from 'react'

type Props = {
  radius?: number
  color?: string
  className?: string
}

export default function CursorSpotlight({
  radius = 420,
  color = 'var(--sl-spotlight)',
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReduced) return

    const parent = el.parentElement
    if (!parent) return

    let raf = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect()
      tx = e.clientX - r.left
      ty = e.clientY - r.top
      el.style.opacity = '1'
    }
    const onLeave = () => {
      el.style.opacity = '0'
    }
    const animate = () => {
      cx += (tx - cx) * 0.16
      cy += (ty - cy) * 0.16
      el.style.transform = `translate3d(${cx - radius}px, ${cy - radius}px, 0)`
      raf = requestAnimationFrame(animate)
    }

    parent.addEventListener('pointermove', onMove)
    parent.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(animate)
    return () => {
      parent.removeEventListener('pointermove', onMove)
      parent.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [radius])

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ${className}`}
    >
      <div
        className="absolute"
        style={{
          width: radius * 2,
          height: radius * 2,
          background: `radial-gradient(circle at center, ${color}, transparent 65%)`,
          filter: 'blur(8px)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
