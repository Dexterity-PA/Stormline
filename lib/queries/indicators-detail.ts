import { and, arrayOverlaps, asc, desc, eq, gte, ilike, inArray, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/lib/db';
import { alerts, briefings, indicators } from '@/lib/db/schema';
import { indicatorObservations } from '@/lib/db/schema/observations';
import type { Industry } from '@/lib/indicators/types';
import { INDICATOR_REGISTRY, getIndicator } from '@/lib/indicators/registry';

export interface HistoryPoint {
  date: string;
  value: number;
}

export interface IndicatorWithHistory {
  indicator: {
    id: string;
    code: string;
    name: string;
    unit: string;
    source: string;
    sourceId: string;
    industryTags: readonly Industry[];
    costBucket: string | null;
    frequency: string;
  };
  history: HistoryPoint[];
}

export interface BriefingMention {
  id: string;
  industry: string;
  headline: string;
  weekStart: string;
  weekEnd: string;
  publishedAt: Date | null;
  status: string;
}

export interface AlertForIndicator {
  id: string;
  category: string;
  headline: string;
  severity: string;
  publishedAt: Date;
  industries: string[];
  regions: string[];
}

export interface RelatedIndicatorRow {
  code: string;
  name: string;
  unit: string;
  costBucket: string | null;
  industryTags: readonly Industry[];
}

const CodeSchema = z.string().min(1);
const MonthsSchema = z.number().int().positive().max(600);

function monthsAgoIso(months: number): string {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, now.getUTCDate()),
  );
  return d.toISOString().slice(0, 10);
}

function toNumber(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`indicator observation value is not finite: ${raw}`);
  }
  return n;
}

/**
 * Load an indicator row joined with its observation history.
 *
 * Resolves indicator metadata from the database (authoritative source for id)
 * and falls back to registry metadata when the row hasn't been synced yet.
 * Returns null if the code is not in the registry.
 */
export async function getIndicatorWithHistory(
  code: string,
  rangeMonths: number,
): Promise<IndicatorWithHistory | null> {
  const parsedCode = CodeSchema.parse(code);
  const parsedMonths = MonthsSchema.parse(rangeMonths);

  const def = getIndicator(parsedCode);
  if (!def) return null;

  const [row] = await db
    .select()
    .from(indicators)
    .where(eq(indicators.code, parsedCode))
    .limit(1);

  if (!row) {
    return {
      indicator: {
        id: '',
        code: def.code,
        name: def.name,
        unit: def.unit,
        source: def.source,
        sourceId: def.sourceId,
        industryTags: def.industryTags,
        costBucket: def.costBucket,
        frequency: def.frequency,
      },
      history: [],
    };
  }

  const since = monthsAgoIso(parsedMonths);
  const obsRows = await db
    .select({
      date: indicatorObservations.obsDate,
      value: indicatorObservations.value,
    })
    .from(indicatorObservations)
    .where(
      and(
        eq(indicatorObservations.indicatorId, row.id),
        gte(indicatorObservations.obsDate, since),
      ),
    )
    .orderBy(asc(indicatorObservations.obsDate));

  return {
    indicator: {
      id: row.id,
      code: row.code,
      name: row.name,
      unit: row.unit,
      source: row.source,
      sourceId: row.sourceId,
      industryTags: row.industryTags as Industry[],
      costBucket: row.costBucket,
      frequency: row.frequency,
    },
    history: obsRows.map((r) => ({ date: r.date, value: toNumber(r.value) })),
  };
}

/**
 * Search indicators by name/code/source via ILIKE. Optionally restrict to an
 * industry tag. Registry-backed (no DB hit) so the library page can render
 * the full catalog even before observations are synced.
 */
export interface SearchOptions {
  industry?: Industry;
  limit?: number;
}

export function searchIndicators(
  q: string,
  options: SearchOptions = {},
): RelatedIndicatorRow[] {
  const query = q.trim().toLowerCase();
  const { industry, limit } = options;

  const pool = industry
    ? INDICATOR_REGISTRY.filter((d) => d.industryTags.includes(industry))
    : INDICATOR_REGISTRY;

  const matches = query
    ? pool.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.code.toLowerCase().includes(query) ||
          d.source.toLowerCase().includes(query),
      )
    : pool;

  const rows: RelatedIndicatorRow[] = matches.map((d) => ({
    code: d.code,
    name: d.name,
    unit: d.unit,
    costBucket: d.costBucket,
    industryTags: d.industryTags,
  }));

  return limit ? rows.slice(0, limit) : rows;
}

/**
 * Briefings whose headline or body text mentions the given indicator.
 * Simple ILIKE match for MVP — a proper tsvector index is Phase 3.
 */
