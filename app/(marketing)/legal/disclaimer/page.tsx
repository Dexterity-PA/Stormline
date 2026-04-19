import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Disclaimer — Stormline',
  description:
    'Stormline provides market intelligence, not financial, legal, or tax advice.',
}

export default function DisclaimerPage() {
  return (
    <main style={{ background: 'var(--sl-bg)' }}>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="mb-4 text-xs font-mono font-semibold uppercase tracking-widest text-accent">
          Legal
        </p>
        <h1 className="font-display text-3xl font-semibold text-fg md:text-4xl">
          Intelligence, Not Advice
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          This disclaimer applies to all content produced and delivered by Stormline.
        </p>

        {/* Core statement */}
        <div
          className="mt-10 rounded-lg border border-border p-6"
          style={{ background: 'var(--sl-bg-elev)' }}
        >
          <p className="text-base font-semibold text-fg">
            Stormline provides market intelligence, not financial, legal, or tax advice.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            Consult licensed professionals for decisions specific to your business.
          </p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-fg-muted">
          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              What Stormline Is
            </h2>
            <p>
              Stormline is a market intelligence platform. It collects, processes, and summarizes
              publicly available economic data from sources including the Federal Reserve Economic
              Data system (FRED), the U.S. Energy Information Administration (EIA), the U.S.
              Department of Agriculture (USDA), and the Bureau of Labor Statistics (BLS).
            </p>
            <p className="mt-3">
              All output — weekly briefings, dashboard indicators, event alerts, and any other
              content produced by Stormline — is presented as historical patterns, observed trends,
              and contextual market information. It is descriptive, not prescriptive.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              What Stormline Is Not
            </h2>
            <ul className="space-y-2 pl-4">
              <li>Stormline is not a financial advisor or investment advisor.</li>
              <li>Stormline is not a licensed tax professional or tax advisor.</li>
              <li>Stormline is not a legal advisor or attorney.</li>
              <li>Stormline is not a commodity trading advisor.</li>
              <li>
                Stormline does not provide personalized financial recommendations. Nothing
                in Stormline&rsquo;s content constitutes a recommendation to buy, sell, hedge,
                or otherwise transact in any commodity, security, or financial instrument.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              Framing of All Output
            </h2>
            <p>
              Stormline&rsquo;s content is intentionally framed as pattern observation. Phrases such as
              &ldquo;historical data suggests,&rdquo; &ldquo;trends indicate,&rdquo; &ldquo;operators in similar conditions
              have,&rdquo; and &ldquo;historical patterns show&rdquo; are used throughout all content. These phrases
              are not rhetorical — they accurately describe the nature of the information being
              conveyed.
            </p>
            <p className="mt-3">
              Stormline content never states or implies that a user should take any specific action.
              All operational decisions based on Stormline content are made at the sole discretion
              and risk of the user.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              Data Sources and Accuracy
            </h2>
            <p>
              Stormline sources data from public government databases. While these sources are
              considered reliable, Stormline does not warrant the accuracy, completeness, or
              timeliness of any data. Economic data is subject to revision by the originating
              agencies. Historical patterns are descriptive, not predictive. Past commodity
              trends, labor cost patterns, or demand signals do not guarantee future outcomes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              No Client Relationship
            </h2>
            <p>
              Use of Stormline does not create a professional, advisory, or fiduciary relationship
              of any kind between Stormline and the user. Stormline has no knowledge of a
              user&rsquo;s specific financial position, risk tolerance, or business circumstances.
              Users should consult qualified professionals — including licensed financial advisors,
              CPAs, and attorneys — before making significant business decisions.
            </p>
          </section>
        </div>

        <div className="mt-12 flex gap-6">
          <Link href="/legal/terms" className="text-sm text-accent hover:underline">
            Terms of Service
          </Link>
          <Link href="/legal/privacy" className="text-sm text-accent hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  )
}
