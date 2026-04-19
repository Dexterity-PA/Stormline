import { Card } from '@/components/ui/Card';
import { currentUser } from '@clerk/nextjs/server';
import { parseNotificationPrefs } from './notification-prefs';
import { NotificationPrefsForm } from './NotificationPrefsForm';

export async function NotificationPrefsCard() {
  const user = await currentUser();
  const raw = user?.publicMetadata?.notificationPrefs;
  const initial = parseNotificationPrefs(raw);

  return (
    <Card className="p-5">
      <NotificationPrefsForm initialPrefs={initial} />
      <p className="text-xs text-fg-dim mt-5">
        SMS routing requires a Pro plan. Standard messaging rates may apply.
      </p>
    </Card>
  );
}
