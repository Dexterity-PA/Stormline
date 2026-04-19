ALTER TYPE "public"."indicator_source" ADD VALUE 'treasury' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."indicator_source" ADD VALUE 'noaa' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."indicator_source" ADD VALUE 'usda_ams' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."indicator_source" ADD VALUE 'federal_register' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."indicator_source" ADD VALUE 'fhfa' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."indicator_source" ADD VALUE 'fema' BEFORE 'other';