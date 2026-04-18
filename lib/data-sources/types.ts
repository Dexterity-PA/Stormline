import type { indicatorSourceEnum } from "@/lib/db/schema";

export type IndicatorSource = (typeof indicatorSourceEnum.enumValues)[number];

export interface IndicatorPoint {
  observedAt: Date;
  value: number;
}

export interface IndicatorFetch {
  source: IndicatorSource;
  sourceId: string;
  points: IndicatorPoint[];
  fetchedAt: Date;
}

export interface FetchSeriesOptions {
  since?: Date;
  signal?: AbortSignal;
}

export interface DataSourceAdapter {
  readonly source: IndicatorSource;
  fetchSeries(
    sourceId: string,
    options?: FetchSeriesOptions,
  ): Promise<IndicatorFetch>;
}

export class DataSourceError extends Error {
  constructor(
    message: string,
    readonly source: IndicatorSource,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DataSourceError";
  }
}
