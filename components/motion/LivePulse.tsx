'use client'

import type { CSSProperties } from 'react'

type Props = {
  color?: 'accent' | 'warn' | 'crit' | 'good' | 'cyan'
  size?: number
  className?: string
}

const map = {
  accent: 'var(--sl-accent)',
  warn: 'var(--sl-warn)',
  crit: 'var(--sl-crit)',
  good: 'var(--sl-good)',
  cyan: 'var(--sl-cyan)',
}

export default function LivePulse({ color = 'accent', size = 8, className = '' }: Props) {
  const c = map[color]
  const style: CSSProperties = { width: size, height: size, background: c }
  const ringStyle: CSSProperties = {
    borderColor: c,
    boxShadow: `0 0 0 1px ${c}`,
  }
  return (
    <span className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full" style={style} />
      <span
        className="sl-pulse-ring absolute inset-0 rounded-full border"
        style={ringStyle}
        aria-hidden
      />
      <span
        className="sl-pulse-ring absolute inset-0 rounded-full border"
        style={{ ...ringStyle, animationDelay: '700ms' }}
        aria-hidden
      />
    </span>
  )
}
