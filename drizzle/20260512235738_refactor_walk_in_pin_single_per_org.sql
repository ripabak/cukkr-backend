DROP TABLE IF EXISTS "walk_in_pin";
--> statement-breakpoint
CREATE TABLE "organization_walk_in_pin" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"pin" text NOT NULL,
	"updated_by_user_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_walk_in_pin" ADD CONSTRAINT "organization_walk_in_pin_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "organization_walk_in_pin" ADD CONSTRAINT "organization_walk_in_pin_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
