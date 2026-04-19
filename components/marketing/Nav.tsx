import Link from 'next/link'
import ThemeToggle from '@/components/motion/ThemeToggle'

export default function Nav() {
  return (
    <header
      className="sticky top-0 z-[var(--z-sticky)] border-b"
      style={{
        borderColor: 'var(--sl-border)',
        background: 'color-mix(in srgb, var(--sl-bg) 80%, transparent)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          aria-label="Stormline home"
          className="group inline-flex items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG, no benefit from next/image */}
          <img
            src="/brand/logo.svg"
            alt="Stormline"
            width={360}
            height={72}
            className="h-7 w-auto select-none"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 text-sm text-fg-muted md:flex"
        >
          <Link href="#pillars" className="transition-colors hover:text-fg">
            Product
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-fg">
            Pricing
          </Link>
          <Link href="#sample-briefing" className="transition-colors hover:text-fg">
            Sample briefing
          </Link>
          <Link href="/about" className="transition-colors hover:text-fg">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="hidden text-sm text-fg-muted transition-colors hover:text-fg sm:inline-flex sm:px-2"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 rounded-[var(--sl-radius-md)] px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sl-accent)]"
            style={{ background: 'var(--sl-fg)', color: 'var(--sl-bg-0)' }}
          >
            Start trial
          </Link>
        </div>
      </div>
    </header>
  )
}
