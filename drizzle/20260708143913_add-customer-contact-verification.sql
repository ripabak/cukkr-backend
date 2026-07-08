ALTER TABLE "customer" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "phone_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "phone_verification_token" text;--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "is_verified";