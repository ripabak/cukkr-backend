CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"reference_number" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"customer_id" text NOT NULL,
	"barber_id" text,
	"scheduled_at" timestamp,
	"notes" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_daily_counter" (
	"organization_id" text NOT NULL,
	"booking_date" text NOT NULL,
	"last_sequence" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "booking_daily_counter_org_date_pk" PRIMARY KEY("organization_id","booking_date")
);
--> statement-breakpoint
CREATE TABLE "booking_service" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"service_id" text NOT NULL,
	"service_name" text NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer NOT NULL,
	"discount" integer NOT NULL,
	"duration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_barber_id_member_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_daily_counter" ADD CONSTRAINT "booking_daily_counter_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_service" ADD CONSTRAINT "booking_service_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_service" ADD CONSTRAINT "booking_service_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_organizationId_createdAt_idx" ON "booking" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "booking_organizationId_scheduledAt_idx" ON "booking" USING btree ("organization_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "booking_organizationId_status_idx" ON "booking" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "booking_organizationId_barberId_scheduledAt_idx" ON "booking" USING btree ("organization_id","barber_id","scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_organizationId_referenceNumber_uidx" ON "booking" USING btree ("organization_id","reference_number");--> statement-breakpoint
CREATE INDEX "booking_service_bookingId_idx" ON "booking_service" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "customer_organizationId_phone_idx" ON "customer" USING btree ("organization_id","phone");--> statement-breakpoint
CREATE INDEX "customer_organizationId_email_idx" ON "customer" USING btree ("organization_id","email");