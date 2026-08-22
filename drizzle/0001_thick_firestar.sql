CREATE INDEX "run_events_run_id_idx" ON "run_events" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "run_events_run_id_seq_idx" ON "run_events" USING btree ("run_id","sequence");--> statement-breakpoint
CREATE INDEX "runs_created_at_idx" ON "runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "runs_status_idx" ON "runs" USING btree ("status");