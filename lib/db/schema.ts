import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const industryEnum = pgEnum("industry", [
  "restaurant",
  "construction",
  "retail",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "trial",
  "core",
  "pro",
]);

export const memberRoleEnum = pgEnum("member_role", ["owner", "member"]);

export const indicatorSourceEnum = pgEnum("indicator_source", [
  "fred",
  "eia",
  "usda",
  "bls",
  "census",
  "nhc",
  "treasury",
  "noaa",
  "usda_ams",
  "federal_register",
  "fhfa",
  "fema",
  "other",
]);

export const frequencyEnum = pgEnum("frequency", [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
]);

export const briefingStatusEnum = pgEnum("briefing_status", [
  "draft",
  "in_review",
  "published",
]);

export const briefingChannelEnum = pgEnum("briefing_channel", [
  "email",
  "in_app",
]);

export const alertChannelEnum = pgEnum("alert_channel", [
  "email",
  "sms",
  "in_app",
]);

export const alertCategoryEnum = pgEnum("alert_category", [
  "hurricane",
  "tariff",
  "fomc",
  "credit",
  "commodity_move",
  "other",
]);

export const severityEnum = pgEnum("severity", ["low", "medium", "high"]);

export const feedbackTargetEnum = pgEnum("feedback_target", [
  "briefing",
  "alert",
  "dashboard_tile",
]);

export const alertConditionEnum = pgEnum("alert_condition", [
  "above",
  "below",
  "pct_change_above",
  "pct_change_below",
  "percentile_above",
  "percentile_below",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "sent",
  "failed",
]);

