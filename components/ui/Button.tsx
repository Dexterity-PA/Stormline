type ButtonVariant = 'primary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-bg font-medium hover:opacity-90',
  ghost: 'text-fg-muted hover:text-fg hover:bg-bg-elev',
  outline: 'border border-border text-fg hover:bg-bg-elev',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)]',
  md: 'px-4 py-2 text-sm rounded-[var(--radius-md)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...props}
    />
  );
}
