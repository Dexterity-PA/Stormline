import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Stormline',
}

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-fg-muted">Last updated: April 2026 · Draft</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-fg-muted">
          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              1. Information We Collect
            </h2>
            <p>
              Stormline collects the minimum information necessary to deliver the Service:
            </p>
            <ul className="mt-3 space-y-2 pl-4">
              <li>
                <strong className="text-fg">Account information:</strong> Name and email address,
                collected at sign-up via Clerk. Clerk&rsquo;s privacy practices apply to
                authentication data.
              </li>
              <li>
                <strong className="text-fg">Industry and region:</strong> Selected during onboarding
                to configure your briefing and dashboard.
              </li>
              <li>
                <strong className="text-fg">Usage data:</strong> Aggregate analytics via Vercel
                Analytics (privacy-preserving, no IP storage) and error reporting via Sentry
                (error context only, no PII in error payloads).
              </li>
              <li>
                <strong className="text-fg">SMS number (optional):</strong> If you opt into SMS
                alerts, your phone number is stored for delivery only.
              </li>
            </ul>
            <p className="mt-3">
              <strong className="text-fg">
                Stormline does not collect, store, or process financial data.
              </strong>{' '}
              The Service is read-only intelligence derived from public data sources. We have no
              access to your revenue, transactions, or accounting systems.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              2. How We Use Your Information
            </h2>
            <ul className="space-y-2 pl-4">
              <li>Delivering weekly briefings and event alerts to your email address</li>
              <li>Configuring your industry-specific dashboard</li>
              <li>
                Processing subscription billing via Stripe (Stripe&rsquo;s privacy practices
                apply to payment data)
              </li>
              <li>Improving the Service via aggregate, anonymized usage patterns</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information. We do not share your email address with
              third parties except as required for Service delivery (email provider: Resend) or
              legal compliance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              3. Data Retention
            </h2>
            <p>
              [PLACEHOLDER — retention periods, deletion on account cancellation, and data export
              rights to be specified with attorney review.]
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              4. GDPR / CCPA
            </h2>
            <p>
              [PLACEHOLDER — rights disclosure (access, deletion, portability), data controller
              identity, and contact method to be completed with attorney review.]
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              5. Security
            </h2>
            <p>
              Authentication is handled by Clerk, which uses industry-standard security practices.
              Data is stored in Neon Postgres with encryption at rest. All data transmission is
              encrypted in transit via TLS.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-fg">
              6. Contact
            </h2>
            <p>
              [PLACEHOLDER — contact email or form for privacy inquiries to be added before launch.]
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/legal/terms" className="text-sm text-accent hover:underline">
            ← Terms of Service
          </Link>
        </div>
      </div>
    </main>
  )
}
