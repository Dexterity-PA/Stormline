'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'

type Props = {
  message: ReactNode
  href?: string
  cta?: string
  defaultOpen?: boolean
}

export default function AnnouncementBar({
  message,
  href,
  cta,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  if (!open) return null

  const inner = (
    <span className="flex items-center gap-2 text-xs">
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: 'var(--sl-accent)' }}
      />
      <span>{message}</span>
      {cta && (
        <span
          className="ml-1 font-medium underline-offset-4 group-hover:underline"
          style={{ color: 'var(--sl-accent)' }}
        >
          {cta} →
        </span>
      )}
    </span>
  )

  return (
    <div
      className="relative z-[var(--z-sticky)] w-full border-b"
      style={{
        borderColor: 'var(--sl-border)',
        background: 'color-mix(in srgb, var(--sl-bg-elev) 70%, transparent)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-fg-muted">
        {href ? (
          <Link href={href} className="group flex items-center">
            {inner}
          </Link>
        ) : (
          inner
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Dismiss announcement"
          className="rounded p-1 text-fg-dim transition-colors hover:text-fg"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
