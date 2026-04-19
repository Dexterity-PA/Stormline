CREATE TABLE "indicator_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"indicator_id" uuid NOT NULL,
	"obs_date" date NOT NULL,
	"value" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "indicator_observations" ADD CONSTRAINT "indicator_observations_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "indicator_observations_indicator_obs_date_unique" ON "indicator_observations" USING btree ("indicator_id","obs_date");--> statement-breakpoint
CREATE INDEX "indicator_observations_indicator_latest_idx" ON "indicator_observations" USING btree ("indicator_id","obs_date" DESC NULLS LAST);