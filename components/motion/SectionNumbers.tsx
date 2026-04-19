'use client'

import { useEffect, useState } from 'react'

type Props = {
  total?: number
}

export default function SectionNumbers({ total = 14 }: Props) {
  const [current, setCurrent] = useState(1)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-section]'),
      )
      if (sections.length === 0) return
      const mid = window.innerHeight * 0.4
      let active = 1
      for (const s of sections) {
        const r = s.getBoundingClientRect()
        if (r.top <= mid) {
          const n = Number(s.dataset.section)
          if (!Number.isNaN(n)) active = n
        }
      }
      setCurrent(active)

      const last = sections[sections.length - 1]
      if (last) {
        const r = last.getBoundingClientRect()
        setHidden(r.top < window.innerHeight * 0.2 && r.bottom < window.innerHeight * 0.6)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-4 top-1/2 z-[var(--z-sticky)] hidden -translate-y-1/2 flex-col gap-1 lg:flex"
      style={{
        fontFamily: 'var(--sl-font-mono)',
        color: 'var(--sl-fg-dim)',
        fontSize: '11px',
        letterSpacing: '0.08em',
        opacity: hidden ? 0 : 1,
        transition: 'opacity 400ms var(--sl-ease-out-expo)',
      }}
    >
      <span style={{ color: 'var(--sl-accent)' }}>
        {String(current).padStart(2, '0')}
      </span>
      <span>/</span>
      <span>{String(total).padStart(2, '0')}</span>
    </div>
  )
}
