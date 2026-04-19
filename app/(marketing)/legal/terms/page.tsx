import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Stormline',
}

export default function TermsPage() {
  return (
    <main style={{ background: 'var(--sl-bg)' }}>
      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Attorney review banner */}
        <div
          className="mb-10 rounded-lg border px-5 py-4"
          style={{
            borderColor: 'var(--sl-warn)',
            background: 'color-mix(in srgb, var(--sl-warn) 10%, transparent)',
          }}
        >
          <p className="text-sm font-semibold text-warn">
            ⚠ [ATTORNEY REVIEW REQUIRED]
          </p>
          <p className="mt-1 text-xs text-fg-muted">
            This document is a placeholder draft and has not been reviewed by legal counsel.
            Do not publish publicly or present to customers until a qualified attorney has
            approved it. See §13 of the product spec.
          </p>
        </div>

        <h1 className="font-display text-3xl font-semibold text-fg">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-fg-muted">Last updated: April 2026 · Draft</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-fg-muted">
          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Stormline (&ldquo;the Service&rdquo;), you agree to be bound by
              these Terms of Service. If you do not agree, do not use the Service. These terms
              constitute a legally binding agreement between you and Stormline.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              2. Nature of Service — Intelligence, Not Advice
            </h2>
            <p>
              Stormline provides market intelligence, trend data, and historical context derived
              from publicly available economic data sources including the Federal Reserve Economic
              Data (FRED), the U.S. Energy Information Administration (EIA), the U.S. Department
              of Agriculture (USDA), and the Bureau of Labor Statistics (BLS).
            </p>
            <p className="mt-3">
              <strong className="text-fg">
                Stormline does not provide financial, investment, tax, legal, or business advice.
              </strong>{' '}
              All content is presented as historical patterns, market trends, and contextual
              information only. Users acknowledge that all business decisions are made at their
              own discretion and risk.
            </p>
            <p className="mt-3">
              By using the Service, you agree not to rely on Stormline content as the sole basis
              for any significant business decision. Read our full{' '}
              <Link href="/legal/disclaimer" className="text-accent hover:underline">
                disclaimer
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              3. Subscription and Billing
            </h2>
            <p>
              Stormline offers subscription plans billed monthly or annually. Current pricing is
              available at{' '}
              <Link href="/pricing" className="text-accent hover:underline">
                stormline.app/pricing
              </Link>
              . A 14-day free trial is available for new accounts with no credit card required.
              After the trial period, continued access requires a paid subscription.
            </p>
            <p className="mt-3">
              [PLACEHOLDER — payment terms, refund policy, cancellation, and grace period to be
              completed with attorney review.]
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              4. Data and Privacy
            </h2>
            <p>
              Stormline does not store or process client financial data. The Service is read-only
              intelligence derived from public data sources. Your personal data is handled per our{' '}
              <Link href="/legal/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              5. Limitation of Liability
            </h2>
            <p>
              [PLACEHOLDER — limitation of liability clause to be drafted by attorney. To include:
              cap on damages, exclusion of consequential damages, and disclaimer for data accuracy.]
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              6. Intellectual Property
            </h2>
            <p>
              [PLACEHOLDER — IP ownership, license to use, and restrictions on redistribution to
              be drafted by attorney.]
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              7. Governing Law
            </h2>
            <p>
              [PLACEHOLDER — governing law and jurisdiction to be determined with attorney.]
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              8. Changes to Terms
            </h2>
            <p>
              [PLACEHOLDER — notice period and process for material changes to be drafted by
              attorney.]
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
