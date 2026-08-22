import { z } from "zod";

export const browserSnapshotSchema = z.object({
  description: z.string().describe("Get a structured snapshot of the current page.")
});

export const browserNavigateSchema = z.object({
  url: z.string()
});

export const browserClickSchema = z.object({
  target: z.string().describe("Element ID from the snapshot")
});

export const browserFillSchema = z.object({
  target: z.string().describe("Element ID from the snapshot"),
  value: z.string()
});

export const reportBugSchema = z.object({
  title: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.number().min(0).max(1),
  category: z.enum([
    "VALIDATION_FAILURE", "STATE_FAILURE", "NAVIGATION_FAILURE", 
    "API_FAILURE", "UI_FAILURE", "RESPONSIVE_FAILURE", 
    "LOADING_FAILURE", "ERROR_HANDLING_FAILURE", "DUPLICATE_ACTION", 
    "ACCESSIBILITY_OBSERVATION", "UNKNOWN"
  ]),
  description: z.string(),
  steps: z.array(z.string()),
  expected: z.string(),
  actual: z.string()
});

export const finishRunSchema = z.object({
  reason: z.enum(["completed", "budget_exhausted", "user_scope_completed", "blocked_by_destructive_action"])
});
