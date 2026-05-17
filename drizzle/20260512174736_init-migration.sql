CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_example" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barbershop_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"description" text,
	"address" text,
	"logo_url" text,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "open_hour" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"is_open" boolean DEFAULT false NOT NULL,
	"open_time" text,
	"close_time" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"duration" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"reference_number" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"customer_id" text NOT NULL,
	"barber_id" text,
	"handled_by_barber_id" text,
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
CREATE TABLE "organization_walk_in_pin" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"pin" text NOT NULL,
	"updated_by_user_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"recipient_user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"reference_id" text,
	"reference_type" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_push_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_registered_at" timestamp DEFAULT now() NOT NULL,
	"invalidated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_example" ADD CONSTRAINT "product_example_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_example" ADD CONSTRAINT "product_example_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barbershop_settings" ADD CONSTRAINT "barbershop_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_hour" ADD CONSTRAINT "open_hour_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_barber_id_member_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_handled_by_barber_id_member_id_fk" FOREIGN KEY ("handled_by_barber_id") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_daily_counter" ADD CONSTRAINT "booking_daily_counter_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_service" ADD CONSTRAINT "booking_service_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_service" ADD CONSTRAINT "booking_service_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_walk_in_pin" ADD CONSTRAINT "organization_walk_in_pin_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_walk_in_pin" ADD CONSTRAINT "organization_walk_in_pin_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_push_token" ADD CONSTRAINT "notification_push_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_status_expiresAt_idx" ON "invitation" USING btree ("organization_id","status","expires_at");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_userId_orgId_uidx" ON "member" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "barbershop_settings_organizationId_uidx" ON "barbershop_settings" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "open_hour_organizationId_dayOfWeek_uidx" ON "open_hour" USING btree ("organization_id","day_of_week");--> statement-breakpoint
CREATE INDEX "open_hour_organizationId_idx" ON "open_hour" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "service_organizationId_idx" ON "service" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "service_organizationId_isDefault_idx" ON "service" USING btree ("organization_id","is_default");--> statement-breakpoint
CREATE INDEX "service_organizationId_isActive_idx" ON "service" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "service_organizationId_name_idx" ON "service" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "booking_organizationId_createdAt_idx" ON "booking" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "booking_organizationId_scheduledAt_idx" ON "booking" USING btree ("organization_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "booking_organizationId_status_idx" ON "booking" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "booking_organizationId_barberId_scheduledAt_idx" ON "booking" USING btree ("organization_id","barber_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "booking_organizationId_handledByBarberId_status_idx" ON "booking" USING btree ("organization_id","handled_by_barber_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_organizationId_referenceNumber_uidx" ON "booking" USING btree ("organization_id","reference_number");--> statement-breakpoint
CREATE INDEX "booking_organizationId_customerId_createdAt_idx" ON "booking" USING btree ("organization_id","customer_id","created_at");--> statement-breakpoint
CREATE INDEX "booking_organizationId_status_completedAt_idx" ON "booking" USING btree ("organization_id","status","completed_at");--> statement-breakpoint
CREATE INDEX "booking_service_bookingId_idx" ON "booking_service" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "customer_organizationId_phone_idx" ON "customer" USING btree ("organization_id","phone");--> statement-breakpoint
CREATE INDEX "customer_organizationId_email_idx" ON "customer" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "customer_organizationId_name_idx" ON "customer" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "notification_recipientUserId_createdAt_idx" ON "notification" USING btree ("recipient_user_id","created_at" desc);--> statement-breakpoint
CREATE INDEX "notification_recipientUserId_isRead_createdAt_idx" ON "notification" USING btree ("recipient_user_id","is_read","created_at" desc);--> statement-breakpoint
CREATE INDEX "notification_organizationId_type_createdAt_idx" ON "notification" USING btree ("organization_id","type","created_at" desc);--> statement-breakpoint
CREATE INDEX "notification_referenceType_referenceId_idx" ON "notification" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "notification_push_token_userId_isActive_lastRegisteredAt_idx" ON "notification_push_token" USING btree ("user_id","is_active","last_registered_at" desc);--> statement-breakpoint
CREATE UNIQUE INDEX "notification_push_token_token_uidx" ON "notification_push_token" USING btree ("token");