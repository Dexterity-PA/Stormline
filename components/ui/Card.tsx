export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-bg-elev border border-border rounded-[var(--radius-md)] ${className}`}
    >
      {children}
    </div>
  );
}
