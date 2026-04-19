import Link from 'next/link'

const DISCLAIMER =
  'Stormline provides market intelligence, not financial, legal, or tax advice. Consult licensed professionals for decisions specific to your business.'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-base font-semibold text-fg">
              Stormline
            </span>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Macro intelligence for the businesses that can&rsquo;t afford a CFO.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-fg-muted">
              Product
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/pricing" className="text-fg-muted transition-colors hover:text-fg">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/industries/restaurants" className="text-fg-muted transition-colors hover:text-fg">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/industries/construction" className="text-fg-muted transition-colors hover:text-fg">
                  Construction
                </Link>
              </li>
              <li>
                <Link href="/industries/retail" className="text-fg-muted transition-colors hover:text-fg">
                  Retail
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-fg-muted">
              Company
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-fg-muted transition-colors hover:text-fg">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-fg-muted">
              Legal
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/legal/terms" className="text-fg-muted transition-colors hover:text-fg">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-fg-muted transition-colors hover:text-fg">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className="text-fg-muted transition-colors hover:text-fg">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Persistent disclaimer + copyright */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-fg-muted">
            {DISCLAIMER}
          </p>
          <p className="mt-4 text-xs text-fg-muted">
            &copy; {new Date().getFullYear()} Stormline. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
