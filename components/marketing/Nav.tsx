import Link from 'next/link'

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-fg"
        >
          Stormline
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-8 text-sm text-fg-muted sm:flex"
        >
          <Link href="/pricing" className="transition-colors hover:text-fg">
            Pricing
          </Link>
          <Link href="/about" className="transition-colors hover:text-fg">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm text-fg-muted transition-colors hover:text-fg sm:inline"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
