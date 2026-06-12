ALTER TABLE "booking" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "verification_token" text;