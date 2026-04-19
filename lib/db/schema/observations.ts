import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  date,
  index,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { indicators } from "../schema.ts";

export const indicatorObservations = pgTable(
  "indicator_observations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    indicatorId: uuid("indicator_id")
      .notNull()
      .references(() => indicators.id, { onDelete: "cascade" }),
    obsDate: date("obs_date", { mode: "string" }).notNull(),
    value: numeric("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("indicator_observations_indicator_obs_date_unique").on(
      t.indicatorId,
      t.obsDate,
    ),
    index("indicator_observations_indicator_latest_idx").on(
      t.indicatorId,
      t.obsDate.desc(),
    ),
  ],
);

export type IndicatorObservation = InferSelectModel<
  typeof indicatorObservations
>;
export type NewIndicatorObservation = InferInsertModel<
  typeof indicatorObservations
>;
