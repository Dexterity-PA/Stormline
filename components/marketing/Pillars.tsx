const PILLARS = [
  {
    num: '01',
    title: 'Weekly Operational Briefing',
    body:
      'Every Monday, 600–900 words specific to your industry. Headline, input costs, demand signal, and what operators in similar conditions have done. Every claim linked to FRED, EIA, USDA, or BLS source data.',
  },
  {
    num: '02',
    title: 'Input Price Dashboard',
    body:
      'Pre-configured cost tracking — no setup required. Each tile shows current value, weekly and monthly change, six-month sparkline, and five-year historical percentile. Context before moves hit the P&L.',
  },
  {
    num: '03',
    title: 'Event Alerts',
    body:
      'When a hurricane, tariff announcement, FOMC decision, or commodity move crosses two standard deviations, historical P&L impact data over 30–90 days is delivered via email or SMS — before it shows up in your costs.',
  },
]

export default function Pillars() {
  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold text-fg md:text-3xl">
          Three signals. One platform.
        </h2>
        <p className="mt-3 max-w-xl text-fg-muted">
          Trends indicate operators who track macro conditions weekly
          outperform peers on margin stability during commodity cycles.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.num}
              className="rounded-lg border border-border p-6"
              style={{ background: 'var(--sl-bg-elev)' }}
            >
              <span className="font-mono text-xs text-accent">{p.num}</span>
              <h3 className="mt-3 font-display text-base font-semibold text-fg">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
