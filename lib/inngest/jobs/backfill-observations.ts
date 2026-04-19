import { eq } from "drizzle-orm";
import { z } from "zod";

import { BlsAdapter } from "../../data-sources/bls";
import { EiaAdapter } from "../../data-sources/eia";
import { FredAdapter } from "../../data-sources/fred";
import type { DataSourceAdapter } from "../../data-sources/types";
import { UsdaAdapter } from "../../data-sources/usda";
import { db } from "../../db";
import { indicators } from "../../db/schema";
import { getIndicator, INDICATOR_REGISTRY } from "../../indicators/registry";
import type { IndicatorDefinition } from "../../indicators/types";
import {
  upsertObservations,
  type UpsertObservationPoint,
} from "../../queries/observations";
import { inngest } from "../../../inngest/client";

export const SUPPORTED_BACKFILL_SOURCES = [
  "fred",
  "eia",
  "usda",
  "bls",
] as const;
export type SupportedBackfillSource = (typeof SUPPORTED_BACKFILL_SOURCES)[number];

export const BackfillEventSchema = z
  .object({
    indicatorCode: z.string().min(1).optional(),
    source: z.enum(SUPPORTED_BACKFILL_SOURCES).optional(),
    yearsBack: z.number().int().positive().max(50).default(10),
  })
  .refine(
    (d) => !(d.indicatorCode && d.source),
    "indicatorCode and source are mutually exclusive",
  );

export type BackfillEventData = z.infer<typeof BackfillEventSchema>;

export interface BackfillResult {
  code: string;
  source: SupportedBackfillSource;
  inserted: number;
  skipped: number;
  fetched: number;
  error?: string;
}

// Per-source rate-limit sleeps between indicators. FRED allows 120 req/min.
// NASS and EIA are generous but slow per request; BLS is 500/day unauth.
const RATE_LIMIT_SLEEP_MS: Record<SupportedBackfillSource, number> = {
  fred: 600,
  eia: 500,
  usda: 500,
  bls: 1000,
};

