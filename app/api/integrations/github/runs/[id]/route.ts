import { NextResponse } from "next/server";
import { db } from "../../../../../../lib/db/client";
import { runs } from "../../../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { GitHubRunContext } from "../../../../../../lib/github/github-types";
import { evaluatePullRequestResult } from "../../../../../../lib/github/sinkaf-ci-result";
import { renderGithubPullRequestReport } from "../../../../../../lib/github/github-comment-renderer";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.SINKAF_TRIGGER_TOKEN}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const run = await db.select().from(runs).where(eq(runs.id, id)).then((res: any) => res[0]);

    if (!run) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!run.integrationType || run.integrationType !== "github") {
      return NextResponse.json({ error: "Not a GitHub run" }, { status: 400 });
    }

    const isFinished = ["passed", "issues_found", "infra_error", "cancelled"].includes(run.status);
    
    if (!isFinished) {
      return NextResponse.json({ status: run.status });
    }

    const context = run.integrationContext as GitHubRunContext;
    const qaResult = evaluatePullRequestResult(run.id, context, run.result || { findings: [], summary: {} }, run.status, "high");
    
    const reportMarkdown = renderGithubPullRequestReport(qaResult, run.result?.summary?.summaryComment);

    return NextResponse.json({
      status: run.status,
      conclusion: qaResult.conclusion,
      reportMarkdown,
      qaResult
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
