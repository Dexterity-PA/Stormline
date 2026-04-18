# App Shell + Dashboard Skeleton — Design

**Date:** 2026-04-18  
**Branch:** p1-app-shell  
**Stream:** Phase 1, Stream 5

---

## Scope

Full navigable app shell for all `/app/*` routes. Mock data only — no DB calls. Every route reachable, every page renders with believable content.

Files in scope:

- `app/app/layout.tsx`
- `app/app/page.tsx`
- `app/app/briefings/page.tsx`
- `app/app/briefings/[id]/page.tsx`
- `app/app/alerts/page.tsx`
- `app/app/alerts/[id]/page.tsx`
- `app/app/indicators/page.tsx`
- `app/app/indicators/[code]/page.tsx`
- `app/app/settings/profile/page.tsx`
- `app/app/settings/notifications/page.tsx`
- `app/app/settings/billing/page.tsx`
- `components/shell/Sidebar.tsx`
- `components/shell/MobileSidebar.tsx`
- `components/shell/TopBar.tsx`
- `components/shell/NavLink.tsx`
- `components/dashboard/TileGrid.tsx`
- `components/dashboard/Tile.tsx`
- `components/dashboard/Sparkline.tsx`
- `components/briefing/BriefingReader.tsx`
- `components/briefing/BriefingSection.tsx`
- `components/briefing/BriefingCard.tsx`
- `components/briefing/BriefingListFilter.tsx`
- `components/alert/AlertCard.tsx`
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Select.tsx`
- `components/ui/Toggle.tsx`

Forbidden: `app/admin/**`, `app/(marketing)/**`, `lib/db/queries/**`, `styles/globals.css`, `package.json` (except recharts install), `proxy.ts`, any `lib/*` adapter files.

---

## Architecture

### Shell layout

`app/app/layout.tsx` is an async Server Component. It is the root for all authed app routes. Clerk middleware (`proxy.ts`) already enforces auth on `/app/*` — no additional guard in the layout.

Structure:
```
<html body>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />            {/* Server Component, fixed 240px */}
    <div class="flex-1 flex flex-col overflow-auto">
      <TopBar />           {/* 'use client' — region selector */}
      <main>{children}</main>
    </div>
  </div>
  <MobileSidebar />        {/* 'use client' — hamburger + drawer, useState */}
```

### Sidebar

Server Component. Renders logo, nav link groups, and Clerk `<UserButton>` in the footer. Nav links use a thin `NavLink.tsx` `'use client'` wrapper that reads `usePathname()` to apply active styles. No other JS in the sidebar tree.

Nav groups:
- **Main:** Dashboard (`/app`), Briefings (`/app/briefings`), Alerts (`/app/alerts`), Indicators (`/app/indicators`)
- **Settings:** Profile, Notifications, Billing

### Mobile sidebar

Single `MobileSidebar.tsx` `'use client'` component. Contains hamburger `<button>` + slide-in drawer with the same nav links. Uses `useState(false)` for open/closed — no context provider. Rendered outside the main layout column so it overlays correctly. Visible only below `md` breakpoint.

### TopBar region selector

`TopBar.tsx` is `'use client'`. Reads `?region` from `useSearchParams()`. On change, calls `router.replace(pathname + '?region=' + value)`. Region is a URL-first global filter — links are shareable, no local state escapes the URL.

---

## Component tree

```
app/app/layout.tsx (Server)
  ├── components/shell/Sidebar.tsx (Server)
  │     └── components/shell/NavLink.tsx ('use client')
  ├── components/shell/TopBar.tsx ('use client')
  └── components/shell/MobileSidebar.tsx ('use client')

app/app/page.tsx (Server)
  └── components/dashboard/TileGrid.tsx (Server)
        └── components/dashboard/Tile.tsx (Server)
              └── components/dashboard/Sparkline.tsx (Server — pure SVG)

app/app/briefings/page.tsx (Server)
  ├── components/briefing/BriefingListFilter.tsx ('use client' — filter state)
  └── components/briefing/BriefingCard.tsx (Server)

