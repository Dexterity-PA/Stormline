'use client'

import { useEffect, useRef } from 'react'

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return

    let ticking = false
    const update = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const p = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0
      el.style.transform = `scaleX(${p})`
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-top)] h-[2px]"
      style={{ background: 'color-mix(in srgb, var(--sl-border) 50%, transparent)' }}
    >
      <div
        ref={barRef}
        className="h-full origin-left"
        style={{
          background:
            'linear-gradient(90deg, var(--sl-accent) 0%, var(--sl-cyan) 100%)',
          transform: 'scaleX(0)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
