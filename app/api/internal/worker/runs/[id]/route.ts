import { NextResponse } from "next/server";
import { runRepository } from "../../../../../../lib/runs/repository";
import { z } from "zod";
import { resolveProject } from "../../../../../../lib/memory/project-service";
import { analyzeRegression } from "../../../../../../lib/memory/regression-analyzer";
import { db } from "../../../../../../lib/db/client";
import { runs, artifacts } from "../../../../../../lib/db/schema";
import { eq } from "drizzle-orm";

const callbackSchema = z.object({
  type: z.string(),
  result: z.any().optional(),
  error: z.any().optional(),
  data: z.any().optional()
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.WORKER_CALLBACK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = callbackSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const type = parsed.data.type;
    
    if (type === "process_memory") {
      const runRecord = await db.select().from(runs).where(eq(runs.id, id)).then((res: any) => res[0]);
      if (runRecord) {
        const project = await resolveProject(runRecord.url, id);
        const comparison = await analyzeRegression(project.id, id, parsed.data.result);
        return NextResponse.json({ success: true, projectId: project.id, comparison });
      }
      return NextResponse.json({ success: false, error: "Run not found" });
    }

    if (type === "run_completed") {
      // Extract and save artifacts
      const uploadedArtifacts = parsed.data.result?.artifacts || [];
      if (uploadedArtifacts.length > 0) {
        await db.insert(artifacts).values(
          uploadedArtifacts.map((a: any) => ({
            id: a.id,
            runId: id,
            bugId: a.bugId,
            type: a.type,
            storageProvider: a.storageProvider,
            storageKey: a.storageKey,
            contentType: a.contentType,
            byteLength: a.byteLength,
            sha256: a.sha256,
            metadata: a.metadata,
            createdAt: new Date(a.createdAt)
          }))
        ).onConflictDoNothing();
      }

      await runRepository.update(id, { status: parsed.data.result.status || "passed", result: parsed.data.result });
    } else if (type === "infra_error") {
      await runRepository.update(id, { status: "infra_error" });
    } else if (type === "worker_started") {
      await runRepository.update(id, { status: "queued" });
    } else if (type === "browser_started") {
      await runRepository.update(id, { status: "running" });
    }

    if (runRepository.appendEvent) {
      await runRepository.appendEvent(id, {
        type: type,
        message: type,
        metadata: parsed.data.data || parsed.data.error || parsed.data.result || {}
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
