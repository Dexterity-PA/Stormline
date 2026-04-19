import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface ProfileCardProps {
  name: string | null;
  email: string | null;
  industry: 'restaurant' | 'construction' | 'retail';
  region: string;
  subscription: 'trial' | 'core' | 'pro' | 'multi';
}

export function ProfileCard({
  name,
  email,
  industry,
  region,
  subscription,
}: ProfileCardProps) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-medium text-fg mb-4">Account</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Name" value={name ?? '—'} />
        <Field label="Email" value={email ?? '—'} />
        <Field label="Role" value="Owner" />
        <Field label="Region" value={region} />
        <div>
          <label className="block text-xs text-fg-muted mb-1">Industry</label>
          <Badge variant="industry" label={industry} />
        </div>
        <div>
          <label className="block text-xs text-fg-muted mb-1">Subscription</label>
          <Badge variant="status" label={subscription} />
        </div>
      </div>
      <p className="text-xs text-fg-muted mt-5">
        Account details are managed via Clerk. Open the Clerk user panel to
        update your name or email.
      </p>
      <Button variant="outline" size="sm" className="mt-3" disabled>
        Manage account
      </Button>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs text-fg-muted mb-1">{label}</label>
      <p className="text-sm text-fg">{value}</p>
    </div>
  );
}
