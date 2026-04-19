CREATE TYPE "public"."alert_condition" AS ENUM('above', 'below', 'pct_change_above', 'pct_change_below', 'percentile_above', 'percentile_below');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."onboarding_step" AS ENUM('industry', 'region', 'profile', 'indicators', 'channels', 'complete');--> statement-breakpoint
CREATE TABLE "ai_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"question" text NOT NULL,
	"industry" "industry",
	"region" text,
	"input_snapshot" jsonb,
	"answer" text,
	"cited_indicator_codes" text[] DEFAULT '{}' NOT NULL,
	"model" text,
	"tokens_in" integer,
	"tokens_out" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"indicator_code" text,
	"triggered_at" timestamp with time zone NOT NULL,
	"trigger_value" numeric,
	"context_snapshot" jsonb,
	"delivered_at" timestamp with time zone,
	"delivery_status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"delivery_error" text
);
--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"indicator_code" text NOT NULL,
	"condition" "alert_condition" NOT NULL,
	"threshold" numeric NOT NULL,
	"window_days" integer,
	"channels" text[] DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_profile_schemas" (
	"industry" "industry" PRIMARY KEY NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"fields" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"source_url" text NOT NULL,
	"headline" text NOT NULL,
	"summary" text,
	"published_at" timestamp with time zone NOT NULL,
	"industry" "industry",
	"region" text,
	"linked_indicator_code" text,
	"why_it_matters" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_items_source_url_unique" UNIQUE("source_url")
);
--> statement-breakpoint
CREATE TABLE "onboarding_state" (
	"org_id" uuid PRIMARY KEY NOT NULL,
	"step" "onboarding_step" DEFAULT 'industry' NOT NULL,
	"selected_industry" "industry",
	"selected_regions" text[] DEFAULT '{}' NOT NULL,
	"business_description" text,
	"industry_profile" jsonb,
	"key_inputs" text[] DEFAULT '{}' NOT NULL,
	"ai_profile_tags" jsonb,
	"ai_recommended_indicators" text[] DEFAULT '{}' NOT NULL,
	"pinned_indicator_codes" text[] DEFAULT '{}' NOT NULL,
	"notification_channels" text[] DEFAULT '{}' NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "briefings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "briefings" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."briefing_status";--> statement-breakpoint
CREATE TYPE "public"."briefing_status" AS ENUM('draft', 'in_review', 'published');--> statement-breakpoint
ALTER TABLE "briefings" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."briefing_status";--> statement-breakpoint
ALTER TABLE "briefings" ALTER COLUMN "status" SET DATA TYPE "public"."briefing_status" USING "status"::"public"."briefing_status";--> statement-breakpoint
ALTER TABLE "briefings" ADD COLUMN "system_prompt_version" text;--> statement-breakpoint
ALTER TABLE "briefings" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "briefings" ADD COLUMN "input_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "briefings" ADD COLUMN "raw_output" text;--> statement-breakpoint
ALTER TABLE "briefings" ADD COLUMN "edited_output" text;--> statement-breakpoint
ALTER TABLE "ai_queries" ADD CONSTRAINT "ai_queries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_rule_id_alert_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."alert_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_state" ADD CONSTRAINT "onboarding_state_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_queries_org_created_idx" ON "ai_queries" USING btree ("org_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "alert_events_rule_triggered_idx" ON "alert_events" USING btree ("rule_id","triggered_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "alert_events_pending_idx" ON "alert_events" USING btree ("delivery_status") WHERE delivery_status = 'pending';--> statement-breakpoint
CREATE INDEX "alert_rules_org_active_idx" ON "alert_rules" USING btree ("org_id","active");--> statement-breakpoint
CREATE INDEX "alert_rules_indicator_active_idx" ON "alert_rules" USING btree ("indicator_code","active");--> statement-breakpoint
CREATE INDEX "news_items_industry_published_at_idx" ON "news_items" USING btree ("industry","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "news_items_published_at_idx" ON "news_items" USING btree ("published_at" DESC NULLS LAST);