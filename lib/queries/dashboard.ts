import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { alerts, briefings } from "@/lib/db/schema";
import {
  INDICATOR_REGISTRY,
  listIndicatorsByIndustry as registryByIndustry,
} from "@/lib/indicators/registry";
import type { Industry } from "@/lib/indicators/types";
import {
  getObservations,
  getObservationsForCodes,
  type ObservationPoint,
} from "@/lib/queries/observations";

// ── Types ────────────────────────────────────────────────────────────────────

export type DeltaType = "cost" | "demand";

export interface RegimeDriver {
  code: string;
  label: string;
  value: string;
  unit: string;
  percentile: number | null;
}

export interface RegimeSnapshot {
  label: string;
  detail: string;
  drivers: RegimeDriver[];
  highSeverityAlertCount: number;
  headline: string | null;
  briefingId: string | null;
}

export interface MoverTile {
  code: string;
  name: string;
  value: string;
  unit: string;
  deltaPercent: number;
  deltaType: DeltaType;
  series: number[];
}

export interface IndicatorTileData {
  code: string;
  name: string;
  value: string;
  unit: string;
  deltaPercent: number;
  deltaType: DeltaType;
  percentile: number | null;
  source: string;
  lastUpdated: string;
  series: number[];
  operatorContext: string;
}

export interface DashboardAlert {
  id: string;
  category: string;
  severity: "low" | "medium" | "high";
  headline: string;
  publishedAt: string;
}

export interface BriefingPreview {
  id: string;
  headline: string;
  weekStart: string;
  weekEnd: string;
  publishedAt: string | null;
  excerpt: string;
}

