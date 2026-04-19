import { Card } from '@/components/ui/Card';

export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  href?: string;
}

export interface BillingHistoryCardProps {
  invoices: BillingHistoryItem[] | null;
}

export function BillingHistoryCard({ invoices }: BillingHistoryCardProps) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-medium text-fg mb-4">Billing history</h2>

      {invoices === null ? (
        <EmptyState
          title="No invoices yet"
          body="Invoice history will populate after your first paid cycle. Past trial periods are not invoiced."
        />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices on file"
          body="Stripe hasn't synced any invoices to your account yet."
        />
      ) : (
        <ul className="divide-y divide-border -mx-5">
          {invoices.slice(0, 6).map((inv) => (
            <li
              key={inv.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div>
                <p className="text-sm text-fg">{inv.description}</p>
                <p className="text-xs text-fg-muted mt-0.5">
                  {inv.date} · {inv.status}
                </p>
              </div>
              <div className="text-sm text-fg font-mono">{inv.amount}</div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-6 px-4">
      <p className="text-sm text-fg">{title}</p>
      <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  );
}
