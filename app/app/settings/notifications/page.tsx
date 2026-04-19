'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';

interface NotificationPref {
  key: string;
  label: string;
  description: string;
}

const EMAIL_PREFS: NotificationPref[] = [
  {
    key: 'email_briefing',
    label: 'Weekly briefing',
    description: 'Receive the Monday briefing in your inbox',
  },
  {
    key: 'email_alert_high',
    label: 'High-severity alerts',
    description: 'Hurricane, critical FOMC, or extreme commodity moves',
  },
  {
    key: 'email_alert_medium',
    label: 'Medium-severity alerts',
    description: 'Tariff notices, standard FOMC, notable commodity moves',
  },
];

const SMS_PREFS: NotificationPref[] = [
  {
    key: 'sms_alert_high',
    label: 'High-severity alerts (SMS)',
    description: 'Instant text for urgent events — Pro plan required',
  },
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    email_briefing: true,
    email_alert_high: true,
    email_alert_medium: false,
    sms_alert_high: false,
  });

  function toggle(key: string) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">
          Notifications
        </h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Choose how and when Stormline contacts you.
        </p>
      </div>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-medium text-fg mb-4">Email</h2>
        <div className="space-y-5">
          {EMAIL_PREFS.map((pref) => (
            <div key={pref.key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-fg">{pref.label}</p>
                <p className="text-xs text-fg-muted mt-0.5">{pref.description}</p>
              </div>
              <Toggle
                checked={prefs[pref.key] ?? false}
                onChange={() => toggle(pref.key)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-medium text-fg mb-1">SMS</h2>
        <p className="text-xs text-fg-muted mb-4">
          SMS alerts require a Pro plan. Standard messaging rates may apply.
        </p>
        <div className="space-y-5">
          {SMS_PREFS.map((pref) => (
            <div key={pref.key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-fg">{pref.label}</p>
                <p className="text-xs text-fg-muted mt-0.5">{pref.description}</p>
              </div>
              <Toggle
                checked={prefs[pref.key] ?? false}
                onChange={() => toggle(pref.key)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Button variant="primary" size="md" disabled className="opacity-50 cursor-not-allowed">
        Save preferences
      </Button>
      <p className="text-xs text-fg-muted mt-2">
        Submit wiring coming in a later stream.
      </p>
    </div>
  );
}
