import type { frequencyEnum, industryEnum } from "@/lib/db/schema";
import type { IndicatorSource } from "@/lib/data-sources/types";

export type Industry = (typeof industryEnum.enumValues)[number];
export type Frequency = (typeof frequencyEnum.enumValues)[number];

export interface IndicatorDefinition {
  /** Canonical code stored in indicators.code, e.g. 'FRED:PBEEFUSDM'. */
  code: string;
  source: IndicatorSource;
  /** ID in the source system, e.g. FRED series id. */
  sourceId: string;
  /** Human-readable name shown in the UI. */
  name: string;
  /** Unit string, e.g. 'USD/lb', 'USD/gal', 'index', '%'. */
  unit: string;
  industryTags: readonly Industry[];
  /** Logical cost bucket for grouping in dashboards/briefings. */
  costBucket: string | null;
  frequency: Frequency;
}
