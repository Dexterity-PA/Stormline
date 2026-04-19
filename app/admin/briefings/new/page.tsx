'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const INDUSTRIES = ['restaurant', 'construction', 'retail'] as const;

const US_STATES = [
  ['', 'National'],
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
] as const;

export default function NewBriefingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const orgId = fd.get('orgId') as string;
    const industry = fd.get('industry') as string;
    const regionRaw = fd.get('region') as string;
    const region = regionRaw || 'national';

    try {
      const res = await fetch('/api/admin/briefings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, industry, region }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { briefingId: string };
      startTransition(() => {
        router.push(`/admin/briefings/${data.briefingId}`);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    }
  }

  const busy = isPending;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">
          Trigger Manual Generation
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Kick off an out-of-cycle briefing draft. Generation calls Claude Sonnet 4 — expect 20–60 seconds.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 border border-border rounded-md bg-bg-elev p-6">
        <div className="space-y-1.5">
          <label htmlFor="orgId" className="block text-xs font-mono text-fg-muted uppercase tracking-wider">
            Org ID (UUID)
          </label>
          <input
            id="orgId"
            name="orgId"
            type="text"
            required
            pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-fg text-sm placeholder:text-fg-muted font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="industry" className="block text-xs font-mono text-fg-muted uppercase tracking-wider">
            Industry
          </label>
          <select
            id="industry"
            name="industry"
            required
            className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-fg text-sm"
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i.charAt(0).toUpperCase() + i.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="region" className="block text-xs font-mono text-fg-muted uppercase tracking-wider">
            Region
          </label>
          <select
            id="region"
            name="region"
            className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-fg text-sm"
          >
            {US_STATES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-crit font-mono">{error}</p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-md text-sm bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? 'Generating…' : 'Generate Draft'}
          </button>
          <span className="text-xs text-fg-muted/60">
            Calls <code className="font-mono">POST /api/admin/briefings/generate</code>
          </span>
        </div>
      </form>
    </div>
  );
}
