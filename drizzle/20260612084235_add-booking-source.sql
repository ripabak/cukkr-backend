ALTER TABLE "booking" ADD COLUMN "source" text;
UPDATE "booking" SET "source" = 'staff' WHERE "source" IS NULL;
ALTER TABLE "booking" ALTER COLUMN "source" SET NOT NULL;