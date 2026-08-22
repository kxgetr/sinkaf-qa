import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { resolveClientIp, generateIdentityHash } from "../../../lib/demo/demo-identity";
import { BanEnforcer } from "../../../lib/security/ban/ban-enforcer";
import { runRepository } from "../../../lib/runs/repository";
import { Run } from "../../../lib/domain";
import { workerClient } from "../../../lib/worker/client";

const runRequestSchema = z.object({
  url: z.string().url().refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
    message: "URL must start with http:// or https://"
  }),
  goal: z.string().min(1),
  autoDiscover: z.boolean()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Ban check
    const ip = resolveClientIp(req);
    const pepper = process.env.SECURITY_IDENTITY_PEPPER || process.env.DEMO_IDENTITY_PEPPER || "fallback_pepper";
    const ipHash = generateIdentityHash(ip, pepper);
    const banStatus = await BanEnforcer.checkBan(ipHash);
    
    if (banStatus.banned) {
      return NextResponse.json({ error: "Sen hâlâ burada mısın amk? Kapı kapalı." }, { status: 403 });
    }

    const result = runRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.issues }, { status: 400 });
    }

    const runId = Math.random().toString(36).substring(2, 15);
    const run: Run = {
      id: runId,
      request: result.data,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await runRepository.create(run);
    
    try {
      if (process.env.QA_WORKER_URL && process.env.QA_WORKER_API_KEY) {
        await workerClient.startRun({
          runId: run.id,
          request: run.request
        });
        await runRepository.update(run.id, { status: "queued" });
        run.status = "queued";
      }
    } catch (workerErr) {
      console.error("Worker failed to accept run:", workerErr);
      await runRepository.update(run.id, { status: "infra_error" });
      run.status = "infra_error";
    }

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
    }

    if (!runRepository.listRecent) {
       return NextResponse.json([], { status: 200 });
    }

    const runs = await runRepository.listRecent(limit);
    return NextResponse.json(runs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
