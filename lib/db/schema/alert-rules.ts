import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { indicators, organizations } from '../schema';

export const alertConditionEnum = pgEnum('alert_condition', [
  'above',
  'below',
  'pct_change_above',
  'pct_change_below',
  'percentile_above',
  'percentile_below',
]);

export const alertRules = pgTable(
  'alert_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    createdBy: text('created_by').notNull(),
    indicatorId: uuid('indicator_id')
      .notNull()
      .references(() => indicators.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    condition: alertConditionEnum('condition').notNull(),
    threshold: numeric('threshold').notNull(),
    windowDays: integer('window_days'),
    channels: text('channels').array().notNull().default([]),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('alert_rules_org_active_idx').on(t.orgId, t.isActive)],
);

export const alertEvents = pgTable(
  'alert_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ruleId: uuid('rule_id')
      .notNull()
      .references(() => alertRules.id, { onDelete: 'cascade' }),
    triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull().defaultNow(),
    triggeredValue: numeric('triggered_value').notNull(),
    emailStatus: text('email_status'),
    smsStatus: text('sms_status'),
    inAppStatus: text('in_app_status'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('alert_events_rule_idx').on(t.ruleId, t.triggeredAt.desc())],
);

export type AlertRule = InferSelectModel<typeof alertRules>;
export type NewAlertRule = InferInsertModel<typeof alertRules>;
export type AlertEvent = InferSelectModel<typeof alertEvents>;
export type NewAlertEvent = InferInsertModel<typeof alertEvents>;
