import Link from 'next/link'

const TICKER_ROWS = [
  { label: 'Beef — Choice',    value: '$7.24/lb',  change: '+6.2%',  adverse: true  },
  { label: "Diesel (nat'l)",   value: '$3.84/gal', change: '-0.4%',  adverse: false },
  { label: 'Lumber (framing)', value: '541 $/mbf', change: '+5.3%',  adverse: true  },
  { label: 'Copper wire',      value: '$4.72/lb',  change: '+1.8%',  adverse: true  },
  { label: 'ECI labor',        value: '4.1% YoY',  change: '+0.2pp', adverse: true  },
  { label: 'SLOOS credit',     value: 'Tight',     change: 'Q1 2026', adverse: true },
  { label: 'Corn (spot)',      value: '449 ¢/bu',  change: '-1.2%',  adverse: false },
]

function TickerPanel() {
  return (
    <div className="hidden w-72 shrink-0 rounded-lg border border-border bg-bg-elev p-4 font-mono text-xs md:block">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-fg-muted">
        Live indicators — FRED / EIA / USDA
      </p>
      <div className="space-y-2.5">
        {TICKER_ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="truncate text-fg-muted">{row.label}</span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-fg">{row.value}</span>
              <span className={row.adverse ? 'text-crit' : 'text-good'}>
                {row.change}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[9px] text-fg-muted opacity-60">
        Sample indicators · Not real-time
      </p>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      {/* Data-grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(var(--sl-accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--sl-accent) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto flex max-w-6xl items-center gap-12 px-6 py-24 md:py-36">
        {/* Copy */}
        <div className="flex-1">
          <p className="mb-4 text-xs font-mono font-semibold uppercase tracking-widest text-accent">
            Macro intelligence · Weekly briefings · Event alerts
          </p>

          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-fg md:text-5xl lg:text-6xl">
            Bloomberg Terminal logic.<br />
            Translated for operators.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
            Historical patterns show operators who track input cost trends
            weekly maintain margin stability during commodity cycles. Stormline
            delivers that signal — specific to your industry — every Monday
            before you open.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Start free — 14-day trial
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              See pricing →
            </Link>
          </div>

          <p className="mt-3 text-xs text-fg-muted">
            No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Ticker panel — desktop only */}
        <TickerPanel />
      </div>
    </section>
  )
}
