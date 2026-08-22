export type GitHubRunContext = {
  repository: string;
  pullRequestNumber?: number;
  commitSha: string;
  previewUrl: string;
  baselineUrl?: string;
  workflowRunId?: string;
  source: "github";
};

export type PullRequestQaResult = {
  runId: string;
  repository: string;
  pullRequestNumber: number;
  commitSha: string;
  previewUrl: string;
  baselineUrl?: string;
  conclusion: "pass" | "fail" | "warning" | "infra_error";
  newBugs: any[];
  regressions: any[];
  existingBugs: any[];
  fixedBugs: any[];
  runUrl: string;
};

export type IntegrationDelivery = {
  comment: "pending" | "success" | "failed";
  commitStatus: "pending" | "success" | "failed";
  errorCode?: string;
};
