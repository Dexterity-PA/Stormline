export type CommandItemKind =
  | 'navigate'
  | 'indicator'
  | 'briefing'
  | 'action';

export interface NavigateItem {
  id: string;
  kind: 'navigate';
  label: string;
  href: string;
  hint?: string;
}

export interface IndicatorItem {
  id: string;
  kind: 'indicator';
  label: string;
  code: string;
  hint?: string;
}

export interface BriefingItem {
  id: string;
  kind: 'briefing';
  label: string;
  href: string;
  hint?: string;
}

export interface ActionItem {
  id: string;
  kind: 'action';
  label: string;
  action: 'toggleDensity' | 'pinIndicator' | 'signOut';
  hint?: string;
}

export type PaletteItem =
  | NavigateItem
  | IndicatorItem
  | BriefingItem
  | ActionItem;

export interface PaletteData {
  indicators: Array<{ code: string; name: string; costBucket: string | null }>;
  briefings: Array<{ id: string; headline: string; industry: string; publishedAt: string | null }>;
}
