export type RunStatus =
  | "pending"
  | "queued"
  | "running"
  | "passed"
  | "issues_found"
  | "infra_error"
  | "cancelled";

export type BugSeverity = "critical" | "high" | "medium" | "low";

export interface BugEvidence {
  screenshots: any[];
  trace?: any;
  console: any[];
  network: any[];
  reproductionRunActions: number[];
  evidenceQuality: "weak" | "moderate" | "strong" | "very_strong";
}

export interface BugFinding {
  id: string;
  title: string;
  severity: BugSeverity;
  confidence: number;
  url: string;
  category: string;
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  reproduced: boolean;
  reproductionCount: number;
  evidence?: BugEvidence;
  comment?: string;
  summaryComment?: string;
  projectId?: string;
  comparison?: any;
}

export interface RunRequest {
  url: string;
  goal: string;
  autoDiscover: boolean;
  authProfileId?: string;
}

export interface RunError {
  code: string;
  message: string;
}

export interface RunSummary {
  issuesCount: number;
  criticalIssuesCount: number;
}

export interface RunResult {
  findings: BugFinding[];
  summary: RunSummary;
  error?: RunError;
  comparison?: any;
  projectId?: string;
}

export interface Run {
  id: string;
  request: RunRequest;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  result?: RunResult;
}
