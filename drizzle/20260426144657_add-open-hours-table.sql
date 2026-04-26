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
ALTER TABLE "open_hour" ADD CONSTRAINT "open_hour_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "open_hour_organizationId_dayOfWeek_uidx" ON "open_hour" USING btree ("organization_id","day_of_week");--> statement-breakpoint
CREATE INDEX "open_hour_organizationId_idx" ON "open_hour" USING btree ("organization_id");