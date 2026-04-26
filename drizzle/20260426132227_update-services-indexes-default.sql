ALTER TABLE "service" ALTER COLUMN "is_active" SET DEFAULT false;--> statement-breakpoint
CREATE INDEX "service_organizationId_isActive_idx" ON "service" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "service_organizationId_name_idx" ON "service" USING btree ("organization_id","name");