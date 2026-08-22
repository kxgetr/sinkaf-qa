CREATE TABLE "run_events" (
	"id" text PRIMARY KEY NOT NULL,
	"run_id" text NOT NULL,
	"sequence" integer NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"goal" text NOT NULL,
	"auto_discover" boolean NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"worker_run_id" text,
	"pages_visited" integer DEFAULT 0,
	"browser_actions" integer DEFAULT 0,
	"test_cases_attempted" integer DEFAULT 0,
	"confirmed_bugs" integer DEFAULT 0,
	"critical_bugs" integer DEFAULT 0,
	"error_code" text,
	"error_stage" text,
	"error_message" text,
	"result" jsonb
);
--> statement-breakpoint
ALTER TABLE "run_events" ADD CONSTRAINT "run_events_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;