app/app/briefings/[id]/page.tsx (Server)
  └── components/briefing/BriefingReader.tsx (Server)
        └── components/briefing/BriefingSection.tsx (Server)

app/app/alerts/page.tsx (Server)
  └── components/alert/AlertCard.tsx (Server)

app/app/alerts/[id]/page.tsx (Server)

app/app/indicators/page.tsx (Server — filter is link-based, no JS needed)

app/app/indicators/[code]/page.tsx (Server)
  └── recharts AreaChart in a 'use client' wrapper component

app/app/settings/profile/page.tsx (Server with form fields, no submit wiring)
app/app/settings/notifications/page.tsx ('use client' — Toggle state)
app/app/settings/billing/page.tsx (Server — button placeholder)
```

---

## Mock data strategy

Each page file exports a `const MOCK_*` typed object at the top. No imports from `lib/db`. Types are defined inline or in a co-located `types.ts` within the component directory.

Mock content covers:
- **Dashboard:** 3 industry views (restaurant/construction/retail), 8–10 tiles each, 24 data points per sparkline
- **Briefings:** 3 published briefings (one per industry), believable macro language
- **Alerts:** 4 alerts — hurricane (high), tariff (medium), FOMC (medium), commodity move (low)
- **Indicators:** Full registry pulled from `lib/indicators/registry.ts` (read-only import, no DB), 52 data points for detail chart

Intelligence-not-advice framing throughout all mock text: "historical pattern indicates," "operators in similar conditions have," "trends suggest."

---

## UI conventions

**Tokens:** `--sl-*` tokens only, via `@theme inline` aliases in globals.css. No hardcoded hex.

**Card baseline:**
```
bg-bg-elev border border-border rounded-[var(--radius-md)] p-4
```

**Delta coloring** (cost inputs):
- Up = `text-crit` (red)
- Down = `text-good` (green)
- Demand indicators: inverse

**Tile anatomy** (280×180px target):
- Label (`text-fg-muted text-xs`)
- Current value (large, `font-display`)
- 1w delta badge
- Sparkline (inline SVG, 80×32 viewBox, normalized server-side)
- 5-year percentile band (text, e.g. "82nd pct")
- Source + last updated (subtitle)
- Full tile is a link → `/app/indicators/[code]`

**Sparkline:** Server Component. Accepts `values: number[]`. Normalizes to 0–1, computes SVG `points` string, renders `<polyline>` in a fixed viewBox. No `'use client'`, no recharts.

**Indicator chart:** recharts `<AreaChart>` in a `'use client'` wrapper. `stroke` = `var(--sl-accent)`, `fill` gradient. No tooltip in this stream.

---

## Shared `components/ui/` API

| Component | Props |
|---|---|
| `Button` | `variant: 'primary' \| 'ghost' \| 'outline'`, `size?: 'sm' \| 'md'`, `children`, `className?` |
| `Card` | `children`, `className?` — wrapper div only |
| `Badge` | `variant: 'industry' \| 'severity' \| 'status'`, `label: string` |
| `Select` | `value`, `onChange`, `options: { value: string; label: string }[]` |
| `Toggle` | `checked: boolean`, `onChange: (v: boolean) => void`, `label?: string` |

**Naming note for other streams:** `Card` is a plain wrapper div — Stream 6 (admin) and Streams 3–4 (marketing) should import from `@/components/ui/Card` for consistency. No default export conflicts expected; all are named exports.

---

## Dependencies

One new install: `recharts`. Approved by user. Added to `dependencies` (runtime, not devDependencies — used in client components).

```
pnpm add recharts
```

No other new packages.

---

## Constraints

- Server Components by default; `'use client'` only where documented above
- Responsive: desktop-first fixed sidebar, mobile slide-in drawer at `< md`
- No real DB calls anywhere in this stream
- No auto-publish logic, no financial advice copy
- `lib/db/schema.ts` and `lib/indicators/registry.ts` are read-only imports — no writes
