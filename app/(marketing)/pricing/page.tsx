import type { Metadata } from 'next'
import PricingTable from '@/components/marketing/PricingTable'

export const metadata: Metadata = {
  title: 'Pricing — Stormline',
  description:
    'Core $199/mo, Pro $399/mo, Multi-location $799/mo. Macro intelligence for operators who track what drives margins.',
}

export default function PricingPage() {
  return (
    <main style={{ background: 'var(--sl-bg)' }}>
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-mono font-semibold uppercase tracking-widest text-accent">
            Pricing
          </p>
          <h1 className="font-display text-3xl font-semibold text-fg md:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-fg-muted">
            800,000+ macro series. Delivered weekly. Priced for operators, not institutions.
          </p>
        </div>

        <PricingTable />
      </div>
    </main>
  )
}
