ALTER TABLE "booking_service" DROP CONSTRAINT "booking_service_service_id_service_id_fk";
--> statement-breakpoint
ALTER TABLE "booking_service" ALTER COLUMN "service_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_service" ADD CONSTRAINT "booking_service_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;