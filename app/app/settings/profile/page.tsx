import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">Profile</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Account details and organization settings.
        </p>
      </div>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-medium text-fg mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1">Name</label>
            <p className="text-sm text-fg">—</p>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1">Email</label>
            <p className="text-sm text-fg">—</p>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1">Role</label>
            <p className="text-sm text-fg">Owner</p>
          </div>
        </div>
        <p className="text-xs text-fg-muted mt-4">
          Account details are managed via Clerk. Click below to update your name or email.
        </p>
        <Button variant="outline" size="sm" className="mt-4" disabled>
          Manage account
        </Button>
      </Card>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-medium text-fg mb-4">Organization</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-fg-muted mb-1">Industry</label>
            <Badge variant="industry" label="restaurant" />
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1">Region</label>
            <p className="text-sm text-fg">National (default)</p>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1">Subscription</label>
            <Badge variant="status" label="trial" />
          </div>
        </div>
      </Card>
    </div>
  );
}
