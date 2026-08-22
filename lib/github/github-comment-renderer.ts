import { PullRequestQaResult } from "./github-types";

export function renderGithubPullRequestReport(qaResult: PullRequestQaResult, summaryComment?: string): string {
  const { conclusion, previewUrl, commitSha, newBugs, regressions, existingBugs, runUrl } = qaResult;
  
  let header = "";
  if (conclusion === "pass") {
    header = "## ✅ SINKAF QA\n\n### SIÇTI MI?\n\n**ŞİMDİLİK HAYIR.**";
  } else if (conclusion === "fail") {
    header = "## ❌ SINKAF QA\n\n### SIÇTI MI?\n\n**EVET AMK.**";
  } else if (conclusion === "infra_error") {
    header = "## ⚠️ SINKAF QA\n\n### BU SEFER BİZ SIÇTIK.\n\nAltyapı çöktü veya test tamamlanamadı.";
  } else {
    header = "## ⚠️ SINKAF QA\n\n### BİRAZ SIKINTI VAR.";
  }

  let report = `<!-- sinkaf-qa-report -->
${header}

Preview:
${previewUrl}

Commit:
\`${commitSha.substring(0, 7)}\`

### Sonuç
`;

  if (conclusion !== "infra_error") {
    const criticalCount = [...newBugs, ...regressions].filter(b => b.severity === "critical").length;
    const highCount = [...newBugs, ...regressions].filter(b => b.severity === "high").length;
    const mediumCount = [...newBugs, ...regressions].filter(b => b.severity === "medium").length;
    
    if (criticalCount > 0) report += `\n🔴 ${criticalCount} Critical`;
    if (highCount > 0) report += `\n🟠 ${highCount} High`;
    if (mediumCount > 0) report += `\n🟡 ${mediumCount} Medium`;
    if (criticalCount === 0 && highCount === 0 && mediumCount === 0) report += `\n✅ No High/Critical Issues`;
    report += "\n";

    if (newBugs.length > 0) {
      report += `\n### PR'ın getirdiği yeni dertler\n\n`;
      newBugs.slice(0, 5).forEach(b => {
        report += `- **${b.title}** (${b.severity.toUpperCase()})\n`;
      });
      if (newBugs.length > 5) report += `- *...ve ${newBugs.length - 5} tane daha.*\n`;
    }

    if (regressions.length > 0) {
      report += `\n### Regression (Mezardan Dönenler)\n\n`;
      regressions.slice(0, 5).forEach(b => {
        report += `- **${b.title}** (${b.severity.toUpperCase()})\n`;
      });
      if (regressions.length > 5) report += `- *...ve ${regressions.length - 5} tane daha.*\n`;
    }

    if (existingBugs.length > 0) {
      report += `\n### Zaten bozuk olanlar (Bu PR'ın suçu değil)\n\n`;
      existingBugs.slice(0, 3).forEach(b => {
        report += `- ${b.title}\n`;
      });
      if (existingBugs.length > 3) report += `- *...ve ${existingBugs.length - 3} tane daha.*\n`;
    }

    if (summaryComment) {
      report += `\n---\n\n> "${summaryComment}"\n`;
    }
  }

  report += `\n\n[Kanıtları ve tam raporu aç](${runUrl})`;
  
  return report;
}
