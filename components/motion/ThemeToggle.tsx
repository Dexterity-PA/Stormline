'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light'

function subscribe(cb: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: light)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getSnapshot = () =>
  window.matchMedia('(prefers-color-scheme: light)').matches
const getServerSnapshot = () => false

function usePrefersLight(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export default function ThemeToggle() {
  const systemLight = usePrefersLight()
  const [override, setOverride] = useState<Theme | null>(null)
  const theme: Theme = override ?? (systemLight ? 'light' : 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => {
    setOverride(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative flex h-8 w-8 items-center justify-center rounded-md border text-fg-muted transition-colors hover:border-accent hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-accent)]"
      style={{ borderColor: 'var(--sl-border)' }}
    >
      {theme === 'dark' ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M11.5 8.5A4.5 4.5 0 015.5 2.5 5 5 0 1011.5 8.5z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="2.8" stroke="currentColor" strokeWidth="1.3" />
          <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1 1M10.2 10.2l1 1M2.8 11.2l1-1M10.2 3.8l1-1" />
          </g>
        </svg>
      )}
    </button>
  )
}
