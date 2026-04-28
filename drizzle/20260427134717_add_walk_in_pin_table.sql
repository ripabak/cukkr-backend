CREATE TABLE "walk_in_pin" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"generated_by_user_id" text NOT NULL,
	"pin_hash" text NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"token_consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "walk_in_pin" ADD CONSTRAINT "walk_in_pin_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_in_pin" ADD CONSTRAINT "walk_in_pin_generated_by_user_id_user_id_fk" FOREIGN KEY ("generated_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wip_org_active_idx" ON "walk_in_pin" USING btree ("organization_id","is_used","expires_at");--> statement-breakpoint
CREATE INDEX "wip_org_created_idx" ON "walk_in_pin" USING btree ("organization_id","created_at");