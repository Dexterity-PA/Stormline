'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SplitTextReveal } from '@/components/motion'

type Plan = {
  id: 'core' | 'pro' | 'multi'
  name: string
  blurb: string
  monthly: number
  yearly: number
  featured?: boolean
  cta: string
  features: readonly string[]
  excluded?: readonly string[]
}

const PLANS: readonly Plan[] = [
  {
    id: 'core',
    name: 'Core',
    blurb: 'The Monday briefing + live dashboard, for one industry.',
    monthly: 199,
    yearly: 1990,
    cta: 'Start 14-day trial',
    features: [
      'One industry track (restaurants, construction, or retail)',
      'Monday 6:00am briefing (email + PDF)',
      'Live input dashboard · 44 indicators',
      '90-day historical archive',
      'Email support · 48h response',
    ],
    excluded: ['SMS alerts', 'CSV / API export', 'Strategy call'],
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'Everything in Core, plus SMS alerts and full archive.',
    monthly: 399,
    yearly: 3990,
    featured: true,
    cta: 'Start 14-day trial',
    features: [
      'Everything in Core',
      'SMS + email event alerts (unlimited)',
      'Full historical archive (briefings + indicators)',
      'CSV + API data export',
      'Custom alert thresholds',
      'Priority editorial review · 12h response',
    ],
  },
  {
    id: 'multi',
    name: 'Multi',
    blurb: 'All three industry tracks + analyst quarterly call.',
    monthly: 799,
    yearly: 7990,
    cta: 'Talk to us',
    features: [
      'Everything in Pro',
      'All three industry briefings',
      'Multi-location / multi-concept support',
      'Quarterly strategy call with analyst',
      'Slack · Teams delivery',
      'Dedicated onboarding',
    ],
  },
]

function formatPrice(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export default function Section11Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section
      data-section="11"
      className="relative isolate border-t"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg)' }}
    >
      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-32">
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-dim">
            <span style={{ color: 'var(--sl-accent)' }}>11</span>
            <span>/</span>
            <span>Pricing</span>
          </div>
          <SplitTextReveal
            as="h2"
            mode="word"
            text="Three plans. One price per line. No contracts."
            stagger={50}
            duration={900}
            className="font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg"
          />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Pay by the month, cancel any time. Annual saves two months. No seat pricing — every plan includes unlimited users at your shop.
          </p>
        </div>

        <div className="mb-12 flex items-center justify-center gap-3">
          <BillingToggle annual={annual} onChange={setAnnual} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard key={p.id} plan={p} annual={annual} />
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-2">
          <p className="text-sm text-fg-muted">
            14-day free trial on every plan. No credit card required to start.
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-fg-dim">
            Stripe · cancel any time · no seat pricing
          </p>
        </div>
      </div>
    </section>
  )
}

function BillingToggle({
  annual,
  onChange,
}: {
  annual: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      className="inline-flex items-center rounded-full border p-1 font-mono text-[10.5px] uppercase tracking-[0.2em]"
      style={{ borderColor: 'var(--sl-border)', background: 'var(--sl-bg-elev)' }}
    >
      <button
        type="button"
        onClick={() => onChange(false)}
        className="rounded-full px-4 py-1.5 transition-colors"
        style={{
          background: !annual ? 'var(--sl-bg)' : 'transparent',
          color: !annual ? 'var(--sl-fg)' : 'var(--sl-fg-dim)',
          boxShadow: !annual ? 'inset 0 0 0 1px var(--sl-border)' : 'none',
        }}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className="flex items-center gap-2 rounded-full px-4 py-1.5 transition-colors"
        style={{
          background: annual ? 'var(--sl-bg)' : 'transparent',
          color: annual ? 'var(--sl-fg)' : 'var(--sl-fg-dim)',
          boxShadow: annual ? 'inset 0 0 0 1px var(--sl-border)' : 'none',
        }}
      >
        Annual
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] tracking-[0.15em]"
          style={{
            background: 'color-mix(in oklab, var(--sl-accent) 20%, transparent)',
            color: 'var(--sl-accent)',
          }}
        >
          −17%
        </span>
      </button>
    </div>
  )
}

function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price = annual ? plan.yearly / 12 : plan.monthly
  const href = plan.id === 'multi' ? '/contact' : '/sign-up'

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[var(--sl-radius-lg)] border p-8"
      style={{
        borderColor: plan.featured
          ? 'color-mix(in oklab, var(--sl-accent) 65%, var(--sl-border))'
          : 'var(--sl-border)',
        background: plan.featured
          ? 'linear-gradient(180deg, color-mix(in oklab, var(--sl-accent) 6%, var(--sl-bg-elev)) 0%, var(--sl-bg-elev) 80%)'
          : 'var(--sl-bg-elev)',
        boxShadow: plan.featured
          ? '0 20px 60px -30px color-mix(in oklab, var(--sl-accent) 40%, transparent)'
          : undefined,
      }}
    >
      {plan.featured && (
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: 'var(--sl-accent)' }}
        />
      )}

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-xl font-semibold text-fg">
            {plan.name}
          </div>
          <div className="mt-1 max-w-[26ch] text-[12.5px] leading-snug text-fg-muted">
            {plan.blurb}
          </div>
        </div>
        {plan.featured && (
          <span
            className="rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]"
            style={{
              borderColor: 'var(--sl-accent)',
              color: 'var(--sl-accent)',
            }}
          >
            Most popular
          </span>
        )}
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        <span className="font-display text-[3.2rem] font-semibold leading-none tracking-[-0.03em] text-fg">
          ${formatPrice(price)}
        </span>
        <span className="text-[13px] text-fg-dim">/ mo</span>
      </div>
      <div className="mb-6 -mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
        {annual
          ? `Billed $${formatPrice(plan.yearly)} / year`
          : 'Billed monthly · cancel any time'}
      </div>

      <Link
        href={href}
        className="mb-7 inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
        style={
          plan.featured
            ? { background: 'var(--sl-accent)', color: 'var(--sl-bg)' }
            : {
                background: 'var(--sl-bg)',
                color: 'var(--sl-fg)',
                border: '1px solid var(--sl-border-strong)',
              }
        }
      >
        {plan.cta}
      </Link>

      <div
        className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim"
      >
        Includes
      </div>
      <ul className="space-y-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px] text-fg">
            <span
              aria-hidden
              className="mt-[6px] inline-block h-[5px] w-[5px] shrink-0 rounded-full"
              style={{ background: 'var(--sl-accent)' }}
            />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {plan.excluded && (
        <>
          <div
            className="mb-3 mt-6 border-t pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim"
            style={{ borderColor: 'var(--sl-border)' }}
          >
            Not included
          </div>
          <ul className="space-y-2.5">
            {plan.excluded.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[12.5px] text-fg-muted"
              >
                <span
                  aria-hidden
                  className="mt-[5px] inline-block h-[7px] w-[7px] shrink-0"
                  style={{
                    borderTop: '1px solid var(--sl-fg-dim)',
                    borderRadius: 2,
                  }}
                />
                <span className="leading-snug">{f}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
