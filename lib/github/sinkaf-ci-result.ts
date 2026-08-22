import { RunResult, BugFinding } from "../domain";
import { GitHubRunContext, PullRequestQaResult } from "./github-types";

export function evaluatePullRequestResult(
  runId: string, 
  context: GitHubRunContext, 
  result: RunResult, 
  runStatus: string,
  failOn: "critical" | "high" | "medium" | "any" | "never" = "high"
): PullRequestQaResult {
  const findings = result.findings || [];
  const comparison = result.comparison || {};
  
  const newBugs: BugFinding[] = [];
  const regressions: BugFinding[] = [];
  const existingBugs: BugFinding[] = [];
  const fixedBugs: BugFinding[] = []; // Usually requires two separate runs, mock for now
  
  for (const bug of findings) {
    if (comparison.regressedBugs?.includes(bug.id)) {
      regressions.push(bug);
    } else if (comparison.newBugs?.includes(bug.id)) {
      newBugs.push(bug);
    } else if (comparison.recurringBugs?.includes(bug.id)) {
      existingBugs.push(bug);
    } else {
      // If no comparison exists, assume NEW
      newBugs.push(bug);
    }
  }

  let conclusion: PullRequestQaResult["conclusion"] = "pass";
  
  if (runStatus === "infra_error" || !runStatus) {
    conclusion = "infra_error";
  } else if (failOn !== "never") {
    const severities: Record<string, number> = {
      "critical": 4,
      "high": 3,
      "medium": 2,
      "low": 1
    };
    
    const threshold = severities[failOn] || 3;
    
    const maxSeverity = Math.max(
      0,
      ...newBugs.map(b => severities[b.severity] || 0),
      ...regressions.map(b => severities[b.severity] || 0)
    );
    
    if (maxSeverity >= threshold) {
      conclusion = "fail";
    } else if (maxSeverity > 0) {
      conclusion = "warning";
    }
  }

  const runUrl = process.env.APP_BASE_URL ? `${process.env.APP_BASE_URL}/runs/${runId}` : `https://sinkaf-qa/runs/${runId}`;

  return {
    runId,
    repository: context.repository,
    pullRequestNumber: context.pullRequestNumber || 0,
    commitSha: context.commitSha,
    previewUrl: context.previewUrl,
    baselineUrl: context.baselineUrl,
    conclusion,
    newBugs,
    regressions,
    existingBugs,
    fixedBugs,
    runUrl
  };
}
