'use client';

import { useRef, useState } from 'react';
import { IndicatorHoverCard } from './IndicatorHoverCard';
import type { IndicatorRef } from './types';

interface IndicatorChipProps {
  term: string;
  indicator: IndicatorRef | undefined;
  variant?: 'inline' | 'rail';
}

export function IndicatorChip({
  term,
  indicator,
  variant = 'inline',
}: IndicatorChipProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }

  function scheduleHide() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  if (!indicator) {
    return <span>{term}</span>;
  }

  const chipBase =
    variant === 'rail'
      ? 'w-full justify-between bg-bg-elev-2 border border-border px-2.5 py-2 text-xs'
      : 'bg-accent/10 border border-accent/20 text-accent px-1.5 py-0 text-[0.95em] align-baseline';

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onFocus={show}
      onBlur={scheduleHide}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
        className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] font-medium leading-tight hover:bg-accent/15 focus:outline-none focus:ring-1 focus:ring-accent transition-colors ${chipBase}`}
      >
        <span className={variant === 'inline' ? 'underline decoration-accent/40 decoration-dotted underline-offset-2' : ''}>
          {term}
        </span>
        {variant === 'rail' && (
          <span className="font-mono text-[10px] text-fg-muted ml-auto">
            {indicator.code.split(':')[1]}
          </span>
        )}
      </button>
      {open && (
        <span
          role="dialog"
          className="absolute z-[var(--z-tooltip)] left-0 top-full mt-1 block"
          onMouseEnter={show}
          onMouseLeave={scheduleHide}
        >
          <IndicatorHoverCard indicator={indicator} />
        </span>
      )}
    </span>
  );
}
