CREATE TABLE "demo_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"fingerprint_hash" text,
	"run_id" text NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"user_agent_family" text,
	CONSTRAINT "demo_claims_ip_hash_unique" UNIQUE("ip_hash")
);
--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "comparison" jsonb;