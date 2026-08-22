export interface QaAgentBudget {
  maxModelTurns: number;
  maxBrowserActions: number;
  maxPages: number;
  maxDurationMs: number;
  maxTestCases: number;
  maxReproductionAttemptsPerBug: number;
}

export const DEFAULT_BUDGET: QaAgentBudget = {
  maxModelTurns: 30,
  maxBrowserActions: 60,
  maxPages: 10,
  maxDurationMs: 300000,
  maxTestCases: 15,
  maxReproductionAttemptsPerBug: 3
};
