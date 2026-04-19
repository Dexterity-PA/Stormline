import Link from 'next/link'

const DISCLAIMER =
  'Stormline provides market intelligence, not financial, legal, or tax advice. Every claim is linked to a primary public data source. Consult licensed professionals for decisions specific to your business.'

const SOURCES: readonly string[] = [
  'FRED',
  'EIA',
  'USDA AMS',
  'BLS',
  'Census',
  'OpenTable',
  'ICE BofA',
  'Federal Reserve G.19',
  'DAT',
  'U-Michigan',
]

type LinkRow = { label: string; href: string; external?: boolean }

const COLS: readonly { title: string; links: readonly LinkRow[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Sample briefing', href: '/industries/restaurants' },
      { label: 'Indicator library', href: '/indicators' },
      { label: 'Compare', href: '/compare' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Restaurants', href: '/industries/restaurants' },
      { label: 'Light construction', href: '/industries/construction' },
      { label: 'Independent retail', href: '/industries/retail' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: 'mailto:hello@stormline.co' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', href: '/legal/terms' },
      { label: 'Privacy policy', href: '/legal/privacy' },
      { label: 'Disclaimer', href: '/legal/disclaimer' },
    ],
  },
]

function Wordmark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG, no benefit from next/image
    <img
      src="/brand/logo.svg"
      alt="Stormline"
      width={360}
      height={72}
      className="h-[clamp(3rem,9vw,6rem)] w-auto select-none"
    />
  )
}

export default function Footer() {
  return (
    <footer
      data-section="14"
      className="relative isolate overflow-hidden border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg-0)' }}
    >
      <div className="sl-grid-overlay pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 flex items-end justify-between gap-6">
          <Wordmark />
          <Link
            href="/sign-up"
            className="group hidden items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-[var(--sl-border-strong)] md:inline-flex"
            style={{
              borderColor: 'var(--sl-border)',
              background: 'var(--sl-bg-elev)',
            }}
          >
            Start 14-day trial
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-10 border-t pt-12 md:grid-cols-5 md:gap-6" style={{ borderColor: 'var(--sl-border)' }}>
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.25em] text-fg-dim">
              Stormline
            </div>
            <p className="max-w-[28ch] text-[13px] leading-relaxed text-fg-muted">
              Macro intelligence for the operators who can&rsquo;t afford a Bloomberg terminal and shouldn&rsquo;t need one.
            </p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
              Intelligence, not advice.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.25em] text-fg-dim">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-[13px] text-fg-muted transition-colors hover:text-fg"
                    >
                      {l.label}
                      <span
                        aria-hidden
                        className="inline-block opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-70"
                      >
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-14 rounded-[var(--sl-radius-md)] border p-5"
          style={{
            borderColor: 'var(--sl-border)',
            background: 'var(--sl-bg-elev)',
          }}
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: 'var(--sl-accent)' }}
            />
            Primary data sources
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {SOURCES.map((s) => (
              <span
                key={s}
                className="font-mono text-[11px] tracking-[0.1em] text-fg"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div
          className="mt-14 border-t pt-8"
          style={{ borderColor: 'var(--sl-border)' }}
        >
          <p className="max-w-3xl text-[12.5px] leading-relaxed text-fg-muted">
            {DISCLAIMER}
          </p>

          <div className="mt-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <p className="text-[11.5px] text-fg-dim">
              &copy; {new Date().getFullYear()} Stormline. All rights reserved.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
              Designed for operators · built with care
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
