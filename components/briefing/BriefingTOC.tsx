'use client';

import { useEffect, useRef, useState } from 'react';
import type { TOCEntry } from '@/lib/briefing/markdown';

export interface BriefingTOCProps {
  entries: readonly TOCEntry[];
  variant?: 'rail' | 'mobile';
}

export function BriefingTOC({ entries, variant = 'rail' }: BriefingTOCProps) {
  const [activeAnchor, setActiveAnchor] = useState<string | null>(
    entries[0]?.anchor ?? null,
  );
  const clickTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (entries.length === 0) return;

    const sectionEls = entries
      .map((entry) => document.getElementById(entry.anchor))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionEls.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          visibility.set(record.target.id, record.intersectionRatio);
        }

        // If user just clicked, snap to that anchor and clear the override
        // once it becomes the most visible section.
        let bestAnchor: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visibility.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestAnchor = id;
          }
        }

        if (clickTargetRef.current) {
          const pending = clickTargetRef.current;
          setActiveAnchor(pending);
          if (bestAnchor === pending) clickTargetRef.current = null;
          return;
        }

        if (bestAnchor && bestRatio > 0) {
          setActiveAnchor(bestAnchor);
        }
      },
      {
        // Treat the sweet spot of the viewport as the "active" band:
        // top is offset by the TopBar (48px) + a little breathing room, bottom
        // cropped so the very last section still activates before you hit it.
        rootMargin: '-80px 0px -55% 0px',
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
      },
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, anchor: string) {
    const target = document.getElementById(anchor);
    if (!target) return;
    event.preventDefault();
    clickTargetRef.current = anchor;
    setActiveAnchor(anchor);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${anchor}`);
  }

  if (entries.length === 0) return null;

  if (variant === 'mobile') {
    return (
      <details className="xl:hidden mb-4 rounded-[var(--radius-md)] border border-border bg-bg-elev">
        <summary className="px-3 py-2.5 text-xs font-medium text-fg-muted uppercase tracking-wider cursor-pointer select-none list-none flex items-center justify-between">
          <span>On this page</span>
          <span className="text-fg-muted">↓</span>
        </summary>
        <nav className="px-2 pb-2">
          <ol className="space-y-0.5">
            {entries.map((entry) => (
              <li key={entry.anchor}>
                <a
                  href={`#${entry.anchor}`}
                  onClick={(e) => handleClick(e, entry.anchor)}
                  className={`block px-2 py-1.5 text-xs rounded-[var(--radius-sm)] transition-colors ${
                    activeAnchor === entry.anchor
                      ? 'bg-accent/10 text-accent'
                      : 'text-fg-muted hover:text-fg hover:bg-bg-elev-2'
                  }`}
                >
                  {entry.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="Briefing sections" className="hidden xl:block">
      <div className="sticky top-6">
        <p className="text-[10px] font-medium text-fg-muted uppercase tracking-[0.14em] mb-3 px-2">
          On this page
        </p>
        <ol className="space-y-0.5 border-l border-border">
          {entries.map((entry) => {
            const active = activeAnchor === entry.anchor;
            return (
              <li key={entry.anchor}>
                <a
                  href={`#${entry.anchor}`}
                  onClick={(e) => handleClick(e, entry.anchor)}
                  className={`block pl-3 pr-2 py-1.5 -ml-px border-l text-xs transition-colors ${
                    active
                      ? 'border-accent text-accent font-medium'
                      : 'border-transparent text-fg-muted hover:text-fg'
                  }`}
                >
                  {entry.title}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

