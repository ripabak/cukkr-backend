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
ALTER TABLE "notification" ADD CONSTRAINT "notification_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_push_token" ADD CONSTRAINT "notification_push_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_recipientUserId_createdAt_idx" ON "notification" USING btree ("recipient_user_id","created_at" desc);--> statement-breakpoint
CREATE INDEX "notification_recipientUserId_isRead_createdAt_idx" ON "notification" USING btree ("recipient_user_id","is_read","created_at" desc);--> statement-breakpoint
CREATE INDEX "notification_organizationId_type_createdAt_idx" ON "notification" USING btree ("organization_id","type","created_at" desc);--> statement-breakpoint
CREATE INDEX "notification_referenceType_referenceId_idx" ON "notification" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "notification_push_token_userId_isActive_lastRegisteredAt_idx" ON "notification_push_token" USING btree ("user_id","is_active","last_registered_at" desc);--> statement-breakpoint
CREATE UNIQUE INDEX "notification_push_token_token_uidx" ON "notification_push_token" USING btree ("token");