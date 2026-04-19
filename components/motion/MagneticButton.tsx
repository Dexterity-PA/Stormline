'use client'

import Link from 'next/link'
import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Common = {
  children: ReactNode
  variant?: Variant
  maxOffset?: number
  className?: string
  glow?: boolean
}

type AsLink = Common & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'ref'>
type AsButton = Common & { href?: undefined } & ComponentPropsWithoutRef<'button'>

type Props = AsLink | AsButton

function useMagnet(max: number) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (prefersReduced || isTouch) return

    let raf = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      tx = Math.max(-1, Math.min(1, dx)) * max
      ty = Math.max(-1, Math.min(1, dy)) * max
    }
    const onLeave = () => {
      tx = 0
      ty = 0
    }
    const animate = () => {
      cx += (tx - cx) * 0.18
      cy += (ty - cy) * 0.18
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = requestAnimationFrame(animate)
    }
    el.addEventListener('pointermove', onMove as EventListener)
    el.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(animate)
    return () => {
      el.removeEventListener('pointermove', onMove as EventListener)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [max])

  return ref
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-[var(--sl-radius-md)] px-6 py-3 text-sm font-medium transition-colors duration-200 will-change-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-accent)]'

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--sl-fg)',
    color: 'var(--sl-bg-0)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--sl-fg)',
    border: '1px solid var(--sl-border-strong)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--sl-fg-muted)',
  },
}

const MagneticButton = forwardRef<HTMLElement, Props>(function MagneticButton(
  { children, variant = 'primary', maxOffset = 8, className = '', glow = false, ...rest },
) {
  const magnetRef = useMagnet(maxOffset)

  const style: React.CSSProperties = {
    ...variantStyles[variant],
    boxShadow: glow && variant === 'primary' ? 'var(--sl-glow-accent)' : undefined,
  }

  if ('href' in rest && rest.href) {
    const { href, ...linkProps } = rest
    return (
      <Link
        {...linkProps}
        href={href}
        ref={magnetRef as React.RefObject<HTMLAnchorElement>}
        className={`${base} ${className}`}
        style={style}
      >
        {children}
      </Link>
    )
  }

  const btnProps = rest as ComponentPropsWithoutRef<'button'>
  return (
    <button
      {...btnProps}
      ref={magnetRef as React.RefObject<HTMLButtonElement>}
      className={`${base} ${className}`}
      style={style}
    >
      {children}
    </button>
  )
})

export default MagneticButton
