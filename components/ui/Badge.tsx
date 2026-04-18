export interface BadgeProps {
  variant: 'industry' | 'severity' | 'status';
  label: string;
  className?: string;
}

const LABEL_CLASSES: Record<string, string> = {
  // industry
  restaurant: 'bg-accent/10 text-accent border border-accent/20',
  construction: 'bg-warn/10 text-warn border border-warn/20',
  retail: 'bg-good/10 text-good border border-good/20',
  // severity
  high: 'bg-crit/10 text-crit border border-crit/20',
  medium: 'bg-warn/10 text-warn border border-warn/20',
  low: 'bg-fg-muted/10 text-fg-muted border border-fg-muted/20',
  // status
  published: 'bg-good/10 text-good border border-good/20',
  draft: 'bg-fg-muted/10 text-fg-muted border border-fg-muted/20',
  review: 'bg-accent/10 text-accent border border-accent/20',
  trial: 'bg-warn/10 text-warn border border-warn/20',
};

const FALLBACK = 'bg-fg-muted/10 text-fg-muted border border-fg-muted/20';

export function Badge({ variant: _variant, label, className = '' }: BadgeProps) {
  const classes = LABEL_CLASSES[label.toLowerCase()] ?? FALLBACK;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] ${classes} ${className}`}
    >
      {label}
    </span>
  );
}
