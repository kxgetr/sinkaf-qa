ALTER TABLE "runs" ADD COLUMN "integration_type" text;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "integration_context" jsonb;--> statement-breakpoint
CREATE INDEX "runs_integration_type_idx" ON "runs" USING btree ("integration_type");