function yearsAgo(years: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear() - years,
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSupportedSource(
  s: IndicatorDefinition["source"],
): s is SupportedBackfillSource {
  return (SUPPORTED_BACKFILL_SOURCES as readonly string[]).includes(s);
}

async function getOrCreateIndicatorRow(
  def: IndicatorDefinition,
): Promise<{ id: string }> {
  const [existing] = await db
    .select({ id: indicators.id })
    .from(indicators)
    .where(eq(indicators.code, def.code))
    .limit(1);
  if (existing) return existing;

  const [inserted] = await db
    .insert(indicators)
    .values({
      code: def.code,
      source: def.source,
      sourceId: def.sourceId,
      name: def.name,
      unit: def.unit,
      industryTags: [...def.industryTags] as string[],
      costBucket: def.costBucket,
      frequency: def.frequency,
    })
    .onConflictDoNothing({ target: indicators.code })
    .returning({ id: indicators.id });

  if (inserted) return inserted;

  // Conflict raced us; re-select.
  const [row] = await db
    .select({ id: indicators.id })
    .from(indicators)
    .where(eq(indicators.code, def.code))
    .limit(1);
  if (!row) {
    throw new Error(`failed to seed indicator ${def.code}`);
  }
  return row;
}

export type AdapterFactory = (
  source: SupportedBackfillSource,
) => DataSourceAdapter;

export const defaultAdapterFactory: AdapterFactory = (source) => {
  switch (source) {
    case "fred":
      return new FredAdapter();
    case "eia":
      return new EiaAdapter();
    case "usda":
      return new UsdaAdapter();
    case "bls":
      return new BlsAdapter();
  }
};

export async function backfillIndicator(
  definition: IndicatorDefinition,
  since: Date,
  adapter: DataSourceAdapter,
): Promise<BackfillResult> {
  if (!isSupportedSource(definition.source)) {
    return {
      code: definition.code,
      source: definition.source as SupportedBackfillSource,
      inserted: 0,
      skipped: 0,
      fetched: 0,
      error: `unsupported source: ${definition.source}`,
    };
  }

  const row = await getOrCreateIndicatorRow(definition);

  const fetched = await adapter.fetchSeries(definition.sourceId, { since });
  const points: UpsertObservationPoint[] = fetched.points.map((p) => ({
    date: toIsoDate(p.observedAt),
    value: p.value,
  }));

  const counts = await upsertObservations(row.id, points);
  return {
    code: definition.code,
    source: definition.source,
    fetched: points.length,
    inserted: counts.inserted,
    skipped: counts.skipped,
  };
}

function resolveTargets(parsed: BackfillEventData): IndicatorDefinition[] {
  if (parsed.indicatorCode) {
    const def = getIndicator(parsed.indicatorCode);
    if (!def)
      throw new Error(`unknown indicator: ${parsed.indicatorCode}`);
    if (!isSupportedSource(def.source)) {
      throw new Error(
        `indicator ${def.code} has unsupported source "${def.source}"`,
      );
    }
    return [def];
  }
  if (parsed.source) {
    const target = parsed.source;
    return INDICATOR_REGISTRY.filter((d) => d.source === target);
  }
  return INDICATOR_REGISTRY.filter((d) => isSupportedSource(d.source));
}

export const backfillObservations = inngest.createFunction(
  {
    id: "backfill-observations",
    name: "Backfill indicator observations from source",
    concurrency: { limit: 1 },
    triggers: [{ event: "admin/observations.backfill" }],
  },
  async ({ event, step, logger }) => {
    const parsed = BackfillEventSchema.parse(event.data ?? {});
    const since = yearsAgo(parsed.yearsBack);

    const targets = resolveTargets(parsed);
    const adapterCache = new Map<SupportedBackfillSource, DataSourceAdapter>();
    const adapterFor = (source: SupportedBackfillSource): DataSourceAdapter => {
      let a = adapterCache.get(source);
      if (!a) {
        a = defaultAdapterFactory(source);
        adapterCache.set(source, a);
      }
      return a;
    };

    const results: BackfillResult[] = [];

    for (const def of targets) {
      const source = def.source as SupportedBackfillSource;
      const result = await step.run(`backfill:${def.code}`, async () => {
        try {
          return await backfillIndicator(def, since, adapterFor(source));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "unknown error";
          logger.error(
            { code: def.code, source, err: message },
            "backfill failed for indicator",
          );
          return {
            code: def.code,
            source,
            fetched: 0,
            inserted: 0,
            skipped: 0,
            error: message,
          } satisfies BackfillResult;
        }
      });

      logger.info(
        {
          code: result.code,
          source: result.source,
          fetched: result.fetched,
          inserted: result.inserted,
          skipped: result.skipped,
          error: result.error,
        },
        "backfill indicator complete",
      );

      results.push(result);

      if (targets.length > 1) {
        await step.sleep(
          `rate-limit:${def.code}`,
          `${RATE_LIMIT_SLEEP_MS[source]}ms`,
        );
      }
    }

    const perSource: Record<
      string,
      { indicators: number; inserted: number; skipped: number; errors: number }
    > = {};
    for (const r of results) {
      const bucket = (perSource[r.source] ??= {
        indicators: 0,
        inserted: 0,
        skipped: 0,
        errors: 0,
      });
      bucket.indicators++;
      bucket.inserted += r.inserted;
      bucket.skipped += r.skipped;
      if (r.error) bucket.errors++;
    }

    return {
      totalIndicators: targets.length,
      totalInserted: results.reduce((sum, r) => sum + r.inserted, 0),
      totalSkipped: results.reduce((sum, r) => sum + r.skipped, 0),
      perSource,
      errors: results
        .filter((r) => r.error)
        .map((r) => ({ code: r.code, source: r.source, error: r.error })),
    };
  },
);
