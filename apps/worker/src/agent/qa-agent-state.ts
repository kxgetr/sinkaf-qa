export type BugCategory = 
  | "VALIDATION_FAILURE"
  | "STATE_FAILURE"
  | "NAVIGATION_FAILURE"
  | "API_FAILURE"
  | "UI_FAILURE"
  | "RESPONSIVE_FAILURE"
  | "LOADING_FAILURE"
  | "ERROR_HANDLING_FAILURE"
  | "DUPLICATE_ACTION"
  | "ACCESSIBILITY_OBSERVATION"
  | "UNKNOWN";

export type BugSeverity = "low" | "medium" | "high" | "critical";

export interface EvidenceReference {
  type: string;
  data: unknown;
}

export interface PotentialBug {
  id: string;
  title: string;
  category: BugCategory;
  observedBehavior: string;
  expectedHypothesis: string;
  evidenceSoFar: EvidenceReference[];
  reproductionAttempts: number;
  reproductionSuccesses: number;
}

export interface BugFinding {
  id: string;
  title: string;
  severity: BugSeverity;
  confidence: number;
  url: string;
  category: BugCategory;
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  reproduced: boolean;
  reproductionCount: number;
  comment?: string;
  evidence: {
    screenshots: any[];
    trace?: any;
    console: any[];
    network: any[];
    reproductionRunActions: number[];
    evidenceQuality: "weak" | "moderate" | "strong" | "very_strong";
  };
}

export type QaAgentState = {
  runId: string;
  targetUrl: string;
  goal: string;
  autoDiscover: boolean;
  
  currentUrl: string | null;
  pagesVisited: string[];
  
  actionCount: number;
  modelTurnCount: number;
  testCasesAttempted: number;
  
  observations: unknown[];
  
  potentialBugs: PotentialBug[];
  confirmedBugs: BugFinding[];
  artifacts: any[];
  
  startedAt: number;
  completionReason?: "completed" | "budget_exhausted" | "user_scope_completed" | "blocked_by_destructive_action" | "infra_error";
};
