export type BadgeVariant =
  | 'draft'
  | 'published'
  | 'rejected'
  | 'pending'
  | 'live'
  | 'active'
  | 'inactive'
  | 'trial'
  | 'high'
  | 'medium'
  | 'low';

const CLASSES: Record<BadgeVariant, string> = {
  draft:     'bg-warn/15 text-warn',
  published: 'bg-good/15 text-good',
  rejected:  'bg-crit/15 text-crit',
  pending:   'bg-fg-muted/15 text-fg-muted',
  live:      'bg-accent/15 text-accent',
  active:    'bg-good/15 text-good',
  inactive:  'bg-fg-muted/15 text-fg-muted',
  trial:     'bg-accent/15 text-accent',
  high:      'bg-crit/15 text-crit',
  medium:    'bg-warn/15 text-warn',
  low:       'bg-fg-muted/15 text-fg-muted',
};

export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono ${CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
