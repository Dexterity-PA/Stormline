'use client'

import { useSyncExternalStore } from 'react'

function subscribe(cb: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

const getSnapshot = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const getServerSnapshot = () => false

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
