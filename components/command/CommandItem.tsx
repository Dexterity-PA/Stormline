'use client';

import { forwardRef } from 'react';

export interface CommandItemProps {
  label: string;
  hint?: string;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
}

export const CommandItem = forwardRef<HTMLButtonElement, CommandItemProps>(
  function CommandItem({ label, hint, active, onSelect, onHover }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        onMouseEnter={onHover}
        className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
          active
            ? 'bg-accent/10 text-fg'
            : 'text-fg hover:bg-bg-elev-2'
        }`}
      >
        <span className="truncate">{label}</span>
        {hint && (
          <span className="text-xs text-fg-dim truncate max-w-[40%]">
            {hint}
          </span>
        )}
      </button>
    );
  },
);
