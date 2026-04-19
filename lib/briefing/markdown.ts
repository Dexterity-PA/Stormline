import type { InlineIndicator } from '@/components/briefing/types';

export type BodySegment =
  | { kind: 'text'; value: string }
  | { kind: 'indicator'; value: string; code: string };

export function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitBodyIntoParagraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export interface TOCEntry {
  title: string;
  anchor: string;
}

export function toTOCEntries(titles: readonly string[]): TOCEntry[] {
  return titles.map((title) => ({ title, anchor: slugifyHeading(title) }));
}

export function tokenizeParagraph(
  paragraph: string,
  inlineIndicators: readonly InlineIndicator[],
): BodySegment[] {
  if (inlineIndicators.length === 0) {
    return [{ kind: 'text', value: paragraph }];
  }

  const sorted = [...inlineIndicators].sort((a, b) => b.term.length - a.term.length);
  const pattern = new RegExp(
    `\\b(${sorted.map((i) => escapeRegExp(i.term)).join('|')})\\b`,
    'gi',
  );

  const segments: BodySegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(paragraph)) !== null) {
    const matchedText = match[0];
    const start = match.index;
    const indicator = sorted.find(
      (i) => i.term.toLowerCase() === matchedText.toLowerCase(),
    );
    if (!indicator) continue;

    if (start > lastIndex) {
      segments.push({ kind: 'text', value: paragraph.slice(lastIndex, start) });
    }
    segments.push({ kind: 'indicator', value: matchedText, code: indicator.code });
    lastIndex = start + matchedText.length;
  }

  if (lastIndex < paragraph.length) {
    segments.push({ kind: 'text', value: paragraph.slice(lastIndex) });
  }

  return segments;
}
