import type { BriefingMock } from "@/app/(marketing)/industries/[slug]/content";

type Props = {
  industryName: string;
  briefing: BriefingMock;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-mono tracking-widest uppercase text-accent">
      {children}
    </p>
  );
}

function BriefingBody({ text }: { text: string }) {
  return (
    <p className="text-sm leading-relaxed text-fg-muted">{text}</p>
  );
}

export default function SampleBriefing({ industryName, briefing }: Props) {
  return (
    <section
      className="border-t border-border"
      style={{ background: "var(--sl-bg-elev)" }}
    >
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest uppercase text-accent mb-2">
            Sample Weekly Briefing
          </p>
          <h2 className="text-2xl font-display font-semibold text-fg">
            What a Monday morning briefing looks like.
          </h2>
          <p className="mt-2 text-sm text-fg-muted max-w-2xl">
            Every briefing is 600–900 words, written for a {industryName.toLowerCase()} operator,
            and framed as market intelligence — never advice. Each claim is
            linked to its public data source.
          </p>
          <p className="mt-2 text-xs text-fg-muted italic">
            This is a static mock for week of {briefing.weekOf}. Your real briefing
            is generated Monday at 6am from live indicator data reviewed by a
            human editor before it sends.
          </p>
        </div>

        <div
          className="rounded-lg border border-border p-6 sm:p-10 space-y-10"
          style={{ background: "var(--sl-bg)" }}
        >
          {/* Header */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono text-fg-muted">
                Stormline Weekly Briefing
              </span>
              <span className="text-xs text-border">·</span>
              <span className="text-xs font-mono text-fg-muted">
                {briefing.weekOf}
              </span>
              <span className="text-xs text-border">·</span>
              <span
                className="rounded-sm px-2 py-0.5 text-xs font-mono"
                style={{
                  background: "var(--sl-bg-elev)",
                  color: "var(--sl-accent)",
                }}
              >
                {industryName}
              </span>
            </div>
            <p className="text-lg font-display font-semibold text-fg leading-snug">
              {briefing.headline}
            </p>
          </div>

          {/* Input Costs */}
          <div>
            <SectionLabel>Input Costs</SectionLabel>
            <div className="space-y-5">
              {briefing.inputCosts.map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-semibold text-fg mb-1">
                    {item.label}
                  </p>
                  <BriefingBody text={item.body} />
                </div>
              ))}
            </div>
          </div>

          {/* Demand Signal */}
          <div>
            <SectionLabel>Demand Signal</SectionLabel>
            <BriefingBody text={briefing.demandSignal} />
          </div>

          {/* Watch List */}
          <div>
            <SectionLabel>Watch List</SectionLabel>
            <div className="space-y-5">
              {briefing.watchList.map((item) => (
                <div
                  key={item.label}
                  className="flex gap-4"
                >
                  <div
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: "var(--sl-warn)" }}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-semibold text-fg mb-1">
                      {item.label}
                    </p>
                    <BriefingBody text={item.body} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operator Actions */}
          <div>
            <SectionLabel>Operator Context</SectionLabel>
            <p className="mb-4 text-xs text-fg-muted italic">
              The following patterns are drawn from historical data. Stormline
              provides market intelligence, not recommendations.
            </p>
            <ul className="space-y-4">
              {briefing.operatorActions.map((action, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    className="mt-0.5 shrink-0 text-xs font-mono tabular-nums"
                    style={{ color: "var(--sl-accent)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <BriefingBody text={action} />
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer footer */}
          <div
            className="rounded-sm border border-border px-4 py-3"
            style={{ background: "var(--sl-bg-elev)" }}
          >
            <p className="text-xs text-fg-muted leading-relaxed">
              <span className="font-semibold text-fg">Disclosure: </span>
              Stormline provides market intelligence, not financial, legal, or
              tax advice. Historical patterns are descriptive, not predictive.
              Consult licensed professionals for decisions specific to your
              business.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
