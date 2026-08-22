import { pgTable, text, timestamp, boolean, integer, jsonb, index, real, uuid } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  hostname: text("hostname").notNull().unique(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  runCount: integer("run_count").default(0),
}, (table) => [
  index("projects_hostname_idx").on(table.hostname)
]);

export const runs = pgTable("runs", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  goal: text("goal").notNull(),
  autoDiscover: boolean("auto_discover").notNull(),
  status: text("status").notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  
  workerRunId: text("worker_run_id"),
  
  pagesVisited: integer("pages_visited").default(0),
  browserActions: integer("browser_actions").default(0),
  testCasesAttempted: integer("test_cases_attempted").default(0),
  confirmedBugs: integer("confirmed_bugs").default(0),
  criticalBugs: integer("critical_bugs").default(0),
  
  errorCode: text("error_code"),
  errorStage: text("error_stage"),
  errorMessage: text("error_message"),
  
  result: jsonb("result"),
  comparison: jsonb("comparison"),
  integrationType: text("integration_type"),
  integrationContext: jsonb("integration_context")
}, (table) => [
  index("runs_created_at_idx").on(table.createdAt),
  index("runs_status_idx").on(table.status),
  index("runs_integration_type_idx").on(table.integrationType)
]);

export const demoClaims = pgTable("demo_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  ipHash: text("ip_hash").notNull().unique(),
  fingerprintHash: text("fingerprint_hash"),
  runId: text("run_id").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  status: text("status").notNull(),
  userAgentFamily: text("user_agent_family")
});

export const runEvents = pgTable("run_events", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("run_events_run_id_idx").on(table.runId),
  index("run_events_run_id_seq_idx").on(table.runId, table.sequence)
]);

export const projectMemory = pgTable("project_memory", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  key: text("key").notNull(),
  value: jsonb("value"),
  confidence: real("confidence").notNull().default(1.0),
  sourceRunId: text("source_run_id").references(() => runs.id, { onDelete: "set null" }),
  sourceBugId: text("source_bug_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastConfirmedAt: timestamp("last_confirmed_at", { withTimezone: true })
}, (table) => [
  index("project_memory_project_id_idx").on(table.projectId),
  index("project_memory_type_idx").on(table.type)
]);

export const bugFingerprints = pgTable("bug_fingerprints", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  fingerprint: text("fingerprint").notNull(),
  category: text("category").notNull(),
  normalizedPath: text("normalized_path").notNull(),
  flow: text("flow"),
  
  firstSeenRunId: text("first_seen_run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  lastSeenRunId: text("last_seen_run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  
  occurrenceCount: integer("occurrence_count").notNull().default(1),
  
  currentState: text("current_state").notNull() // "open", "possibly_fixed", "fixed", "regressed"
}, (table) => [
  index("bug_fingerprints_project_id_idx").on(table.projectId),
  index("bug_fingerprints_hash_idx").on(table.fingerprint)
]);

export const artifacts = pgTable("artifacts", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  bugId: text("bug_id"),
  type: text("type").notNull(),
  storageProvider: text("storage_provider").notNull(),
  storageKey: text("storage_key").notNull(),
  contentType: text("content_type").notNull(),
  byteLength: integer("byte_length").notNull(),
  sha256: text("sha256").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index("artifacts_run_id_idx").on(table.runId),
  index("artifacts_run_type_idx").on(table.runId, table.type),
  index("artifacts_bug_id_idx").on(table.bugId)
]);

export const securityEvents = pgTable("security_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipHash: text("ip_hash").notNull(),
  requestId: text("request_id").notNull(),
  method: text("method").notNull(),
  normalizedPath: text("normalized_path").notNull(),
  safeQuerySummary: text("safe_query_summary"),
  userAgentFamily: text("user_agent_family"),
  eventType: text("event_type").notNull(),
  riskScoreDelta: integer("risk_score_delta").notNull().default(0),
  confidence: integer("confidence").notNull().default(0),
  signals: jsonb("signals").notNull().default([]), // array of strings
  metadata: jsonb("metadata").notNull().default({})
}, (table) => [
  index("se_ip_hash_idx").on(table.ipHash),
  index("se_session_id_idx").on(table.sessionId)
]);

export const attackSessions = pgTable("attack_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ipHash: text("ip_hash").notNull().unique(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  requestCount: integer("request_count").notNull().default(0),
  honeypotHits: integer("honeypot_hits").notNull().default(0),
  riskScore: integer("risk_score").notNull().default(0),
  classification: jsonb("classification").notNull().default([]), // array of strings
  suspectedCves: jsonb("suspected_cves").notNull().default([]), // array of objects
  persona: text("persona"),
  toolHints: jsonb("tool_hints").notNull().default([]), // array of strings
  status: text("status").notNull().default("observing") // observing, suspicious, malicious, tarpitted, banned
});

export const honeypotHits = pgTable("honeypot_hits", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  path: text("path").notNull(),
  persona: text("persona").notNull(),
  responseStatus: integer("response_status").notNull()
});

export const ipBans = pgTable("ip_bans", {
  id: uuid("id").primaryKey().defaultRandom(),
  ipHash: text("ip_hash").notNull().unique(),
  level: text("level").notNull(), // TEMPORARY, LONG, PERMANENT
  reasonCode: text("reason_code").notNull(),
  riskScore: integer("risk_score").notNull(),
  evidenceEventIds: jsonb("evidence_event_ids").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  permanent: boolean("permanent").notNull().default(false),
  previousBanCount: integer("previous_ban_count").notNull().default(0)
});

export const securityIntelligence = pgTable("security_intelligence", {
  provider: text("provider").primaryKey(), // cisa_kev, nvd_cve
  lastSuccessfulSync: timestamp("last_successful_sync"),
  lastAttempt: timestamp("last_attempt"),
  recordsUpdated: integer("records_updated").notNull().default(0),
  data: jsonb("data").notNull().default({}) // KEV / CVE data hashmap
});

export const canaryHits = pgTable("canary_hits", {
  id: uuid("id").primaryKey().defaultRandom(),
  canaryId: text("canary_id").notNull(),
  sessionId: text("session_id"),
  ipHash: text("ip_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  triggerPath: text("trigger_path")
});
