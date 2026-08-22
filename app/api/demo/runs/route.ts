import { NextResponse } from "next/server";
import { db } from "../../../../lib/db/client";
import { runs, demoClaims } from "../../../../lib/db/schema";
import { workerClient } from "../../../../lib/worker/client";
import { resolveClientIp, generateIdentityHash } from "../../../../lib/demo/demo-identity";
import { BanEnforcer } from "../../../../lib/security/ban/ban-enforcer";
import { eq, or } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  if (process.env.PUBLIC_DEMO_ENABLED !== "true") {
    return NextResponse.json({ ok: false, code: "DEMO_DISABLED", message: "Public demo kapalı." }, { status: 403 });
  }

  try {
    const body = await req.json();
    let { url, goal, fingerprint } = body;

    if (!url) return NextResponse.json({ ok: false, code: "INVALID_URL", message: "URL lazım." }, { status: 400 });

    try {
      const parsed = new URL(url);
      const blockedHosts = (process.env.SELF_SCAN_BLOCKED_HOSTS || "sinkaf.com.tr,www.sinkaf.com.tr").split(",");
      if (blockedHosts.includes(parsed.hostname)) {
        return NextResponse.json({ ok: false, code: "SELF_SCAN_REFUSED", message: "Niye kendimi tarayayım aq, mal mıyım?" }, { status: 400 });
      }
      if (process.env.SELF_SCAN_BLOCK_SUBDOMAINS === "true") {
        if (parsed.hostname.endsWith(".sinkaf.com.tr") || parsed.hostname === "sinkaf.com.tr") {
           return NextResponse.json({ ok: false, code: "SELF_SCAN_REFUSED", message: "Niye kendimi tarayayım aq, mal mıyım?" }, { status: 400 });
        }
      }
    } catch {
      return NextResponse.json({ ok: false, code: "INVALID_URL", message: "URL formatı bozuk." }, { status: 400 });
    }

    const ip = resolveClientIp(req);
    if (ip === "0.0.0.0") {
      return NextResponse.json({ ok: false, code: "DEMO_IDENTITY_UNAVAILABLE", message: "Client IP bulunamadı." }, { status: 400 });
    }

    const pepper = process.env.DEMO_IDENTITY_PEPPER;
    if (!pepper) {
      return NextResponse.json({ ok: false, code: "DEMO_DISABLED", message: "Demo pepper eksik." }, { status: 500 });
    }

    const ipHash = generateIdentityHash(ip, pepper);

    const banStatus = await BanEnforcer.checkBan(ipHash);
    if (banStatus.banned) {
      return NextResponse.json({ ok: false, code: "SECURITY_ACCESS_BLOCKED", message: "Sen hâlâ burada mısın amk? Kapı kapalı." }, { status: 403 });
    }

    const fingerprintHash = fingerprint ? generateIdentityHash(JSON.stringify(fingerprint), pepper) : undefined;

    // Check existing claims
    let existing;
    if (fingerprintHash) {
      existing = await db.select().from(demoClaims).where(or(eq(demoClaims.ipHash, ipHash), eq(demoClaims.fingerprintHash, fingerprintHash))).limit(1);
    } else {
      existing = await db.select().from(demoClaims).where(eq(demoClaims.ipHash, ipHash)).limit(1);
    }

    if (existing.length > 0) {
      return NextResponse.json({ ok: false, code: "DEMO_ALREADY_USED", message: "Bir kere denedin aq. Gizli sekme açınca hafızam silinmiyor." }, { status: 403 });
    }

    // Try to claim
    const runId = crypto.randomUUID();
    try {
      await db.insert(demoClaims).values({
        ipHash,
        fingerprintHash,
        runId,
        status: "accepted",
        userAgentFamily: fingerprint?.userAgentFamily || "unknown"
      });
    } catch (e: any) {
      // Unique constraint violation
      return NextResponse.json({ ok: false, code: "DEMO_ALREADY_USED", message: "Race condition yakalandı veya çoktan kullanılmış." }, { status: 403 });
    }

    // Create the run
    await db.insert(runs).values({
      id: runId,
      url,
      goal: goal || "Genel exploratory testing yap. Neresi sıçmış bul.",
      autoDiscover: true,
      status: "pending",
    });

    // Start worker
    try {
      await workerClient.startRun({
        runId,
        request: {
          url,
          goal: goal || "Genel exploratory testing yap. Neresi sıçmış bul.",
          autoDiscover: true
        }
      });
    } catch (workerError) {
      console.error("Worker failed to start demo run:", workerError);
    }

    return NextResponse.json({ ok: true, runId });

  } catch (error) {
    console.error("Demo run error:", error);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
