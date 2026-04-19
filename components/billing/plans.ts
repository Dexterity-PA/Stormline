export const PLAN_TIERS = ['core', 'pro', 'multi'] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
}

export const PLANS: readonly PlanDefinition[] = [
  {
    tier: 'core',
    name: 'Core',
    price: '$199',
    cadence: '/mo',
    tagline: 'Weekly intelligence for a single operator.',
    features: [
      'One industry + region',
      'Weekly Monday briefing',
      'Live dashboard',
      'Email alerts',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$399',
    cadence: '/mo',
    tagline: 'Tighter loop for high-volume single-region operators.',
    features: [
      'Everything in Core',
      'SMS alerts (high severity)',
      'Full briefing archive',
      'CSV export',
      'Priority support',
    ],
  },
  {
    tier: 'multi',
    name: 'Multi-location',
    price: '$799',
    cadence: '/mo',
    tagline: 'Regional rollups for multi-unit operators.',
    features: [
      'Up to 5 locations or regions',
      'Everything in Pro',
      'Regional comparison view',
      'Priority review support',
    ],
  },
] as const;
