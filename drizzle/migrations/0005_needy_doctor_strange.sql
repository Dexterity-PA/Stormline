DROP INDEX "alert_events_rule_triggered_idx";--> statement-breakpoint
DROP INDEX "alert_events_pending_idx";--> statement-breakpoint
DROP INDEX "alert_rules_org_active_idx";--> statement-breakpoint
DROP INDEX "alert_rules_indicator_active_idx";--> statement-breakpoint
ALTER TABLE "alert_events" ALTER COLUMN "triggered_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "alert_events" ADD COLUMN "triggered_value" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_events" ADD COLUMN "email_status" text;--> statement-breakpoint
ALTER TABLE "alert_events" ADD COLUMN "sms_status" text;--> statement-breakpoint
ALTER TABLE "alert_events" ADD COLUMN "in_app_status" text;--> statement-breakpoint
ALTER TABLE "alert_events" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD COLUMN "indicator_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ae_rule_triggered_idx" ON "alert_events" USING btree ("rule_id","triggered_at");--> statement-breakpoint
CREATE INDEX "ar_org_active_idx" ON "alert_rules" USING btree ("org_id","is_active");--> statement-breakpoint
ALTER TABLE "alert_events" DROP COLUMN "indicator_code";--> statement-breakpoint
ALTER TABLE "alert_events" DROP COLUMN "trigger_value";--> statement-breakpoint
ALTER TABLE "alert_events" DROP COLUMN "context_snapshot";--> statement-breakpoint
ALTER TABLE "alert_events" DROP COLUMN "delivered_at";--> statement-breakpoint
ALTER TABLE "alert_events" DROP COLUMN "delivery_status";--> statement-breakpoint
ALTER TABLE "alert_events" DROP COLUMN "delivery_error";--> statement-breakpoint
ALTER TABLE "alert_rules" DROP COLUMN "indicator_code";--> statement-breakpoint
ALTER TABLE "alert_rules" DROP COLUMN "active";