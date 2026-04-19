'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import {
  DynamicProfileForm,
  type ProfileField,
} from '@/components/onboarding/DynamicProfileForm';
import {
  upsertOnboardingStateAction,
  runProfilerAction,
  getIndustryIndicatorsAction,
  completeOnboardingAction,
} from '@/lib/onboarding/actions';
import type { OnboardingState, IndustryProfileSchema } from '@/lib/db/queries/onboarding';
import type { Indicator } from '@/lib/db/queries/indicators';
import type { Industry } from '@/lib/indicators/types';

type Step = 'industry' | 'region' | 'profile' | 'indicators' | 'channels' | 'complete';

interface WizardProps {
  initialStep: Step;
  initialState: OnboardingState | null;
  profileSchemas: IndustryProfileSchema[];
}

export function OnboardingWizard({ initialStep, initialState, profileSchemas }: WizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>(initialStep);
  const [industry, setIndustry] = useState<Industry | null>(
    (initialState?.selectedIndustry as Industry | null) ?? null,
  );
  const [regionState, setRegionState] = useState<string>(
    initialState?.selectedRegions?.[0] ?? '',
  );
  const [regionMetro, setRegionMetro] = useState<string>(
    initialState?.selectedRegions?.[1] ?? '',
  );
  const [businessDescription, setBusinessDescription] = useState<string>(
    initialState?.businessDescription ?? '',
  );
  const [industryProfile, setIndustryProfile] = useState<Record<string, unknown>>(
    (initialState?.industryProfile as Record<string, unknown> | null) ?? {},
  );
  const [allIndicators, setAllIndicators] = useState<Indicator[]>([]);
  const [aiRecs, setAiRecs] = useState<string[]>(
    initialState?.aiRecommendedIndicators ?? [],
  );
  const [pinnedCodes, setPinnedCodes] = useState<string[]>(
    initialState?.pinnedIndicatorCodes.length
      ? initialState.pinnedIndicatorCodes
      : (initialState?.aiRecommendedIndicators ?? []),
  );
  const [emailBriefing, setEmailBriefing] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [phone, setPhone] = useState('');
  const [inApp, setInApp] = useState(true);

  function handleIndustrySelect(ind: Industry) {
    startTransition(async () => {
      await upsertOnboardingStateAction({ step: 'region', selectedIndustry: ind });
      setIndustry(ind);
      setStep('region');
    });
  }

  function handleRegionNext() {
    if (!regionState) return;
    startTransition(async () => {
      const regions = regionMetro ? [regionState, regionMetro] : [regionState];
      await upsertOnboardingStateAction({ step: 'profile', selectedRegions: regions });
      setStep('profile');
    });
  }

  function handleProfileSubmit(values: Record<string, unknown>) {
    startTransition(async () => {
      await upsertOnboardingStateAction({
        step: 'indicators',
        businessDescription,
        industryProfile: values,
        keyInputs: [],
      });
      setIndustryProfile(values);

      // Fire profiler non-blocking — wizard advances immediately
      if (industry) {
        void runProfilerAction({
          industry,
          industryProfile: values,
          businessDescription,
          keyInputs: [],
          region: regionState,
        }).catch(console.error);
      }

      // Load full indicator list for step 4
      if (industry) {
        const inds = await getIndustryIndicatorsAction(industry);
        setAllIndicators(inds);
      }

      setStep('indicators');
    });
  }

  async function handleRetryProfiler(): Promise<void> {
    if (!industry) return;
    const recs = await runProfilerAction({
      industry,
      industryProfile,
      businessDescription,
      keyInputs: [],
      region: regionState,
    });
    if (recs.length > 0) {
      setAiRecs(recs);
      setPinnedCodes(recs);
    }
  }

  function handleIndicatorsNext() {
    startTransition(async () => {
      await upsertOnboardingStateAction({ step: 'channels', pinnedIndicatorCodes: pinnedCodes });
      setStep('channels');
    });
  }

  function handleChannelsNext() {
    startTransition(async () => {
      const channels: string[] = ['in_app'];
      if (emailBriefing) channels.push('email');
      if (smsAlerts) channels.push('sms');
      await upsertOnboardingStateAction({ step: 'complete', notificationChannels: channels });
      await completeOnboardingAction(smsAlerts ? phone : undefined);
      router.push('/app');
    });
  }

  const profileSchema = profileSchemas.find((s) => s.industry === industry);

  return (
    <div className="bg-bg-elev border border-border rounded-[var(--radius-lg)] p-8">
      <StepHeader step={step} />
      <div className="mt-6">
        {step === 'industry' && (
          <IndustryStep onSelect={handleIndustrySelect} isPending={isPending} />
        )}
        {step === 'region' && (
          <RegionStep
            regionState={regionState}
            regionMetro={regionMetro}
            onStateChange={setRegionState}
            onMetroChange={setRegionMetro}
            onNext={handleRegionNext}
            isPending={isPending}
          />
        )}
        {step === 'profile' && profileSchema && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-fg">
                Briefly describe your business
              </label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Fast casual taco restaurant, 2 locations, 40 seats each"
                className="bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1.5 focus:outline-none focus:border-accent resize-none w-full"
              />
            </div>
            <DynamicProfileForm
              fields={profileSchema.fields as ProfileField[]}
              initialValues={industryProfile}
              onSubmit={handleProfileSubmit}
              isPending={isPending}
            />
          </div>
        )}
        {step === 'indicators' && (
          <IndicatorsStep
            allIndicators={allIndicators}
            aiRecs={aiRecs}
            pinnedCodes={pinnedCodes}
            onToggle={(code) =>
              setPinnedCodes((prev) =>
                prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
              )
            }
            onRetry={handleRetryProfiler}
            onNext={handleIndicatorsNext}
            isPending={isPending}
          />
        )}
        {step === 'channels' && (
          <ChannelsStep
            emailBriefing={emailBriefing}
            onEmailChange={setEmailBriefing}
            smsAlerts={smsAlerts}
            onSmsChange={setSmsAlerts}
            phone={phone}
            onPhoneChange={setPhone}
            inApp={inApp}
            onInAppChange={setInApp}
            onNext={handleChannelsNext}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}

// ─── StepHeader ───────────────────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  industry: 'Your industry',
  region: 'Your region',
  profile: 'Business profile',
  indicators: 'Choose indicators',
  channels: 'Notifications',
};
const STEP_ORDER = ['industry', 'region', 'profile', 'indicators', 'channels'];

function StepHeader({ step }: { step: string }) {
  const idx = STEP_ORDER.indexOf(step);
  return (
    <div>
      <div className="flex gap-1 mb-4">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= idx ? 'bg-accent' : 'bg-border'}`}
          />
        ))}
      </div>
      <h1 className="text-xl font-semibold text-fg">{STEP_LABELS[step] ?? step}</h1>
    </div>
  );
}

// ─── Step 1: Industry ─────────────────────────────────────────────────────────

const INDUSTRY_CARDS = [
  { value: 'restaurant' as const, label: 'Restaurant', description: 'Food service operators, cafes, catering' },
  { value: 'construction' as const, label: 'Construction', description: 'Contractors, remodelers, specialty trades' },
  { value: 'retail' as const, label: 'Retail', description: 'Independent stores, specialty shops' },
];

function IndustryStep({ onSelect, isPending }: { onSelect: (ind: Industry) => void; isPending: boolean }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-fg-muted">Choose the industry that best describes your business.</p>
      {INDUSTRY_CARDS.map((card) => (
        <button
          key={card.value}
          type="button"
          disabled={isPending}
          onClick={() => onSelect(card.value)}
          className="w-full text-left p-4 bg-bg border border-border rounded-[var(--radius-md)] hover:border-accent hover:bg-spotlight transition-colors disabled:opacity-50"
        >
          <div className="font-medium text-fg">{card.label}</div>
          <div className="text-sm text-fg-muted mt-0.5">{card.description}</div>
        </button>
      ))}
    </div>
  );
}

// ─── Step 2: Region ───────────────────────────────────────────────────────────

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];

function RegionStep({
  regionState, regionMetro, onStateChange, onMetroChange, onNext, isPending,
}: {
  regionState: string; regionMetro: string;
  onStateChange: (v: string) => void; onMetroChange: (v: string) => void;
  onNext: () => void; isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-fg">State <span className="text-crit">*</span></label>
        <Select
          value={regionState}
          onChange={onStateChange}
          options={[{ value: '', label: '— select state —' }, ...US_STATES]}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-fg">
          Metro area <span className="text-fg-muted text-xs font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={regionMetro}
          onChange={(e) => onMetroChange(e.target.value)}
          placeholder="e.g. Denver, Colorado Springs"
          className="bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1.5 focus:outline-none focus:border-accent"
        />
      </div>
      <Button type="button" variant="primary" size="md" disabled={!regionState || isPending} onClick={onNext}>
        {isPending ? 'Saving…' : 'Continue'}
      </Button>
    </div>
  );
}

// ─── Step 4: Indicators ───────────────────────────────────────────────────────

function IndicatorsStep({
  allIndicators, aiRecs, pinnedCodes, onToggle, onRetry, onNext, isPending,
}: {
  allIndicators: Indicator[]; aiRecs: string[]; pinnedCodes: string[];
  onToggle: (code: string) => void; onRetry: () => Promise<void>;
  onNext: () => void; isPending: boolean;
}) {
  const [retrying, startRetry] = useTransition();
  const recommended = allIndicators.filter((i) => aiRecs.includes(i.code));
  const others = allIndicators.filter((i) => !aiRecs.includes(i.code));
  const byBucket = others.reduce<Record<string, Indicator[]>>((acc, ind) => {
    const bucket = ind.costBucket ?? 'other';
    (acc[bucket] ??= []).push(ind);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {aiRecs.length === 0 ? (
        <div className="p-4 bg-bg border border-border rounded-[var(--radius-md)]">
          <p className="text-sm text-fg-muted">
            Recommendations are still loading.{' '}
            <button
              type="button"
              disabled={retrying}
              className="text-accent underline disabled:opacity-50"
              onClick={() => startRetry(async () => { await onRetry(); })}
            >
              {retrying ? 'Retrying…' : 'Retry'}
            </button>
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-fg-muted mb-2 uppercase tracking-wide font-medium">Recommended for your profile</p>
          <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
            {recommended.map((ind) => (
              <IndicatorRow key={ind.code} ind={ind} checked={pinnedCodes.includes(ind.code)} onToggle={onToggle} />
            ))}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <details className="group">
          <summary className="text-sm text-fg-muted cursor-pointer list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Add more indicators
          </summary>
          <div className="mt-3 space-y-4 max-h-64 overflow-y-auto pr-1">
            {Object.entries(byBucket).map(([bucket, inds]) => (
              <div key={bucket}>
                <p className="text-xs font-medium text-fg-dim uppercase tracking-wide mb-1">
                  {bucket.replace(/_/g, ' ')}
                </p>
                <div className="space-y-0.5">
                  {inds.map((ind) => (
                    <IndicatorRow key={ind.code} ind={ind} checked={pinnedCodes.includes(ind.code)} onToggle={onToggle} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
      <Button type="button" variant="primary" size="md" disabled={isPending} onClick={onNext}>
        {isPending ? 'Saving…' : 'Continue'}
      </Button>
    </div>
  );
}

function IndicatorRow({ ind, checked, onToggle }: { ind: Indicator; checked: boolean; onToggle: (code: string) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 hover:bg-bg-elev rounded-[var(--radius-sm)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(ind.code)}
        className="accent-[var(--sl-accent)] flex-shrink-0"
      />
      <span className="text-sm text-fg">{ind.name}</span>
      <span className="text-xs text-fg-dim ml-auto flex-shrink-0">{ind.unit}</span>
    </label>
  );
}

// ─── Step 5: Channels ─────────────────────────────────────────────────────────

function ChannelsStep({
  emailBriefing, onEmailChange, smsAlerts, onSmsChange,
  phone, onPhoneChange, inApp, onInAppChange, onNext, isPending,
}: {
  emailBriefing: boolean; onEmailChange: (v: boolean) => void;
  smsAlerts: boolean; onSmsChange: (v: boolean) => void;
  phone: string; onPhoneChange: (v: string) => void;
  inApp: boolean; onInAppChange: (v: boolean) => void;
  onNext: () => void; isPending: boolean;
}) {
  return (
    <div className="space-y-3">
      <ChannelRow
        title="Email briefings"
        description="Weekly briefing every Monday morning"
        checked={emailBriefing}
        onChange={onEmailChange}
        ariaLabel="Email briefings"
      />
      <div className="p-3 bg-bg border border-border rounded-[var(--radius-md)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg">SMS alerts</p>
            <p className="text-xs text-fg-muted">High-priority event alerts by text</p>
          </div>
          <Toggle checked={smsAlerts} onChange={onSmsChange} aria-label="SMS alerts" />
        </div>
        {smsAlerts && (
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="mt-2 w-full bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-2 py-1.5 focus:outline-none focus:border-accent"
          />
        )}
      </div>
      <ChannelRow
        title="In-app notifications"
        description="Alerts visible in the dashboard"
        checked={inApp}
        onChange={onInAppChange}
        ariaLabel="In-app notifications"
      />
      <div className="pt-2">
        <Button type="button" variant="primary" size="md" disabled={isPending} onClick={onNext}>
          {isPending ? 'Finishing setup…' : 'Complete setup'}
        </Button>
      </div>
    </div>
  );
}

function ChannelRow({ title, description, checked, onChange, ariaLabel }: {
  title: string; description: string; checked: boolean;
  onChange: (v: boolean) => void; ariaLabel: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-bg border border-border rounded-[var(--radius-md)]">
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="text-xs text-fg-muted">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} aria-label={ariaLabel} />
    </div>
  );
}
