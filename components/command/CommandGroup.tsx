'use client';

export interface CommandGroupProps {
  label: string;
  children: React.ReactNode;
}

export function CommandGroup({ label, children }: CommandGroupProps) {
  return (
    <div className="py-1">
      <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-fg-dim font-medium">
        {label}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