export interface DashboardData {
  regime: RegimeSnapshot;
  topMovers: MoverTile[];
  tiles: IndicatorTileData[];
  alerts: DashboardAlert[];
  latestBriefing: BriefingPreview | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const COST_BUCKETS_DEMAND = new Set([
  "demand",
  "consumer_credit",
  "menu_pricing",
]);

/** A bucket is "demand-side" (up = good for the operator) when it tracks
 *  consumer activity rather than an input cost. Default = cost (up = bad). */
export function classifyDelta(costBucket: string | null | undefined): DeltaType {
  if (!costBucket) return "cost";
  return COST_BUCKETS_DEMAND.has(costBucket) ? "demand" : "cost";
}

function formatValue(raw: number, unit: string): string {
  const abs = Math.abs(raw);
  const fractionDigits = abs >= 1000 ? 0 : abs >= 100 ? 1 : 2;
  const formatted = raw.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  // Strip trailing .00 for round numbers when not currency
  if (unit === "%" && !raw.toString().includes(".")) {
    return raw.toFixed(2);
  }
  return formatted;
}

function formatDateShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function pctChange(latest: number, prior: number): number {
  if (prior === 0) return 0;
  return ((latest - prior) / Math.abs(prior)) * 100;
}

function percentileRank(values: number[], target: number): number {
  if (values.length === 0) return 50;
  let below = 0;
  for (const v of values) if (v < target) below += 1;
  return Math.round((below / values.length) * 100);
}

// ── Operator context ────────────────────────────────────────────────────────

export interface OperatorContextInput {
  series: ObservationPoint[];
  currentPercentile: number | null;
  /** Tolerance band in percentile points (default ±10pp). */
  band?: number;
}

/**
 * Counts the longest run of consecutive observations whose 5-yr percentile
 * sits within ±band of the current percentile. Returns a short string framed
 * as historical pattern (intelligence, not advice).
 */
export function computeOperatorContext({
  series,
  currentPercentile,
  band = 10,
}: OperatorContextInput): string {
  if (currentPercentile == null || series.length < 8) {
    return "Historical context insufficient";
  }
  const fiveYearAgo = new Date();
  fiveYearAgo.setFullYear(fiveYearAgo.getFullYear() - 5);
  const cutoffIso = fiveYearAgo.toISOString().slice(0, 10);
  const window = series.filter((p) => p.date >= cutoffIso);
  if (window.length < 8) return "Historical context insufficient";

  const values = window.map((p) => p.value);
  const lower = currentPercentile - band;
  const upper = currentPercentile + band;

  let longest = 0;
  let current = 0;
  for (const v of values) {
    const pct = percentileRank(values, v);
    if (pct >= lower && pct <= upper) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }

  if (longest <= 1) {
    return "Similar levels rarely sustained in last 5yr";
  }
  // Estimate run length in weeks (treat each obs as a period; for monthly series
  // multiply by ~4.3 to express in weeks).
  const cadence = window.length >= 60 ? 1 : 4.3; // ≥60 obs ⇒ weekly-ish
  const weeks = Math.round(longest * cadence);
  return `Similar environments persisted ~${weeks} wks at this level (last 5yr)`;
}

// ── Internal: build per-indicator stats from observations ───────────────────

interface PerIndicatorStats {
  latest: number;
  prior: number;
  series90: number[];
  fullSeries: ObservationPoint[];
  lastUpdated: string;
  percentile: number | null;
  deltaPercent: number;
}

function statsFromObservations(
  obs: ObservationPoint[],
): PerIndicatorStats | null {
  if (obs.length === 0) return null;
  const sorted = [...obs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1]!;
  const prior = sorted[sorted.length - 2] ?? latest;

  // 5yr window for percentile
  const fiveYearAgo = new Date();
  fiveYearAgo.setFullYear(fiveYearAgo.getFullYear() - 5);
  const cutoff = fiveYearAgo.toISOString().slice(0, 10);
  const fiveYr = sorted.filter((p) => p.date >= cutoff);
  const percentile =
    fiveYr.length >= 8 ? percentileRank(fiveYr.map((p) => p.value), latest.value) : null;

  // Sparkline: last 24 points (or last 90 days for daily series — pick longer)
  const last24 = sorted.slice(-24);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const ninetyCutoff = ninetyDaysAgo.toISOString().slice(0, 10);
  const last90d = sorted.filter((p) => p.date >= ninetyCutoff);
  const series90 = (last90d.length > last24.length ? last90d : last24).map(
    (p) => p.value,
  );

  return {
    latest: latest.value,
    prior: prior.value,
    series90,
    fullSeries: sorted,
    lastUpdated: latest.date,
    percentile,
    deltaPercent: pctChange(latest.value, prior.value),
  };
}

// ── Queries ─────────────────────────────────────────────────────────────────

/** Sparkline series for a set of indicator codes, batched. */
export async function getSparklineData(
  codes: string[],
  points = 24,
): Promise<Record<string, number[]>> {
  const months = Math.max(6, Math.ceil(points / 4));
  const obs = await getObservationsForCodes(codes, months);
  const out: Record<string, number[]> = {};
  for (const code of codes) {
    const series = obs[code] ?? [];
    out[code] = series.slice(-points).map((p) => p.value);
  }
  return out;
}

const REGIME_CODES = [
  "FRED:DFF", // Fed funds
  "FRED:BAMLH0A0HYM2", // HY OAS
  "FRED:DTWEXBGS", // Broad USD
] as const;

export async function getRegimeSnapshot(region: string): Promise<{
  label: string;
  detail: string;
  drivers: RegimeDriver[];
}> {
  // region is reserved for regional regime overlays once state-level series ship.
  void region;
  const obs = await getObservationsForCodes([...REGIME_CODES], 72);

  const drivers: RegimeDriver[] = [];
  for (const code of REGIME_CODES) {
    const def = INDICATOR_REGISTRY.find((d) => d.code === code);
    if (!def) continue;
    const stats = statsFromObservations(obs[code] ?? []);
    drivers.push({
      code: def.code,
      label: shortRegimeLabel(def.code, def.name),
      value: stats ? formatValue(stats.latest, def.unit) : "—",
      unit: def.unit,
      percentile: stats?.percentile ?? null,
    });
  }

  const fedFundsStats = statsFromObservations(obs["FRED:DFF"] ?? []);
  const hyStats = statsFromObservations(obs["FRED:BAMLH0A0HYM2"] ?? []);

  let label = "Mixed";
  if (fedFundsStats && hyStats?.percentile != null) {
    const tight = fedFundsStats.latest >= 3 && hyStats.percentile >= 70;
    const easy = fedFundsStats.latest < 2 && hyStats.percentile <= 30;
    label = tight ? "Restrictive" : easy ? "Accommodative" : "Mixed";
  }

  const detailParts: string[] = [];
  if (fedFundsStats) {
    detailParts.push(`Rates ${fedFundsStats.latest.toFixed(2)}%`);
  }
  if (hyStats?.percentile != null) {
    detailParts.push(`HY spread ${hyStats.percentile}th pct`);
  }
  const detail = detailParts.join(" · ") || "Regime data warming up";

  return { label, detail, drivers };
}

function shortRegimeLabel(code: string, fallback: string): string {
  switch (code) {
    case "FRED:DFF":
      return "Fed funds";
    case "FRED:BAMLH0A0HYM2":
      return "HY spread";
    case "FRED:DTWEXBGS":
      return "USD index";
    default:
      return fallback;
  }
}

export async function getTopMovers(
  industry: Industry,
  n = 5,
): Promise<MoverTile[]> {
  const defs = registryByIndustry(industry);
  const codes = defs.map((d) => d.code);
  if (codes.length === 0) return [];
  const obs = await getObservationsForCodes(codes, 6);

  const ranked = defs
    .map((def) => {
      const stats = statsFromObservations(obs[def.code] ?? []);
      if (!stats) return null;
      return { def, stats };
    })
    .filter((x): x is { def: (typeof defs)[number]; stats: PerIndicatorStats } => x !== null)
    .sort(
      (a, b) => Math.abs(b.stats.deltaPercent) - Math.abs(a.stats.deltaPercent),
    )
    .slice(0, n);

  return ranked.map(({ def, stats }) => ({
    code: def.code,
    name: def.name,
    value: formatValue(stats.latest, def.unit),
    unit: def.unit,
    deltaPercent: Number(stats.deltaPercent.toFixed(1)),
    deltaType: classifyDelta(def.costBucket),
    series: stats.series90,
  }));
}

const InputSchema = z.object({
  industry: z.enum(["restaurant", "construction", "retail"]),
  region: z.string().min(1).default("national"),
});

/** Single entry point: returns everything the dashboard needs in parallel. */
export async function getDashboardData(input: {
  industry: Industry;
  region: string;
}): Promise<DashboardData> {
  const { industry, region } = InputSchema.parse(input);

  const defs = registryByIndustry(industry);
  const codes = defs.map((d) => d.code);

  const [obsByCode, regimeBase, alertsRows, latestBriefing] = await Promise.all([
    getObservationsForCodes(codes, 72),
    getRegimeSnapshot(region),
    getActiveAlerts(industry, region),
    getLatestBriefing(industry, region),
  ]);

  const tiles: IndicatorTileData[] = defs
    .map((def) => {
      const obs = obsByCode[def.code] ?? [];
      const stats = statsFromObservations(obs);
      if (!stats) return null;
      const operatorContext = computeOperatorContext({
        series: stats.fullSeries,
        currentPercentile: stats.percentile,
      });
      return {
        code: def.code,
        name: def.name,
        value: formatValue(stats.latest, def.unit),
        unit: def.unit,
        deltaPercent: Number(stats.deltaPercent.toFixed(1)),
        deltaType: classifyDelta(def.costBucket),
        percentile: stats.percentile,
        source: def.source.toUpperCase(),
        lastUpdated: formatDateShort(stats.lastUpdated),
        series: stats.series90,
        operatorContext,
      } satisfies IndicatorTileData;
    })
    .filter((t): t is IndicatorTileData => t !== null);

  const topMovers = [...tiles]
    .sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent))
    .slice(0, 5)
    .map(
      (t): MoverTile => ({
        code: t.code,
        name: t.name,
        value: t.value,
        unit: t.unit,
        deltaPercent: t.deltaPercent,
        deltaType: t.deltaType,
        series: t.series,
      }),
    );

  const highSeverityCount = alertsRows.filter((a) => a.severity === "high")
    .length;

  return {
    regime: {
      label: regimeBase.label,
      detail: regimeBase.detail,
      drivers: regimeBase.drivers,
      highSeverityAlertCount: highSeverityCount,
      headline: latestBriefing?.headline ?? null,
      briefingId: latestBriefing?.id ?? null,
    },
    topMovers,
    tiles,
    alerts: alertsRows.slice(0, 3),
    latestBriefing,
  };
}

