'use client'

export default function PageIntroWipe() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[var(--z-top)]"
      style={{
        background: 'var(--sl-bg-0)',
        animation: 'sl-wipe-out 1200ms 120ms var(--sl-ease-out-expo) forwards',
        willChange: 'clip-path, opacity',
      }}
    />
  )
}
