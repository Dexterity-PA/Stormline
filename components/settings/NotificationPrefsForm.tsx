'use client';

import { useState, useTransition } from 'react';
import { Toggle } from '@/components/ui/Toggle';
import {
  ALERT_LABELS,
  ALERT_TYPES,
  type AlertType,
  type Channel,
  type NotificationPrefs,
} from './notification-prefs';
import { saveNotificationPrefs } from './actions';

export interface NotificationPrefsFormProps {
  initialPrefs: NotificationPrefs;
}

export function NotificationPrefsForm({ initialPrefs }: NotificationPrefsFormProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs);
  const [pending, startTransition] = useTransition();
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(type: AlertType, channel: Channel) {
    setPrefs((prev) => {
      const next: NotificationPrefs = {
        ...prev,
        [type]: { ...prev[type], [channel]: !prev[type][channel] },
      };
      startTransition(async () => {
        const res = await saveNotificationPrefs(next);
        if (res.ok) {
          setError(null);
          setLastSavedAt(new Date().toLocaleTimeString());
        } else {
          setError(res.error);
        }
      });
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-fg">Alert routing</h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Pick channels per alert type. Changes save instantly.
          </p>
        </div>
        <StatusChip pending={pending} savedAt={lastSavedAt} error={error} />
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-4 text-sm">
        <div className="text-[10px] uppercase tracking-wider text-fg-dim font-medium" />
        <div className="text-[10px] uppercase tracking-wider text-fg-dim font-medium text-center">
          Email
        </div>
        <div className="text-[10px] uppercase tracking-wider text-fg-dim font-medium text-center">
          SMS
        </div>

        {ALERT_TYPES.map((type) => (
          <PrefRow
            key={type}
            type={type}
            prefs={prefs[type]}
            onToggle={(ch) => toggle(type, ch)}
          />
        ))}
      </div>
    </div>
  );
}

function PrefRow({
  type,
  prefs,
  onToggle,
}: {
  type: AlertType;
  prefs: Record<Channel, boolean>;
  onToggle: (ch: Channel) => void;
}) {
  const { title, detail } = ALERT_LABELS[type];
  return (
    <>
      <div>
        <p className="text-fg">{title}</p>
        <p className="text-xs text-fg-muted mt-0.5">{detail}</p>
      </div>
      <div className="flex items-center justify-center">
        <Toggle
          checked={prefs.email}
          onChange={() => onToggle('email')}
          aria-label={`Email for ${title}`}
        />
      </div>
      <div className="flex items-center justify-center">
        <Toggle
          checked={prefs.sms}
          onChange={() => onToggle('sms')}
          aria-label={`SMS for ${title}`}
        />
      </div>
    </>
  );
}

function StatusChip({
  pending,
  savedAt,
  error,
}: {
  pending: boolean;
  savedAt: string | null;
  error: string | null;
}) {
  if (error) {
    return <span className="text-xs text-crit">Save failed: {error}</span>;
  }
  if (pending) {
    return <span className="text-xs text-fg-muted">Saving…</span>;
  }
  if (savedAt) {
    return <span className="text-xs text-good">Saved · {savedAt}</span>;
  }
  return null;
}
