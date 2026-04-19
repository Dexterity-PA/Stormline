export const ALERT_TYPES = ['hurricane', 'tariff', 'fomc', 'commodity'] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const CHANNELS = ['email', 'sms'] as const;
export type Channel = (typeof CHANNELS)[number];

export type NotificationPrefs = Record<AlertType, Record<Channel, boolean>>;

export const ALERT_LABELS: Record<AlertType, { title: string; detail: string }> = {
  hurricane: {
    title: 'Hurricane advisories',
    detail: 'NHC storm tracks affecting your region',
  },
  tariff: {
    title: 'Tariff and trade notices',
    detail: 'Federal Register postings on import duties',
  },
  fomc: {
    title: 'FOMC releases',
    detail: 'Fed statements, minutes, rate decisions',
  },
  commodity: {
    title: 'Commodity moves',
    detail: 'Weekly input price moves beyond 2σ thresholds',
  },
};

export function defaultNotificationPrefs(): NotificationPrefs {
  return {
    hurricane: { email: true, sms: true },
    tariff: { email: true, sms: false },
    fomc: { email: true, sms: false },
    commodity: { email: true, sms: false },
  };
}

export function parseNotificationPrefs(raw: unknown): NotificationPrefs {
  const base = defaultNotificationPrefs();
  if (!raw || typeof raw !== 'object') return base;
  const rec = raw as Record<string, unknown>;
  const result: NotificationPrefs = { ...base };
  for (const type of ALERT_TYPES) {
    const entry = rec[type];
    if (entry && typeof entry === 'object') {
      const e = entry as Record<string, unknown>;
      result[type] = {
        email: typeof e.email === 'boolean' ? e.email : base[type].email,
        sms: typeof e.sms === 'boolean' ? e.sms : base[type].sms,
      };
    }
  }
  return result;
}