export async function getBriefingsMentioning(
  indicatorCode: string,
  limit = 3,
): Promise<BriefingMention[]> {
  const code = CodeSchema.parse(indicatorCode);
  const def = getIndicator(code);
  const name = def?.name ?? '';

  const needleCode = `%${code}%`;
  const needleName = name ? `%${name}%` : null;

  const rows = await db
    .select({
      id: briefings.id,
      industry: briefings.industry,
      headline: briefings.headline,
      weekStart: briefings.weekStart,
      weekEnd: briefings.weekEnd,
      publishedAt: briefings.publishedAt,
      status: briefings.status,
    })
    .from(briefings)
    .where(
      and(
        eq(briefings.status, 'published'),
        needleName
          ? or(
              ilike(briefings.bodyMd, needleCode),
              ilike(briefings.headline, needleCode),
              ilike(briefings.bodyMd, needleName),
              ilike(briefings.headline, needleName),
            )
          : or(
              ilike(briefings.bodyMd, needleCode),
              ilike(briefings.headline, needleCode),
            ),
      ),
    )
    .orderBy(desc(briefings.publishedAt))
    .limit(Math.max(1, Math.min(limit, 20)));

  return rows.map((r) => ({
    id: r.id,
    industry: r.industry,
    headline: r.headline,
    weekStart: r.weekStart,
    weekEnd: r.weekEnd,
    publishedAt: r.publishedAt,
    status: r.status,
  }));
}

/**
 * Active alerts whose industries overlap with the indicator's industry tags.
 *
 * MVP heuristic: alerts are currently tagged by industry + region, not directly
 * linked to indicator codes. We surface the most recent alerts whose industry
 * scope intersects the indicator's scope. When an `alert.indicators` join
 * arrives in a later migration, swap this to a direct lookup.
 */
export async function getAlertsForIndicator(
  indicatorCode: string,
  limit = 5,
): Promise<AlertForIndicator[]> {
  const code = CodeSchema.parse(indicatorCode);
  const def = getIndicator(code);
  if (!def || def.industryTags.length === 0) return [];

  const rows = await db
    .select({
      id: alerts.id,
      category: alerts.category,
      headline: alerts.headline,
      severity: alerts.severity,
      publishedAt: alerts.publishedAt,
      industries: alerts.industries,
      regions: alerts.regions,
    })
    .from(alerts)
    .where(arrayOverlaps(alerts.industries, [...def.industryTags]))
    .orderBy(desc(alerts.publishedAt))
    .limit(Math.max(1, Math.min(limit, 25)));

  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    headline: r.headline,
    severity: r.severity,
    publishedAt: r.publishedAt,
    industries: r.industries,
    regions: r.regions,
  }));
}

/**
 * Related indicators: same transmission mechanism + industry overlap, capped at 4.
 * Returns registry rows annotated with the latest observation percentile and
 * a 30-day observation sparkline for display.
 */
export interface RelatedIndicatorWithSeries extends RelatedIndicatorRow {
  series30d: HistoryPoint[];
  latestPercentile: number | null;
}

export async function getRelatedIndicators(
  indicatorCode: string,
): Promise<RelatedIndicatorWithSeries[]> {
  const code = CodeSchema.parse(indicatorCode);
  const def = getIndicator(code);
  if (!def) return [];

  const peers = INDICATOR_REGISTRY.filter(
    (r) =>
      r.code !== def.code &&
      r.industryTags.some((t) => def.industryTags.includes(t)) &&
      r.costBucket === def.costBucket,
  ).slice(0, 4);

  if (peers.length === 0) return [];

  const peerCodes = peers.map((p) => p.code);

  // Pull last 60 months of observations for percentile calc + 30d sparkline.
  const sinceIso = monthsAgoIso(60);
  const rows = await db
    .select({
      code: indicators.code,
      date: indicatorObservations.obsDate,
      value: indicatorObservations.value,
    })
    .from(indicatorObservations)
    .innerJoin(indicators, eq(indicatorObservations.indicatorId, indicators.id))
    .where(
      and(
        inArray(indicators.code, peerCodes),
        gte(indicatorObservations.obsDate, sinceIso),
      ),
    )
    .orderBy(asc(indicatorObservations.obsDate));

  const byCode = new Map<string, HistoryPoint[]>();
  for (const c of peerCodes) byCode.set(c, []);
  for (const r of rows) {
    const bucket = byCode.get(r.code);
    if (bucket) bucket.push({ date: r.date, value: toNumber(r.value) });
  }

  const sinceSparkIso = monthsAgoIso(1);

  return peers.map((p) => {
    const hist = byCode.get(p.code) ?? [];
    const latest = hist.at(-1)?.value ?? null;
    const percentile =
      hist.length > 1 && latest !== null
        ? computePercentile(
            hist.map((h) => h.value),
            latest,
          )
        : null;
    const series30d = hist.filter((h) => h.date >= sinceSparkIso);
    return {
      code: p.code,
      name: p.name,
      unit: p.unit,
      costBucket: p.costBucket,
      industryTags: p.industryTags,
      series30d,
      latestPercentile: percentile,
    };
  });
}

/**
 * Percentile rank (0–100) of `value` within `series`, exclusive of the
 * value itself. Useful to surface "this reading is unusually high/low."
 */
export function computePercentile(series: number[], value: number): number {
  if (series.length === 0) return 50;
  let below = 0;
  for (const v of series) if (v < value) below += 1;
  return Math.round((below / series.length) * 100);
}
