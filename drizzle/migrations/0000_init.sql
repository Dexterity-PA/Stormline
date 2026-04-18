CREATE TYPE "public"."alert_category" AS ENUM('hurricane', 'tariff', 'fomc', 'credit', 'commodity_move', 'other');--> statement-breakpoint
CREATE TYPE "public"."alert_channel" AS ENUM('email', 'sms', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."briefing_channel" AS ENUM('email', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."briefing_status" AS ENUM('draft', 'review', 'published');--> statement-breakpoint
CREATE TYPE "public"."feedback_target" AS ENUM('briefing', 'alert', 'dashboard_tile');--> statement-breakpoint
CREATE TYPE "public"."frequency" AS ENUM('daily', 'weekly', 'monthly', 'quarterly');--> statement-breakpoint
CREATE TYPE "public"."indicator_source" AS ENUM('fred', 'eia', 'usda', 'bls', 'census', 'nhc', 'other');--> statement-breakpoint
CREATE TYPE "public"."industry" AS ENUM('restaurant', 'construction', 'retail');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('trial', 'core', 'pro');--> statement-breakpoint
CREATE TABLE "alert_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"channel" "alert_channel" NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"opened_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "alert_category" NOT NULL,
	"industries" text[] DEFAULT '{}' NOT NULL,
	"regions" text[] DEFAULT '{}' NOT NULL,
	"severity" "severity" NOT NULL,
	"headline" text NOT NULL,
	"body_md" text NOT NULL,
	"source_url" text NOT NULL,
	"event_occurred_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "briefing_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"briefing_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"channel" "briefing_channel" NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "briefings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"industry" "industry" NOT NULL,
	"region_state" varchar(2),
	"region_metro" text,
	"week_start" date NOT NULL,
	"week_end" date NOT NULL,
	"headline" text NOT NULL,
	"body_md" text NOT NULL,
	"status" "briefing_status" DEFAULT 'draft' NOT NULL,
	"generated_by" text NOT NULL,
	"reviewed_by" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"industry" "industry" NOT NULL,
	"region" text NOT NULL,
	"snapshot_date" date NOT NULL,
	"data_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"target_type" "feedback_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"helpful" boolean NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicator_values" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"indicator_id" uuid NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"value" numeric NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"source" "indicator_source" NOT NULL,
	"source_id" text NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"industry_tags" text[] DEFAULT '{}' NOT NULL,
	"cost_bucket" text,
	"frequency" "frequency" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "indicators_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"clerk_user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"email_briefing" boolean DEFAULT true NOT NULL,
	"email_alerts" boolean DEFAULT true NOT NULL,
	"sms_alerts" boolean DEFAULT false NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text NOT NULL,
	"industry" "industry" NOT NULL,
	"region_state" varchar(2) NOT NULL,
	"region_metro" text,
	"subscription_tier" "subscription_tier" DEFAULT 'trial' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD CONSTRAINT "alert_deliveries_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD CONSTRAINT "alert_deliveries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD CONSTRAINT "alert_deliveries_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefing_deliveries" ADD CONSTRAINT "briefing_deliveries_briefing_id_briefings_id_fk" FOREIGN KEY ("briefing_id") REFERENCES "public"."briefings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefing_deliveries" ADD CONSTRAINT "briefing_deliveries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefing_deliveries" ADD CONSTRAINT "briefing_deliveries_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_values" ADD CONSTRAINT "indicator_values_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "indicator_values_indicator_observed_unique" ON "indicator_values" USING btree ("indicator_id","observed_at");