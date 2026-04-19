'use client'

import { TickerBand } from '@/components/motion'

type TickerItem = {
  code: string
  label: string
  value: string
  unit: string
  pct: number
  kind: 'cost' | 'demand' | 'rate' | 'fx'
}

const ROW_A: TickerItem[] = [
  { code: 'BEEF', label: 'Boxed beef', value: '318.40', unit: '$/cwt', pct: 2.1, kind: 'cost' },
  { code: 'DIESEL', label: 'Diesel (US avg)', value: '3.847', unit: '$/gal', pct: -0.4, kind: 'cost' },
  { code: 'LUMBER', label: 'Lumber futures', value: '542.50', unit: '$/kbf', pct: 3.8, kind: 'cost' },
  { code: 'STEEL', label: 'HRC steel', value: '742', unit: '$/ton', pct: 1.2, kind: 'cost' },
  { code: 'WTI', label: 'WTI crude', value: '79.12', unit: '$/bbl', pct: 0.9, kind: 'cost' },
  { code: 'NATGAS', label: 'Henry Hub gas', value: '2.34', unit: '$/MMBtu', pct: -1.6, kind: 'cost' },
  { code: 'POULTRY', label: 'Whole chicken', value: '1.41', unit: '$/lb', pct: 0.7, kind: 'cost' },
  { code: 'EGG', label: 'Grade A eggs', value: '3.89', unit: '$/doz', pct: -4.2, kind: 'cost' },
  { code: 'COPPER', label: 'COMEX copper', value: '4.11', unit: '$/lb', pct: 1.4, kind: 'cost' },
  { code: 'PVC', label: 'PVC resin index', value: '112.4', unit: 'idx', pct: 0.3, kind: 'cost' },
  { code: 'COTTON', label: 'Cotton #2', value: '81.24', unit: '¢/lb', pct: 2.6, kind: 'cost' },
  { code: 'COFFEE', label: 'Arabica futures', value: '2.37', unit: '$/lb', pct: 5.1, kind: 'cost' },
  { code: 'CPK-OIL', label: 'Cooking oil index', value: '127.8', unit: 'idx', pct: -0.9, kind: 'cost' },
  { code: 'FREIGHT', label: 'Spot truckload', value: '2.21', unit: '$/mi', pct: 1.8, kind: 'cost' },
  { code: 'BAL-DRY', label: 'Baltic Dry Index', value: '1,740', unit: '', pct: -2.3, kind: 'cost' },
]

const ROW_B: TickerItem[] = [
  { code: 'HSTARTS', label: 'Housing starts', value: '1.42M', unit: 'SAAR', pct: 3.2, kind: 'demand' },
  { code: 'PERMIT', label: 'Building permits', value: '1.48M', unit: 'SAAR', pct: 1.7, kind: 'demand' },
  { code: 'RETAIL', label: 'Retail sales ex-auto', value: '+0.6', unit: '% MoM', pct: 0.6, kind: 'demand' },
  { code: 'UMCSENT', label: 'Consumer sentiment', value: '77.9', unit: '', pct: -1.4, kind: 'demand' },
  { code: 'RESTIDX', label: 'Restaurant traffic', value: '102.3', unit: 'idx', pct: 0.8, kind: 'demand' },
  { code: 'FOOT-TRF', label: 'Retail foot traffic', value: '+1.2', unit: '% WoW', pct: 1.2, kind: 'demand' },
  { code: 'ISM-SVC', label: 'ISM services', value: '53.4', unit: '', pct: 0.5, kind: 'demand' },
  { code: 'REMOD', label: 'Remodel market idx', value: '94.6', unit: '', pct: -0.7, kind: 'demand' },
  { code: 'FEDFUNDS', label: 'Fed funds target', value: '4.75', unit: '%', pct: 0, kind: 'rate' },
  { code: '10Y', label: '10Y Treasury', value: '4.32', unit: '%', pct: 0.1, kind: 'rate' },
  { code: 'MORT-30', label: '30Y fixed mortgage', value: '6.81', unit: '%', pct: -0.08, kind: 'rate' },
  { code: 'HY-SPREAD', label: 'HY OAS spread', value: '348', unit: 'bps', pct: 7, kind: 'rate' },
  { code: 'CARD-DLQ', label: 'Card delinq. rate', value: '3.22', unit: '%', pct: 0.14, kind: 'rate' },
  { code: 'DXY', label: 'Dollar index', value: '104.6', unit: '', pct: 0.3, kind: 'fx' },
  { code: 'CNY', label: 'USD/CNY', value: '7.21', unit: '', pct: -0.1, kind: 'fx' },
]

function Card({ item }: { item: TickerItem }) {
  const up = item.pct > 0
  const flat = item.pct === 0
  // Cost indicators: rising = bad (amber/crit), falling = good (green)
  // Demand indicators: rising = good (green), falling = amber
  const positiveDir: 'rise' | 'fall' =
    item.kind === 'cost' ? 'fall' : 'rise'
  const userPositive = flat
    ? 'neutral'
    : up && positiveDir === 'rise'
      ? 'good'
      : !up && positiveDir === 'fall'
        ? 'good'
        : 'bad'

  const dirColor =
    userPositive === 'good'
      ? 'var(--sl-good)'
      : userPositive === 'bad'
        ? item.kind === 'cost' ? 'var(--sl-warn)' : 'var(--sl-crit)'
        : 'var(--sl-fg-dim)'

  const kindLabel = {
    cost: 'Cost',
    demand: 'Demand',
    rate: 'Rate',
    fx: 'FX',
  }[item.kind]

  return (
    <button
      type="button"
      className="group flex min-w-[260px] items-center gap-3 rounded-[var(--sl-radius-md)] border px-4 py-3 text-left transition-colors hover:border-[var(--sl-border-strong)]"
      style={{
        borderColor: 'var(--sl-border)',
        background: 'var(--sl-bg-elev)',
      }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim"
        style={{ minWidth: 44 }}
      >
        {kindLabel}
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[11px] text-fg-muted">{item.label}</span>
        <span className="font-display text-sm font-semibold text-fg">
          {item.value}
          {item.unit && (
            <span className="ml-1 text-[11px] font-normal text-fg-dim">{item.unit}</span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs" style={{ color: dirColor }}>
        <span aria-hidden>{flat ? '→' : up ? '↑' : '↓'}</span>
        <span className="font-mono tabular-nums">
          {flat ? '0.0' : `${up ? '+' : ''}${item.pct.toFixed(1)}`}%
        </span>
      </div>
    </button>
  )
}

export default function Section02Ticker() {
  return (
    <section
      data-section="2"
      className="relative isolate border-y"
      style={{
        borderColor: 'var(--sl-border)',
        background: 'var(--sl-bg-0)',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="relative flex h-2 w-2"
              aria-hidden
            >
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: 'var(--sl-accent)' }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: 'var(--sl-accent)' }}
              />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
              Live tape · 30 indicators · updated hourly
            </span>
          </div>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-fg-dim md:block">
            Cost ↑ amber · Demand ↑ green
          </span>
        </div>
      </div>

      <div className="space-y-3 pb-10">
        <TickerBand direction="left" duration={90} reverseOnScroll>
          {ROW_A.map((item) => (
            <Card key={item.code} item={item} />
          ))}
        </TickerBand>
        <TickerBand direction="right" duration={110} reverseOnScroll>
          {ROW_B.map((item) => (
            <Card key={item.code} item={item} />
          ))}
        </TickerBand>
      </div>
    </section>
  )
}
