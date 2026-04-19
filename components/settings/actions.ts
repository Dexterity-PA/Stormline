'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import {
  ALERT_TYPES,
  CHANNELS,
  type NotificationPrefs,
} from './notification-prefs';

const PrefsSchema = z.object(
  Object.fromEntries(
    ALERT_TYPES.map((t) => [
      t,
      z.object(
        Object.fromEntries(CHANNELS.map((c) => [c, z.boolean()])) as Record<
          (typeof CHANNELS)[number],
          z.ZodBoolean
        >,
      ),
    ]),
  ) as Record<
    (typeof ALERT_TYPES)[number],
    z.ZodObject<Record<(typeof CHANNELS)[number], z.ZodBoolean>>
  >,
);

export async function saveNotificationPrefs(
  input: NotificationPrefs,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: 'Not signed in' };

  const parsed = PrefsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid preferences shape' };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { notificationPrefs: parsed.data },
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to persist',
    };
  }
}
