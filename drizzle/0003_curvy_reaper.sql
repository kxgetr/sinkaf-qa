CREATE TABLE "artifacts" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"bug_id" text,
	"type" text NOT NULL,
	"storage_provider" text NOT NULL,
	"storage_key" text NOT NULL,
	"content_type" text NOT NULL,
	"byte_length" integer NOT NULL,
	"sha256" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifacts_run_id_idx" ON "artifacts" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "artifacts_run_type_idx" ON "artifacts" USING btree ("run_id","type");--> statement-breakpoint
CREATE INDEX "artifacts_bug_id_idx" ON "artifacts" USING btree ("bug_id");