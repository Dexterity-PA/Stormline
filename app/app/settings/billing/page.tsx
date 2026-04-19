import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function BillingPage() {
  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">Billing</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          Manage your subscription and payment method.
        </p>
      </div>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-medium text-fg mb-4">Current plan</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Badge variant="status" label="trial" />
            <p className="text-xs text-fg-muted mt-1.5">
              Free · 14-day trial · Expires May 2, 2026
            </p>
          </div>
          <p className="text-lg font-display font-semibold text-fg">$0</p>
        </div>
        <div className="border-t border-border pt-4 space-y-2 text-sm text-fg-muted">
          <p>✓ Full access to one industry</p>
          <p>✓ Weekly briefing</p>
          <p>✓ Dashboard</p>
          <p>✓ Email alerts</p>
        </div>
      </Card>

      <Card className="p-5 mb-6">
        <h2 className="text-sm font-medium text-fg mb-2">Manage billing</h2>
        <p className="text-sm text-fg-muted mb-4">
          Upgrade, cancel, or update your payment method through the Stripe
          customer portal.
        </p>
        <Button variant="outline" size="md" disabled>
          Open billing portal
        </Button>
        <p className="text-xs text-fg-muted mt-2">
          Stripe portal integration coming in a later stream.
        </p>
      </Card>

      <div className="bg-bg-elev border border-border rounded-[var(--radius-md)] p-5">
        <h3 className="text-sm font-medium text-fg mb-3">Available plans</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-fg font-medium">Core</p>
              <p className="text-xs text-fg-muted">
                One industry · briefing · dashboard · email alerts
              </p>
            </div>
            <p className="text-fg font-medium">$199/mo</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-fg font-medium">Pro</p>
              <p className="text-xs text-fg-muted">
                + SMS alerts · briefing archive · CSV export
              </p>
            </div>
            <p className="text-fg font-medium">$399/mo</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-fg font-medium">Multi-location</p>
              <p className="text-xs text-fg-muted">
                Up to 5 locations/regions · everything in Pro
              </p>
            </div>
            <p className="text-fg font-medium">$799/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
