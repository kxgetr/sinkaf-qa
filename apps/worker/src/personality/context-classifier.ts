import { BugCategory, BugSeverity } from "../agent/qa-agent-state";
import { RoastContext, EngineeringJudgement } from "./personality-types";

export function classifyContext(category: BugCategory): RoastContext {
  switch (category) {
    case "VALIDATION_FAILURE": return "VALIDATION_FAILURE";
    case "STATE_FAILURE": return "STATE_FAILURE";
    case "NAVIGATION_FAILURE": return "NAVIGATION_FAILURE";
    case "API_FAILURE": return "API_FAILURE";
    case "UI_FAILURE": return "CSS_FAILURE";
    case "RESPONSIVE_FAILURE": return "RESPONSIVE_FAILURE";
    case "LOADING_FAILURE": return "LOADING_FAILURE";
    case "ERROR_HANDLING_FAILURE": return "ERROR_HANDLING_FAILURE";
    case "DUPLICATE_ACTION": return "STATE_FAILURE";
    default: return "UNKNOWN_FAILURE";
  }
}

export function generateJudgement(category: BugCategory, severity: BugSeverity): EngineeringJudgement {
  let likelyRootArea: EngineeringJudgement["likelyRootArea"] = "unknown";
  let roastTarget: EngineeringJudgement["roastTarget"] = "implementation";
  
  if (category === "VALIDATION_FAILURE") {
    likelyRootArea = "validation";
    roastTarget = "code";
  } else if (category === "API_FAILURE" || category === "ERROR_HANDLING_FAILURE") {
    likelyRootArea = "backend";
    roastTarget = "architecture";
  } else if (category === "STATE_FAILURE" || category === "DUPLICATE_ACTION") {
    likelyRootArea = "state";
    roastTarget = "implementation";
  } else if (category === "UI_FAILURE" || category === "RESPONSIVE_FAILURE") {
    likelyRootArea = "css";
    roastTarget = "review_process";
  }

  let regressionRisk: "low" | "medium" | "high" = "low";
  if (severity === "critical" || severity === "high") regressionRisk = "high";
  else if (severity === "medium") regressionRisk = "medium";

  return {
    likelyRootArea,
    regressionRisk,
    roastTarget,
    possibleCause: `Büyük ihtimalle ${likelyRootArea} tarafı sıçmış.`
  };
}