// ── Alerts + briefings (lightweight reads, scoped to dashboard) ─────────────

async function getActiveAlerts(
  industry: Industry,
  region: string,
): Promise<DashboardAlert[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

  const rows = await db
    .select({
      id: alerts.id,
      category: alerts.category,
      severity: alerts.severity,
      headline: alerts.headline,
      publishedAt: alerts.publishedAt,
      industries: alerts.industries,
      regions: alerts.regions,
    })
    .from(alerts)
    .where(gte(alerts.publishedAt, sevenDaysAgo))
    .orderBy(desc(alerts.publishedAt))
    .limit(50);

  return rows
    .filter((r) => r.industries.includes(industry))
    .filter(
      (r) =>
        r.regions.includes("national") ||
        r.regions.includes(region) ||
        region === "national",
    )
    .slice(0, 10)
    .map((r) => ({
      id: r.id,
      category: r.category,
      severity: r.severity,
      headline: r.headline,
      publishedAt: r.publishedAt.toISOString(),
    }));
}

async function getLatestBriefing(
  industry: Industry,
  region: string,
): Promise<BriefingPreview | null> {
  const stateCode =
    region === "national" || region.length !== 2 ? null : region.toUpperCase();

  const filters = stateCode
    ? and(
        eq(briefings.industry, industry),
        eq(briefings.status, "published"),
        eq(briefings.regionState, stateCode),
      )
    : and(eq(briefings.industry, industry), eq(briefings.status, "published"));

  const [row] = await db
    .select()
    .from(briefings)
    .where(filters)
    .orderBy(desc(briefings.publishedAt))
    .limit(1);

  if (!row) return null;

  const excerpt = row.bodyMd
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    id: row.id,
    headline: row.headline,
    weekStart: row.weekStart,
    weekEnd: row.weekEnd,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    excerpt,
  };
}

// Re-export low-level helpers for ad-hoc use
export { getObservations, type ObservationPoint };

/** Internal — exported for tests only. Not used outside this file. */
export const __test = {
  pctChange,
  percentileRank,
  classifyDelta,
  statsFromObservations,
  formatValue,
};

// Type guard helper used by callers narrowing arbitrary indicator codes.
export function isKnownIndicatorCode(code: string): boolean {
  return INDICATOR_REGISTRY.some((d) => d.code === code);
}

// Schema/validators for action input from the client.
export const PinInputSchema = z.object({
  code: z
    .string()
    .min(1)
    .refine(isKnownIndicatorCode, { message: "unknown indicator code" }),
});
export const DensityInputSchema = z.object({
  density: z.enum(["comfortable", "compact"]),
});

