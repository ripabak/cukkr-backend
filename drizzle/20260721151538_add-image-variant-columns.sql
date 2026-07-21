ALTER TABLE "organization" ADD COLUMN "logo_thumb" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "logo_med" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "logo_full" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "image_thumb" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "image_med" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "image_full" text;--> statement-breakpoint
ALTER TABLE "barbershop_settings" ADD COLUMN "logo_thumb" text;--> statement-breakpoint
ALTER TABLE "barbershop_settings" ADD COLUMN "logo_med" text;--> statement-breakpoint
ALTER TABLE "barbershop_settings" ADD COLUMN "logo_full" text;--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "image_thumb" text;--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "image_med" text;--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "image_full" text;