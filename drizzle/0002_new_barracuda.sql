CREATE TABLE "bug_fingerprints" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"fingerprint" text NOT NULL,
	"category" text NOT NULL,
	"normalized_path" text NOT NULL,
	"flow" text,
	"first_seen_run_id" text NOT NULL,
	"last_seen_run_id" text NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL,
	"current_state" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_memory" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"type" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb,
	"confidence" real DEFAULT 1 NOT NULL,
	"source_run_id" text,
	"source_bug_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_confirmed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"hostname" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_run_at" timestamp with time zone,
	"run_count" integer DEFAULT 0,
	CONSTRAINT "projects_hostname_unique" UNIQUE("hostname")
);
--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "project_id" text;--> statement-breakpoint
ALTER TABLE "bug_fingerprints" ADD CONSTRAINT "bug_fingerprints_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_fingerprints" ADD CONSTRAINT "bug_fingerprints_first_seen_run_id_runs_id_fk" FOREIGN KEY ("first_seen_run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_fingerprints" ADD CONSTRAINT "bug_fingerprints_last_seen_run_id_runs_id_fk" FOREIGN KEY ("last_seen_run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_memory" ADD CONSTRAINT "project_memory_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_memory" ADD CONSTRAINT "project_memory_source_run_id_runs_id_fk" FOREIGN KEY ("source_run_id") REFERENCES "public"."runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bug_fingerprints_project_id_idx" ON "bug_fingerprints" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "bug_fingerprints_hash_idx" ON "bug_fingerprints" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "project_memory_project_id_idx" ON "project_memory" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_memory_type_idx" ON "project_memory" USING btree ("type");--> statement-breakpoint
CREATE INDEX "projects_hostname_idx" ON "projects" USING btree ("hostname");--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;