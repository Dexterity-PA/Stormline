'use client'

import { useState } from 'react'
import Link from 'next/link'

type Cycle = 'monthly' | 'annual'

interface Tier {
  name: string
  subtitle: string
  monthly: number
  annualPerMonth: number
  annualTotal: number
  highlight: boolean
  features: string[]
}

const TIERS: Tier[] = [
  {
    name: 'Core',
    subtitle: 'One industry vertical',
    monthly: 199,
    annualPerMonth: 166,
    annualTotal: 1990,
    highlight: false,
    features: [
      'One industry vertical',
      'Weekly operational briefing',
      'Input price dashboard',
      'Email event alerts',
    ],
  },
  {
    name: 'Pro',
    subtitle: 'One industry + archive',
    monthly: 399,
    annualPerMonth: 332,
    annualTotal: 3990,
    highlight: true,
    features: [
      'Everything in Core',
      'SMS event alerts (opt-in)',
      'Full briefing archive',
      'CSV data export',
      'Priority support',
    ],
  },
  {
    name: 'Multi-location',
    subtitle: 'Up to 5 locations / regions',
    monthly: 799,
    annualPerMonth: 666,
    annualTotal: 7990,
    highlight: false,
    features: [
      'Everything in Pro',
      'Up to 5 locations / regions',
      'Cross-location briefings',
      'Regional comparison views',
    ],
  },
]

export default function PricingTable() {
  const [cycle, setCycle] = useState<Cycle>('monthly')

  const isAnnual = cycle === 'annual'

  return (
    <div>
      {/* Billing toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <button
          onClick={() => setCycle('monthly')}
          className={`text-sm font-medium transition-colors ${
            !isAnnual ? 'text-fg' : 'text-fg-muted'
          }`}
        >
          Monthly
        </button>

        <button
          role="switch"
          aria-checked={isAnnual}
          aria-label="Toggle annual billing"
          onClick={() => setCycle(isAnnual ? 'monthly' : 'annual')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            isAnnual ? 'bg-accent' : 'bg-border'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-fg transition-transform ${
              isAnnual ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>

        <button
          onClick={() => setCycle('annual')}
          className={`text-sm font-medium transition-colors ${
            isAnnual ? 'text-fg' : 'text-fg-muted'
          }`}
        >
          Annual{' '}
          <span
            className="ml-1.5 rounded-full px-2 py-0.5 text-xs font-semibold text-good"
            style={{ background: 'color-mix(in srgb, var(--sl-good) 12%, transparent)' }}
          >
            Save 17%
          </span>
        </button>
      </div>

      {/* Tier cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-lg border p-6 ${
              tier.highlight ? 'border-accent' : 'border-border'
            }`}
            style={{ background: 'var(--sl-bg-elev)' }}
          >
            {tier.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-bg">
                  Most popular
                </span>
              </div>
            )}

            <h3 className="font-display text-base font-semibold text-fg">{tier.name}</h3>
            <p className="mt-1 text-xs text-fg-muted">{tier.subtitle}</p>

            <div className="mt-5 flex items-end gap-1">
              <span className="font-display text-3xl font-semibold text-fg">
                ${isAnnual ? tier.annualPerMonth : tier.monthly}
              </span>
              <span className="mb-1 text-sm text-fg-muted">/mo</span>
            </div>

            {isAnnual && (
              <p className="mt-1 text-xs text-fg-muted">
                Billed ${tier.annualTotal.toLocaleString()}/year
              </p>
            )}

            <Link
              href="/sign-up"
              className={`mt-6 block w-full rounded-md py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                tier.highlight
                  ? 'bg-accent text-bg'
                  : 'border border-border text-fg hover:border-accent'
              }`}
            >
              Start free trial
            </Link>

            <ul className="mt-6 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-fg-muted">
                  <span className="mt-0.5 shrink-0 text-good" aria-hidden="true">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 14-day trial callout */}
      <p className="mt-8 text-center text-sm text-fg-muted">
        All plans include a{' '}
        <span className="font-medium text-fg">14-day free trial</span>.
        No credit card required.
      </p>
    </div>
  )
}
