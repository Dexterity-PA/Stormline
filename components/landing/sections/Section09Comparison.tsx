'use client'

import { SplitTextReveal } from '@/components/motion'

type Cell = {
  kind: 'text' | 'yes' | 'no' | 'partial' | 'price'
  value: string
}

type Column = {
  key: string
  name: string
  tag: string
  highlight?: boolean
}

const COLUMNS: readonly Column[] = [
  { key: 'stormline', name: 'Stormline', tag: 'Operators · SMB', highlight: true },
  { key: 'cube', name: 'Cube', tag: 'FP&A · CFOs' },
  { key: 'rosenberg', name: 'Rosenberg Research', tag: 'Institutional' },
  { key: 'qb', name: 'QuickBooks Live', tag: 'SMB bookkeeping' },
  { key: 'bloomberg', name: 'Bloomberg Terminal', tag: 'Traders · PMs' },
]

type Row = {
  label: string
  cells: Record<string, Cell>
}

const ROWS: readonly Row[] = [
  {
    label: 'Price / month',
    cells: {
      stormline: { kind: 'price', value: '$199 – $799' },
      cube: { kind: 'price', value: '$1,500+' },
      rosenberg: { kind: 'price', value: '$1,000+' },
      qb: { kind: 'price', value: '$400+' },
      bloomberg: { kind: 'price', value: '$2,000+' },
    },
  },
  {
    label: 'Audience',
    cells: {
      stormline: { kind: 'text', value: 'Independent operators' },
      cube: { kind: 'text', value: 'FP&A teams' },
      rosenberg: { kind: 'text', value: 'Portfolio managers' },
      qb: { kind: 'text', value: 'Accountants, bookkeepers' },
      bloomberg: { kind: 'text', value: 'Traders, analysts' },
    },
  },
  {
    label: 'Industry-tuned (food / construction / retail)',
    cells: {
      stormline: { kind: 'yes', value: 'Yes — three tracks' },
      cube: { kind: 'no', value: 'Generic FP&A' },
      rosenberg: { kind: 'no', value: 'Macro broadstroke' },
      qb: { kind: 'no', value: 'Horizontal SaaS' },
      bloomberg: { kind: 'partial', value: 'All markets' },
    },
  },
  {
    label: 'Weekly briefing in plain language',
    cells: {
      stormline: { kind: 'yes', value: 'Monday · 6am · 600–900 words' },
      cube: { kind: 'no', value: 'Internal-only reports' },
      rosenberg: { kind: 'partial', value: 'Daily macro letter' },
      qb: { kind: 'no', value: 'No narrative' },
      bloomberg: { kind: 'partial', value: 'Terminal articles' },
    },
  },
  {
    label: 'Input price dashboard (beef, lumber, diesel, etc.)',
    cells: {
      stormline: { kind: 'yes', value: '44 indicators · hourly' },
      cube: { kind: 'no', value: 'Your P&L data' },
      rosenberg: { kind: 'partial', value: 'Charts in reports' },
      qb: { kind: 'no', value: 'Your books only' },
      bloomberg: { kind: 'yes', value: 'Every series ever' },
    },
  },
  {
    label: 'SMS / email event alerts',
    cells: {
      stormline: { kind: 'yes', value: 'Pre-tuned thresholds' },
      cube: { kind: 'no', value: 'Internal anomaly only' },
      rosenberg: { kind: 'no', value: 'Research only' },
      qb: { kind: 'partial', value: 'Bookkeeping events' },
      bloomberg: { kind: 'yes', value: 'Terminal alerts · custom' },
    },
  },
  {
    label: 'Human editorial review',
    cells: {
      stormline: { kind: 'yes', value: 'Every briefing · no auto-publish' },
      cube: { kind: 'no', value: 'Automated' },
      rosenberg: { kind: 'yes', value: 'Analyst-authored' },
      qb: { kind: 'partial', value: 'Live service tier' },
      bloomberg: { kind: 'partial', value: 'News desk only' },
    },
  },
  {
    label: 'Learning curve',
    cells: {
      stormline: { kind: 'yes', value: 'Zero — it’s an email' },
      cube: { kind: 'partial', value: 'Days · FP&A tooling' },
      rosenberg: { kind: 'partial', value: 'Macro literacy' },
      qb: { kind: 'yes', value: 'Already know it' },
      bloomberg: { kind: 'no', value: 'Weeks of training' },
    },
  },
  {
    label: 'Positioning',
    cells: {
      stormline: { kind: 'text', value: 'Intelligence, not advice' },
      cube: { kind: 'text', value: 'Planning & analytics' },
      rosenberg: { kind: 'text', value: 'Research opinion' },
      qb: { kind: 'text', value: 'Bookkeeping platform' },
      bloomberg: { kind: 'text', value: 'Data firehose' },
    },
  },
]

