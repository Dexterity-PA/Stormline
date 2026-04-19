'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

const CONDITION_OPTIONS = [
  { value: 'above', label: 'Value is above threshold' },
  { value: 'below', label: 'Value is below threshold' },
  { value: 'pct_change_above', label: '% change above threshold (window required)' },
  { value: 'pct_change_below', label: '% change below threshold (window required)' },
  { value: 'percentile_above', label: 'Percentile above threshold (window required)' },
  { value: 'percentile_below', label: 'Percentile below threshold (window required)' },
];

const NEEDS_WINDOW = new Set([
  'pct_change_above',
  'pct_change_below',
  'percentile_above',
  'percentile_below',
]);

const CHANNEL_OPTIONS = [
  { key: 'email', label: 'Email', description: 'Alert sent to your account email' },
  { key: 'sms', label: 'SMS', description: 'Text message to your phone number (Pro)' },
  { key: 'in_app', label: 'In-app', description: 'Recorded in your alert history' },
];

interface IndicatorOption {
  id: string;
  code: string;
  name: string;
  unit: string;
}

export function NewAlertRuleForm({ indicators }: { indicators: IndicatorOption[] }) {
  const router = useRouter();

  const [indicatorId, setIndicatorId] = useState('');
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('above');
  const [threshold, setThreshold] = useState('');
  const [windowDays, setWindowDays] = useState('30');
  const [channels, setChannels] = useState<string[]>(['email', 'in_app']);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const needsWindow = NEEDS_WINDOW.has(condition);

  const indicatorOptions = [
    { value: '', label: 'Select an indicator…' },
    ...indicators.map((i) => ({ value: i.id, label: `${i.name} (${i.unit})` })),
  ];

  function toggleChannel(key: string) {
    setChannels((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!indicatorId) { setError('Select an indicator.'); return; }
    if (!name.trim()) { setError('Enter a rule name.'); return; }
    if (!threshold || Number.isNaN(Number(threshold))) {
      setError('Enter a valid numeric threshold.'); return;
    }
    if (needsWindow && (!windowDays || Number.isNaN(Number(windowDays)))) {
      setError('Enter a valid window in days.'); return;
    }
    if (channels.length === 0) { setError('Select at least one channel.'); return; }

    startTransition(async () => {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicatorId,
          name: name.trim(),
          condition,
          threshold,
          windowDays: needsWindow ? Number(windowDays) : null,
          channels,
        }),
      });

      if (res.ok) {
        router.push('/app/alerts');
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? 'Something went wrong.');
      }
    });
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">New Alert Rule</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Get notified when an indicator crosses a threshold you define.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Indicator */}
        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">Indicator</label>
          <Select
            value={indicatorId}
            onChange={setIndicatorId}
            options={indicatorOptions}
            className="w-full"
          />
        </div>

        {/* Rule name */}
        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">Rule name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Beef above $7/lb"
            className="w-full bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-3 py-1.5 focus:outline-none focus:border-accent placeholder:text-fg-muted"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-fg mb-1.5">Condition</label>
          <Select
            value={condition}
            onChange={(val) => setCondition(val)}
            options={CONDITION_OPTIONS}
            className="w-full"
          />
        </div>

        {/* Threshold + Window */}
        <div className={`grid gap-3 ${needsWindow ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="block text-sm font-medium text-fg mb-1.5">
              {condition.startsWith('pct') ? 'Threshold (%)' : condition.startsWith('percentile') ? 'Threshold (0–100)' : 'Threshold'}
            </label>
            <input
              type="number"
              step="any"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 7.00"
              className="w-full bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-3 py-1.5 focus:outline-none focus:border-accent placeholder:text-fg-muted"
            />
          </div>
          {needsWindow && (
            <div>
              <label className="block text-sm font-medium text-fg mb-1.5">Window (days)</label>
              <input
                type="number"
                min="1"
                max="3650"
                value={windowDays}
                onChange={(e) => setWindowDays(e.target.value)}
                className="w-full bg-bg-elev border border-border text-fg text-sm rounded-[var(--radius-sm)] px-3 py-1.5 focus:outline-none focus:border-accent"
              />
            </div>
          )}
        </div>

        {/* Channels */}
        <div>
          <label className="block text-sm font-medium text-fg mb-2">Notify via</label>
          <div className="space-y-2">
            {CHANNEL_OPTIONS.map((ch) => (
              <label key={ch.key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.includes(ch.key)}
                  onChange={() => toggleChannel(ch.key)}
                  className="mt-0.5 accent-accent"
                />
                <div>
                  <p className="text-sm text-fg leading-none">{ch.label}</p>
                  <p className="text-xs text-fg-muted mt-0.5">{ch.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-sm)] px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? 'Saving…' : 'Create rule'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      <p className="mt-6 text-xs text-fg-muted border-t border-border pt-4">
        Stormline provides market intelligence, not financial, legal, or tax advice.
      </p>
    </div>
  );
}