export const onboardingStepEnum = pgEnum("onboarding_step", [
  "industry",
  "region",
  "profile",
  "indicators",
  "channels",
  "complete",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  industry: industryEnum("industry").notNull(),
  regionState: varchar("region_state", { length: 2 }).notNull(),
  regionMetro: text("region_metro"),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .notNull()
    .default("trial"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  clerkUserId: text("clerk_user_id").notNull(),
  role: memberRoleEnum("role").notNull().default("member"),
  emailBriefing: boolean("email_briefing").notNull().default(true),
  emailAlerts: boolean("email_alerts").notNull().default(true),
  smsAlerts: boolean("sms_alerts").notNull().default(false),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const indicators = pgTable("indicators", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  source: indicatorSourceEnum("source").notNull(),
  sourceId: text("source_id").notNull(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  industryTags: text("industry_tags").array().notNull().default([]),
  costBucket: text("cost_bucket"),
  frequency: frequencyEnum("frequency").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const indicatorValues = pgTable(
  "indicator_values",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    indicatorId: uuid("indicator_id")
      .notNull()
      .references(() => indicators.id, { onDelete: "cascade" }),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    value: numeric("value").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("indicator_values_indicator_observed_unique").on(
      t.indicatorId,
      t.observedAt,
    ),
  ],
);

export const briefings = pgTable("briefings", {
  id: uuid("id").primaryKey().defaultRandom(),
  industry: industryEnum("industry").notNull(),
  regionState: varchar("region_state", { length: 2 }),
  regionMetro: text("region_metro"),
  weekStart: date("week_start").notNull(),
  weekEnd: date("week_end").notNull(),
  headline: text("headline").notNull(),
  bodyMd: text("body_md").notNull(),
  status: briefingStatusEnum("status").notNull().default("draft"),
  systemPromptVersion: text("system_prompt_version"),
  model: text("model"),
  inputSnapshot: jsonb("input_snapshot"),
  rawOutput: text("raw_output"),
  editedOutput: text("edited_output"),
  generatedBy: text("generated_by").notNull(),
  reviewedBy: text("reviewed_by"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const briefingDeliveries = pgTable("briefing_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefingId: uuid("briefing_id")
    .notNull()
    .references(() => briefings.id, { onDelete: "cascade" }),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  channel: briefingChannelEnum("channel").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  clickedAt: timestamp("clicked_at", { withTimezone: true }),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: alertCategoryEnum("category").notNull(),
  industries: text("industries").array().notNull().default([]),
  regions: text("regions").array().notNull().default([]),
  severity: severityEnum("severity").notNull(),
  headline: text("headline").notNull(),
  bodyMd: text("body_md").notNull(),
  sourceUrl: text("source_url").notNull(),
  eventOccurredAt: timestamp("event_occurred_at", {
    withTimezone: true,
  }).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const alertDeliveries = pgTable("alert_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  alertId: uuid("alert_id")
    .notNull()
    .references(() => alerts.id, { onDelete: "cascade" }),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  channel: alertChannelEnum("channel").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  openedAt: timestamp("opened_at", { withTimezone: true }),
});

export const dashboardSnapshots = pgTable(
  "dashboard_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    industry: industryEnum("industry").notNull(),
    region: text("region").notNull(),
    snapshotDate: date("snapshot_date").notNull(),
    dataJson: jsonb("data_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("dashboard_snapshots_industry_region_date_unique").on(
      t.industry,
      t.region,
      t.snapshotDate,
    ),
  ],
);

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  targetType: feedbackTargetEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  helpful: boolean("helpful").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const newsItems = pgTable(
  "news_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull(),
    sourceUrl: text("source_url").notNull().unique(),
    headline: text("headline").notNull(),
    summary: text("summary"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    industry: industryEnum("industry"),
    region: text("region"),
    linkedIndicatorCode: text("linked_indicator_code"),
    whyItMatters: text("why_it_matters"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("news_items_industry_published_at_idx").on(
      t.industry,
      t.publishedAt.desc(),
    ),
    index("news_items_published_at_idx").on(t.publishedAt.desc()),
  ],
);

export const alertRules = pgTable(
  "alert_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    indicatorCode: text("indicator_code").notNull(),
    condition: alertConditionEnum("condition").notNull(),
    threshold: numeric("threshold").notNull(),
    windowDays: integer("window_days"),
    channels: text("channels").array().notNull().default([]),
    active: boolean("active").notNull().default(true),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("alert_rules_org_active_idx").on(t.orgId, t.active),
    index("alert_rules_indicator_active_idx").on(t.indicatorCode, t.active),
  ],
);

export const alertEvents = pgTable(
  "alert_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ruleId: uuid("rule_id")
      .notNull()
      .references(() => alertRules.id, { onDelete: "cascade" }),
    indicatorCode: text("indicator_code"),
    triggeredAt: timestamp("triggered_at", { withTimezone: true }).notNull(),
    triggerValue: numeric("trigger_value"),
    contextSnapshot: jsonb("context_snapshot"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    deliveryStatus: deliveryStatusEnum("delivery_status")
      .notNull()
      .default("pending"),
    deliveryError: text("delivery_error"),
  },
  (t) => [
    index("alert_events_rule_triggered_idx").on(
      t.ruleId,
      t.triggeredAt.desc(),
    ),
    index("alert_events_pending_idx")
      .on(t.deliveryStatus)
      .where(sql`delivery_status = 'pending'`),
  ],
);

export const onboardingState = pgTable("onboarding_state", {
  orgId: uuid("org_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  step: onboardingStepEnum("step").notNull().default("industry"),
  selectedIndustry: industryEnum("selected_industry"),
  selectedRegions: text("selected_regions").array().notNull().default([]),
  businessDescription: text("business_description"),
  industryProfile: jsonb("industry_profile"),
  keyInputs: text("key_inputs").array().notNull().default([]),
  aiProfileTags: jsonb("ai_profile_tags"),
  aiRecommendedIndicators: text("ai_recommended_indicators")
    .array()
    .notNull()
    .default([]),
  pinnedIndicatorCodes: text("pinned_indicator_codes")
    .array()
    .notNull()
    .default([]),
  notificationChannels: text("notification_channels")
    .array()
    .notNull()
    .default([]),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const industryProfileSchemas = pgTable("industry_profile_schemas", {
  industry: industryEnum("industry").primaryKey(),
  schemaVersion: integer("schema_version").notNull().default(1),
  fields: jsonb("fields").notNull(),
});

export const aiQueries = pgTable(
  "ai_queries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    question: text("question").notNull(),
    industry: industryEnum("industry"),
    region: text("region"),
    inputSnapshot: jsonb("input_snapshot"),
    answer: text("answer"),
    citedIndicatorCodes: text("cited_indicator_codes")
      .array()
      .notNull()
      .default([]),
    model: text("model"),
    tokensIn: integer("tokens_in"),
    tokensOut: integer("tokens_out"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ai_queries_org_created_idx").on(t.orgId, t.createdAt.desc()),
  ],
);
