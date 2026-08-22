import { BugFinding, BugSeverity, BugCategory } from "../agent/qa-agent-state";

export type RoastContext =
  | "CSS_FAILURE"
  | "VALIDATION_FAILURE"
  | "STATE_FAILURE"
  | "API_FAILURE"
  | "DATABASE_FAILURE"
  | "AUTH_FAILURE"
  | "PAYMENT_FAILURE"
  | "NAVIGATION_FAILURE"
  | "RESPONSIVE_FAILURE"
  | "LOADING_FAILURE"
  | "ERROR_HANDLING_FAILURE"
  | "DEPENDENCY_FAILURE"
  | "BROWSER_FAILURE"
  | "AGENT_FAILURE"
  | "INFRA_FAILURE"
  | "UNKNOWN_FAILURE"
  | "REGRESSION"
  | "RECURRING_BUG"
  | "FIXED_BUG"
  | "SUCCESS";

export type RoastMode = "NORMAL" | "HEAVY" | "DESTAN";

export type EgoState = {
  superiority: number;
  irritation: number;
  contempt: number;
  confidence: number;
  victory: number;
};

export type EngineeringJudgement = {
  likelyRootArea:
    | "frontend"
    | "backend"
    | "state"
    | "api"
    | "database"
    | "css"
    | "validation"
    | "architecture"
    | "review_process"
    | "unknown";
  possibleCause?: string;
  regressionRisk: "low" | "medium" | "high";
  roastTarget:
    | "code"
    | "implementation"
    | "architecture"
    | "author_decision"
    | "review_process"
    | "qa_process"
    | "our_infrastructure";
};

export type PhraseHistory = {
  openings: string[];
  profanity: string[];
  metaphors: string[];
  punchlines: string[];
};

export type PersonalityInput = {
  finding?: BugFinding;
  context: RoastContext;
  judgement: EngineeringJudgement;
  ego: EgoState;
  recentPhrases: PhraseHistory;
  infraError?: string;
  runSummary?: { bugs: number; actions: number; pages: number };
};

export type PersonalityOutput = {
  mode: RoastMode;
  comment: string;
};

export type Lexicon = {
  reactions: string[];
  quality: string[];
  failure: string[];
  disbelief: string[];
  tech_roasts: Record<string, string[]>;
  self_roasts: string[];
  punchlines: string[];
  transitions: string[];
  objects: string[];
  pop_culture: string[];
  mockery: string[];
};
