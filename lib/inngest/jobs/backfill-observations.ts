import { eq } from "drizzle-orm";
import { z } from "zod";

import { FredAdapter } from "../../data-sources/fred";
import { db } from "../../db";
import { indicators } from "../../db/schema";
import { getIndicator, INDICATOR_REGISTRY } from "../../indicators/registry";
import type { IndicatorDefinition } from "../../indicators/types";
import {
  upsertObservations,
  type UpsertObservationPoint,
} from "../../queries/observations";
import { inngest } from "../../../inngest/client";

export const BackfillEventSchema = z.object({
  indicatorCode: z.string().min(1).optional(),
  yearsBack: z.number().int().positive().max(50).default(10),
});

export type BackfillEventData = z.infer<typeof BackfillEventSchema>;

export interface BackfillResult {
  code: string;
  inserted: number;
  skipped: number;
  fetched: number;
  error?: string;
}

const FRED_RATE_LIMIT_SLEEP_MS = 600;

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

async function getIndicatorRowByCode(
  code: string,
): Promise<{ id: string } | undefined> {
  const [row] = await db
    .select({ id: indicators.id })
    .from(indicators)
    .where(eq(indicators.code, code))
    .limit(1);
  return row;
}

export async function backfillIndicator(
  definition: IndicatorDefinition,
  since: Date,
  fred: FredAdapter = new FredAdapter(),
): Promise<BackfillResult> {
  const row = await getIndicatorRowByCode(definition.code);
  if (!row) {
    return {
      code: definition.code,
      inserted: 0,
      skipped: 0,
      fetched: 0,
      error: "indicator not registered in DB",
    };
  }

  const fetched = await fred.fetchSeries(definition.sourceId, { since });
  const points: UpsertObservationPoint[] = fetched.points.map((p) => ({
    date: toIsoDate(p.observedAt),
    value: p.value,
  }));

  const counts = await upsertObservations(row.id, points);
  return {
    code: definition.code,
    fetched: points.length,
    inserted: counts.inserted,
    skipped: counts.skipped,
  };
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
    const fred = new FredAdapter();

    const targets: IndicatorDefinition[] = parsed.indicatorCode
      ? (() => {
          const def = getIndicator(parsed.indicatorCode!);
          if (!def) throw new Error(`unknown indicator: ${parsed.indicatorCode}`);
          if (def.source !== "fred") {
            throw new Error(
              `indicator ${def.code} is not a FRED series (source=${def.source})`,
            );
          }
          return [def];
        })()
      : INDICATOR_REGISTRY.filter((d) => d.source === "fred");

    const results: BackfillResult[] = [];

    for (const def of targets) {
      const result = await step.run(`backfill:${def.code}`, async () => {
        try {
          return await backfillIndicator(def, since, fred);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "unknown error";
          logger.error(
            { code: def.code, err: message },
            "backfill failed for indicator",
          );
          return {
            code: def.code,
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
          `${FRED_RATE_LIMIT_SLEEP_MS}ms`,
        );
      }
    }

    return {
      totalIndicators: targets.length,
      totalInserted: results.reduce((sum, r) => sum + r.inserted, 0),
      totalSkipped: results.reduce((sum, r) => sum + r.skipped, 0),
      errors: results
        .filter((r) => r.error)
        .map((r) => ({ code: r.code, error: r.error })),
    };
  },
);
