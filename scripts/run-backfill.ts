/**
 * Direct backfill runner — invokes backfillIndicator per indicator without
 * going through Inngest. Useful for seeding the DB in dev/prod before the
 * Inngest route is wired up.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/run-backfill.ts [--source fred|eia|usda|bls] [--code CODE]
 *
 * Examples:
 *   # backfill all registered indicators across all supported sources
 *   node --env-file=.env.local --import tsx scripts/run-backfill.ts
 *
 *   # backfill only EIA indicators
 *   node --env-file=.env.local --import tsx scripts/run-backfill.ts --source eia
 *
 *   # backfill one specific indicator
 *   node --env-file=.env.local --import tsx scripts/run-backfill.ts --code FRED:PBEEFUSDM
 */
import type { DataSourceAdapter } from "@/lib/data-sources/types";
import {
  backfillIndicator,
  defaultAdapterFactory,
  SUPPORTED_BACKFILL_SOURCES,
  type SupportedBackfillSource,
} from "@/lib/inngest/jobs/backfill-observations";
import {
  getIndicator,
  INDICATOR_REGISTRY,
} from "@/lib/indicators/registry";
import type { IndicatorDefinition } from "@/lib/indicators/types";

const DEFAULT_YEARS_BACK = 10;
const RATE_LIMIT_SLEEP_MS: Record<SupportedBackfillSource, number> = {
  fred: 600,
  eia: 500,
  usda: 500,
  bls: 1000,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function parseArgs(): { source?: SupportedBackfillSource; code?: string; years: number } {
  const args = process.argv.slice(2);
  let source: SupportedBackfillSource | undefined;
  let code: string | undefined;
  let years = DEFAULT_YEARS_BACK;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--source") {
      const v = args[++i];
      if (!(SUPPORTED_BACKFILL_SOURCES as readonly string[]).includes(v)) {
        throw new Error(
          `--source must be one of ${SUPPORTED_BACKFILL_SOURCES.join("|")}`,
        );
      }
      source = v as SupportedBackfillSource;
    } else if (a === "--code") {
      code = args[++i];
    } else if (a === "--years") {
      years = Number(args[++i]);
      if (!Number.isInteger(years) || years <= 0 || years > 50) {
        throw new Error("--years must be an integer in [1,50]");
      }
    } else {
      throw new Error(`unknown arg: ${a}`);
    }
  }
  if (source && code) {
    throw new Error("--source and --code are mutually exclusive");
  }
  return { source, code, years };
}

async function main(): Promise<void> {
  const { source, code, years } = parseArgs();
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  let targets: IndicatorDefinition[];
  if (code) {
    const def = getIndicator(code);
    if (!def) throw new Error(`unknown indicator code: ${code}`);
    targets = [def];
  } else if (source) {
    targets = INDICATOR_REGISTRY.filter((d) => d.source === source);
  } else {
    targets = INDICATOR_REGISTRY.filter((d) =>
      (SUPPORTED_BACKFILL_SOURCES as readonly string[]).includes(d.source),
    );
  }

  const since = yearsAgo(years);
  const adapterCache = new Map<SupportedBackfillSource, DataSourceAdapter>();
  const adapterFor = (s: SupportedBackfillSource): DataSourceAdapter => {
    let a = adapterCache.get(s);
    if (!a) {
      a = defaultAdapterFactory(s);
      adapterCache.set(s, a);
    }
    return a;
  };

  console.log(
    `Backfilling ${targets.length} indicator(s) since ${since
      .toISOString()
      .slice(0, 10)}`,
  );
  console.log("");

  const perSource: Record<
    string,
    { indicators: number; inserted: number; skipped: number; errors: number }
  > = {};

  for (const def of targets) {
    const s = def.source as SupportedBackfillSource;
    process.stdout.write(`  ${def.code.padEnd(46)} `);
    try {
      const result = await backfillIndicator(def, since, adapterFor(s));
      const bucket = (perSource[s] ??= {
        indicators: 0,
        inserted: 0,
        skipped: 0,
        errors: 0,
      });
      bucket.indicators++;
      bucket.inserted += result.inserted;
      bucket.skipped += result.skipped;
      if (result.error) bucket.errors++;
      console.log(
        result.error
          ? `ERROR: ${result.error}`
          : `fetched=${String(result.fetched).padStart(5)}  inserted=${String(
              result.inserted,
            ).padStart(5)}  skipped=${String(result.skipped).padStart(5)}`,
      );
    } catch (err) {
      const bucket = (perSource[s] ??= {
        indicators: 0,
        inserted: 0,
        skipped: 0,
        errors: 0,
      });
      bucket.indicators++;
      bucket.errors++;
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${msg}`);
    }
    if (targets.length > 1) {
      await sleep(RATE_LIMIT_SLEEP_MS[s]);
    }
  }

  console.log("");
  console.log("source   indicators  inserted  skipped  errors");
  console.log("------   ----------  --------  -------  ------");
  for (const [src, b] of Object.entries(perSource).sort(([a], [c]) =>
    a.localeCompare(c),
  )) {
    console.log(
      `${src.padEnd(8)} ${String(b.indicators).padStart(10)}  ${String(
        b.inserted,
      ).padStart(8)}  ${String(b.skipped).padStart(7)}  ${String(
        b.errors,
      ).padStart(6)}`,
    );
  }
}

main().catch((err: unknown) => {
  console.error("run-backfill failed:", err);
  process.exit(1);
});
