'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode[]
  direction?: 'left' | 'right'
  duration?: number
  reverseOnScroll?: boolean
  pauseOnHover?: boolean
  className?: string
}

export default function TickerBand({
  children,
  direction = 'left',
  duration = 60,
  reverseOnScroll = true,
  pauseOnHover = true,
  className = '',
}: Props) {
  const [paused, setPaused] = useState(false)
  const [dir, setDir] = useState<'left' | 'right'>(direction)
  const lastY = useRef(0)

  useEffect(() => {
    if (!reverseOnScroll) return
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastY.current + 2) setDir(direction)
      else if (y < lastY.current - 2) setDir(direction === 'left' ? 'right' : 'left')
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reverseOnScroll, direction])

  const items = [...children, ...children]

  return (
    <div
      className={`sl-mask-fade-x relative overflow-hidden ${className}`}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => pauseOnHover && setPaused(false)}
    >
      <div
        className={`flex w-max gap-4 ${paused ? 'sl-marquee-paused' : ''} ${dir === 'right' ? 'sl-marquee-r' : 'sl-marquee'}`}
        style={{ ['--sl-marquee-dur' as string]: `${duration}s` }}
      >
        {items.map((child, i) => (
          <div key={i} className="shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
