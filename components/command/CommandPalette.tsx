'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { CommandGroup } from './CommandGroup';
import { CommandItem } from './CommandItem';
import type {
  ActionItem,
  BriefingItem,
  IndicatorItem,
  NavigateItem,
  PaletteData,
  PaletteItem,
} from './types';

const NAV_ITEMS: NavigateItem[] = [
  { id: 'nav-dashboard', kind: 'navigate', label: 'Dashboard', href: '/app', hint: 'Current snapshot' },
  { id: 'nav-briefings', kind: 'navigate', label: 'Briefings', href: '/app/briefings', hint: 'Weekly reads' },
  { id: 'nav-alerts', kind: 'navigate', label: 'Alerts', href: '/app/alerts', hint: 'Event inbox' },
  { id: 'nav-indicators', kind: 'navigate', label: 'Indicators', href: '/app/indicators', hint: 'Library' },
  { id: 'nav-profile', kind: 'navigate', label: 'Profile', href: '/app/settings/profile' },
  { id: 'nav-notifications', kind: 'navigate', label: 'Notifications', href: '/app/settings/notifications' },
  { id: 'nav-billing', kind: 'navigate', label: 'Billing', href: '/app/settings/billing' },
];

const DENSITY_KEY = 'sl-density';
const PINS_KEY = 'sl-pinned-indicators';

function scoreMatch(haystack: string, needle: string): number {
  if (!needle) return 1;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h === n) return 1000;
  if (h.startsWith(n)) return 500;
  const idx = h.indexOf(n);
  if (idx >= 0) return 200 - idx;
  // subsequence
  let hi = 0;
  let ni = 0;
  while (hi < h.length && ni < n.length) {
    if (h[hi] === n[ni]) ni++;
    hi++;
  }
  return ni === n.length ? 50 - (h.length - n.length) : -1;
}

export interface CommandPaletteProps {
  data: PaletteData;
}

export function CommandPalette({ data }: CommandPaletteProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const indicatorItems = useMemo<IndicatorItem[]>(
    () =>
      data.indicators.slice(0, 20).map((i) => ({
        id: `ind-${i.code}`,
        kind: 'indicator',
        label: i.name,
        code: i.code,
        hint: i.costBucket ?? undefined,
      })),
    [data.indicators],
  );

  const briefingItems = useMemo<BriefingItem[]>(
    () =>
      data.briefings.slice(0, 5).map((b) => ({
        id: `brf-${b.id}`,
        kind: 'briefing',
        label: b.headline,
        href: `/app/briefings/${b.id}`,
        hint: b.industry,
      })),
    [data.briefings],
  );

  const actionItems: ActionItem[] = useMemo(
    () => [
      { id: 'act-density', kind: 'action', label: 'Toggle density', action: 'toggleDensity', hint: 'compact ⇄ comfortable' },
      { id: 'act-pin', kind: 'action', label: 'Pin first match to dashboard', action: 'pinIndicator', hint: 'local only' },
      { id: 'act-signout', kind: 'action', label: 'Sign out', action: 'signOut' },
    ],
    [],
  );

  const groups = useMemo(() => {
    const filter = (items: PaletteItem[]) => {
      if (!query.trim()) return items;
      return items
        .map((it) => ({ it, s: scoreMatch(it.label + ' ' + (it.hint ?? ''), query.trim()) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.it);
    };
    return [
      { label: 'Navigate', items: filter(NAV_ITEMS) },
      { label: 'Indicators', items: filter(indicatorItems) },
      { label: 'Briefings', items: filter(briefingItems) },
      { label: 'Actions', items: filter(actionItems) },
    ].filter((g) => g.items.length > 0);
  }, [query, indicatorItems, briefingItems, actionItems]);

  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  const runAction = useCallback(
    async (action: ActionItem['action'], label: string) => {
      if (action === 'toggleDensity') {
        const current =
          typeof document !== 'undefined'
            ? document.documentElement.getAttribute('data-density') ?? 'comfortable'
            : 'comfortable';
        const next = current === 'compact' ? 'comfortable' : 'compact';
        document.documentElement.setAttribute('data-density', next);
        try {
          localStorage.setItem(DENSITY_KEY, next);
        } catch {
          // storage denied; state still applies this session
        }
      } else if (action === 'pinIndicator') {
        const first = indicatorItems[0];
        if (!first) return;
        try {
          const raw = localStorage.getItem(PINS_KEY);
          const parsed: unknown = raw ? JSON.parse(raw) : [];
          const list = Array.isArray(parsed) ? (parsed as string[]) : [];
          if (!list.includes(first.code)) list.push(first.code);
          localStorage.setItem(PINS_KEY, JSON.stringify(list));
        } catch {
          // storage denied
        }
      } else if (action === 'signOut') {
        await signOut({ redirectUrl: '/' });
      }
      // label argument retained for future telemetry
      void label;
    },
    [indicatorItems, signOut],
  );

  const selectItem = useCallback(
    (item: PaletteItem) => {
      close();
      if (item.kind === 'navigate') {
        router.push(item.href);
      } else if (item.kind === 'indicator') {
        router.push(`/app/indicators/${encodeURIComponent(item.code)}`);
      } else if (item.kind === 'briefing') {
        router.push(item.href);
      } else if (item.kind === 'action') {
        void runAction(item.action, item.label);
      }
    },
    [close, router, runAction],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement | null;
      const inField =
        tgt?.tagName === 'INPUT' ||
        tgt?.tagName === 'TEXTAREA' ||
        tgt?.isContentEditable;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        if (inField && !mod) return;
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(flatItems.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = flatItems[active];
        if (it) selectItem(it);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flatItems, active, selectItem]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  let idx = -1;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-bg-0/70 backdrop-blur-sm sm:pt-[18vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="w-full max-w-xl flex-1 sm:flex-initial flex flex-col bg-bg-elev border border-border shadow-2xl sm:rounded-[var(--radius-lg)] sm:mx-4 overflow-hidden h-full sm:h-auto sm:max-h-[70vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <span className="text-xs text-fg-dim font-mono">⌘K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search indicators, briefings, actions…"
            className="flex-1 bg-transparent px-1 py-3 text-sm text-fg placeholder:text-fg-dim focus:outline-none"
            aria-label="Command palette search"
          />
          <kbd className="text-[10px] text-fg-dim border border-border rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {groups.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-fg-muted">
              No matches. Try a different term.
            </div>
          ) : (
            groups.map((g) => (
              <CommandGroup key={g.label} label={g.label}>
                {g.items.map((it) => {
                  idx++;
                  const myIdx = idx;
                  return (
                    <div key={it.id} data-idx={myIdx}>
                      <CommandItem
                        label={it.label}
                        hint={'hint' in it ? it.hint : undefined}
                        active={myIdx === active}
                        onSelect={() => selectItem(it)}
                        onHover={() => setActive(myIdx)}
                      />
                    </div>
                  );
                })}
              </CommandGroup>
            ))
          )}
        </div>
        <div className="border-t border-border px-3 py-2 text-[10px] text-fg-dim flex items-center justify-between">
          <span>Intelligence patterns — navigation only. No advice issued.</span>
          <span className="hidden sm:inline">↑↓ navigate · ⏎ select · Esc close</span>
        </div>
      </div>
    </div>
  );
}