function CellMark({ cell }: { cell: Cell }) {
  if (cell.kind === 'yes') {
    return (
      <div className="flex items-start gap-2">
        <span
          aria-label="Yes"
          className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'color-mix(in oklab, var(--sl-good) 20%, transparent)',
            color: 'var(--sl-good)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path
              d="M1.5 5.5 L3.8 7.5 L8.5 2.5"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-[12.5px] text-fg leading-snug">{cell.value}</span>
      </div>
    )
  }
  if (cell.kind === 'no') {
    return (
      <div className="flex items-start gap-2">
        <span
          aria-label="No"
          className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'color-mix(in oklab, var(--sl-fg-dim) 20%, transparent)',
            color: 'var(--sl-fg-dim)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path
              d="M2.5 2.5 L7.5 7.5 M7.5 2.5 L2.5 7.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="text-[12.5px] text-fg-muted leading-snug">{cell.value}</span>
      </div>
    )
  }
  if (cell.kind === 'partial') {
    return (
      <div className="flex items-start gap-2">
        <span
          aria-label="Partial"
          className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'color-mix(in oklab, var(--sl-warn) 20%, transparent)',
            color: 'var(--sl-warn)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <circle cx="5" cy="5" r="2.2" fill="currentColor" />
          </svg>
        </span>
        <span className="text-[12.5px] text-fg-muted leading-snug">{cell.value}</span>
      </div>
    )
  }
  if (cell.kind === 'price') {
    return (
      <div className="font-mono text-[13px] font-semibold tabular-nums text-fg">
        {cell.value}
      </div>
    )
  }
  return <div className="text-[12.5px] text-fg-muted leading-snug">{cell.value}</div>
}

export default function Section09Comparison() {
  return (
    <section
      data-section="9"
      className="relative isolate border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg-0)' }}
    >
      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-32">
        <div className="mb-14 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
            <span style={{ color: 'var(--sl-accent)' }}>09</span>
            <span>/</span>
            <span>How Stormline compares</span>
          </div>
          <SplitTextReveal
            as="h2"
            mode="word"
            text="Side-by-side with the tools you already know."
            stagger={50}
            duration={900}
            className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
          />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Stormline sits in a gap: too tactical for Rosenberg, too strategic for QuickBooks, too operator-focused for Bloomberg, too macro for Cube. That’s the whole thesis.
          </p>
        </div>

        <div
          className="relative overflow-x-auto rounded-[var(--sl-radius-lg)] border"
          style={{
            borderColor: 'var(--sl-border)',
            background: 'var(--sl-bg-elev)',
          }}
        >
          <div className="min-w-[960px]">
            <div
              className="grid border-b"
              style={{
                borderColor: 'var(--sl-border)',
                gridTemplateColumns: '1.4fr repeat(5, 1fr)',
              }}
            >
              <div className="px-5 py-5" />
              {COLUMNS.map((col) => (
                <div
                  key={col.key}
                  className="relative px-4 py-5"
                  style={
                    col.highlight
                      ? {
                          background:
                            'linear-gradient(180deg, color-mix(in oklab, var(--sl-accent) 10%, transparent), transparent 60%)',
                        }
                      : undefined
                  }
                >
                  {col.highlight && (
                    <div
                      className="absolute inset-x-0 top-0 h-[2px]"
                      style={{ background: 'var(--sl-accent)' }}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        col.highlight
                          ? 'font-display text-[15px] font-semibold text-fg'
                          : 'font-display text-[14px] font-semibold text-fg'
                      }
                    >
                      {col.name}
                    </span>
                    {col.highlight && (
                      <span
                        className="rounded-full border px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.2em]"
                        style={{
                          borderColor: 'var(--sl-accent)',
                          color: 'var(--sl-accent)',
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-fg-dim">
                    {col.tag}
                  </div>
                </div>
              ))}
            </div>

            {ROWS.map((row, rIdx) => (
              <div
                key={row.label}
                className="grid"
                style={{
                  gridTemplateColumns: '1.4fr repeat(5, 1fr)',
                  borderBottom:
                    rIdx === ROWS.length - 1
                      ? 'none'
                      : '1px solid var(--sl-border)',
                }}
              >
                <div className="flex items-center px-5 py-4 text-[12.5px] font-medium text-fg">
                  {row.label}
                </div>
                {COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center px-4 py-4"
                    style={
                      col.highlight
                        ? {
                            background:
                              'color-mix(in oklab, var(--sl-accent) 3%, transparent)',
                          }
                        : undefined
                    }
                  >
                    <CellMark cell={row.cells[col.key]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-fg-dim">
          Competitor details as of April 2026 · public pricing where available
        </p>
      </div>
    </section>
  )
}
