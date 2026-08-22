CREATE TABLE "attack_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"honeypot_hits" integer DEFAULT 0 NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"classification" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"suspected_cves" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"persona" text,
	"tool_hints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'observing' NOT NULL,
	CONSTRAINT "attack_sessions_ip_hash_unique" UNIQUE("ip_hash")
);
--> statement-breakpoint
CREATE TABLE "canary_hits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canary_id" text NOT NULL,
	"session_id" text,
	"ip_hash" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"trigger_path" text
);
--> statement-breakpoint
CREATE TABLE "honeypot_hits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"path" text NOT NULL,
	"persona" text NOT NULL,
	"response_status" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ip_bans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"level" text NOT NULL,
	"reason_code" text NOT NULL,
	"risk_score" integer NOT NULL,
	"evidence_event_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"permanent" boolean DEFAULT false NOT NULL,
	"previous_ban_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ip_bans_ip_hash_unique" UNIQUE("ip_hash")
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_hash" text NOT NULL,
	"request_id" text NOT NULL,
	"method" text NOT NULL,
	"normalized_path" text NOT NULL,
	"safe_query_summary" text,
	"user_agent_family" text,
	"event_type" text NOT NULL,
	"risk_score_delta" integer DEFAULT 0 NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"signals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_intelligence" (
	"provider" text PRIMARY KEY NOT NULL,
	"last_successful_sync" timestamp,
	"last_attempt" timestamp,
	"records_updated" integer DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "se_ip_hash_idx" ON "security_events" USING btree ("ip_hash");--> statement-breakpoint
CREATE INDEX "se_session_id_idx" ON "security_events" USING btree ("session_id");