import {
  bigserial,
  boolean,
  date,
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
  "review",
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
