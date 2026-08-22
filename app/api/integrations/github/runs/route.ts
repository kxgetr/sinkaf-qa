import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../../../lib/db/client";
import { runs } from "../../../../../lib/db/schema";
import crypto from "crypto";
import { workerClient } from "../../../../../lib/worker/client";
import { GitHubRunContext } from "../../../../../lib/github/github-types";

const githubRunSchema = z.object({
  repository: z.string(),
  pullRequestNumber: z.number().optional(),
  commitSha: z.string(),
  previewUrl: z.string().url(),
  baselineUrl: z.string().url().optional(),
  goal: z.string().optional(),
  autoDiscover: z.boolean().default(true),
  workflowRunId: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.SINKAF_TRIGGER_TOKEN}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = githubRunSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error }, { status: 400 });
    }

    const input = parsed.data;
    
    const context: GitHubRunContext = {
      source: "github",
      repository: input.repository,
      pullRequestNumber: input.pullRequestNumber,
      commitSha: input.commitSha,
      previewUrl: input.previewUrl,
      baselineUrl: input.baselineUrl,
      workflowRunId: input.workflowRunId
    };

    const runId = "run_" + crypto.randomUUID();
    
    const goalStr = input.goal || "Bu preview deployment'ı exploratory QA ile test et. Özellikle yeni bug ve regression bulmaya öncelik ver.";

    await db.insert(runs).values({
      id: runId,
      url: input.previewUrl,
      goal: goalStr,
      autoDiscover: input.autoDiscover,
      status: "pending",
      integrationType: "github",
      integrationContext: context
    });

    await workerClient.startRun({
      runId: runId,
      request: {
        url: input.previewUrl,
        goal: goalStr,
        autoDiscover: input.autoDiscover
      }
    });

    return NextResponse.json({ runId, message: "Run dispatched" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
