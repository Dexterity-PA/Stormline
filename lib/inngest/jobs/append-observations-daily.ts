import { desc, eq } from "drizzle-orm";

import { FredAdapter } from "../../data-sources/fred";
import { db } from "../../db";
import { indicators } from "../../db/schema";
import { indicatorObservations } from "../../db/schema/observations";
import { INDICATOR_REGISTRY } from "../../indicators/registry";
import type { IndicatorDefinition } from "../../indicators/types";
import {
  upsertObservations,
  type UpsertObservationPoint,
} from "../../queries/observations";
import { inngest } from "../../../inngest/client";

const FRED_RATE_LIMIT_SLEEP_MS = 600;
const REVISION_WINDOW_DAYS = 7;
const DEFAULT_INITIAL_LOOKBACK_DAYS = 90;

interface AppendResult {
  code: string;
  fetched: number;
  inserted: number;
  skipped: number;
  error?: string;
}

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseObsDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`invalid obs_date: ${iso}`);
  const [, y, m, d] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

function daysAgo(days: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - days,
    ),
  );
}

async function getIndicatorIdByCode(
  code: string,
): Promise<string | undefined> {
  const [row] = await db
    .select({ id: indicators.id })
    .from(indicators)
    .where(eq(indicators.code, code))
    .limit(1);
  return row?.id;
}

async function getLatestObsDate(indicatorId: string): Promise<string | null> {
  const [row] = await db
    .select({ obsDate: indicatorObservations.obsDate })
    .from(indicatorObservations)
    .where(eq(indicatorObservations.indicatorId, indicatorId))
    .orderBy(desc(indicatorObservations.obsDate))
    .limit(1);
  return row?.obsDate ?? null;
}

async function appendForIndicator(
  definition: IndicatorDefinition,
  fred: FredAdapter,
): Promise<AppendResult> {
  const id = await getIndicatorIdByCode(definition.code);
  if (!id) {
    return {
      code: definition.code,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      error: "indicator not registered in DB",
    };
  }

  const latest = await getLatestObsDate(id);
  const since = latest
    ? new Date(
        parseObsDate(latest).getTime() -
          REVISION_WINDOW_DAYS * 24 * 60 * 60 * 1000,
      )
    : daysAgo(DEFAULT_INITIAL_LOOKBACK_DAYS);

  const fetched = await fred.fetchSeries(definition.sourceId, { since });
  const points: UpsertObservationPoint[] = fetched.points.map((p) => ({
    date: toIsoDate(p.observedAt),
    value: p.value,
  }));

  const counts = await upsertObservations(id, points);
  return {
    code: definition.code,
    fetched: points.length,
    inserted: counts.inserted,
    skipped: counts.skipped,
  };
}

export const appendObservationsDaily = inngest.createFunction(
  {
    id: "append-observations-daily",
    name: "Append latest indicator observations (daily)",
    concurrency: { limit: 1 },
    triggers: [{ cron: "0 10 * * *" }],
  },
  async ({ step, logger }) => {
    const fred = new FredAdapter();
    const targets = INDICATOR_REGISTRY.filter((d) => d.source === "fred");
    const results: AppendResult[] = [];

    for (const def of targets) {
      const result = await step.run(`append:${def.code}`, async () => {
        try {
          return await appendForIndicator(def, fred);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "unknown error";
          logger.error(
            { code: def.code, err: message },
            "daily append failed for indicator",
          );
          return {
            code: def.code,
            fetched: 0,
            inserted: 0,
            skipped: 0,
            error: message,
          } satisfies AppendResult;
        }
      });

      logger.info(
        {
          code: result.code,
          inserted: result.inserted,
          skipped: result.skipped,
          error: result.error,
        },
        "daily append indicator complete",
      );

      results.push(result);
      await step.sleep(
        `rate-limit:${def.code}`,
        `${FRED_RATE_LIMIT_SLEEP_MS}ms`,
      );
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
