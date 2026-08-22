import { db } from "../../db/client";
import { attackSessions, securityEvents, honeypotHits } from "../../db/schema";
import { eq } from "drizzle-orm";
import { BanEnforcer } from "../ban/ban-enforcer";

export class RiskEngine {
  static async evaluateAndRecord(ipHash: string, sessionId: string | null, event: any): Promise<{ tarpitMs: number; banned: boolean }> {
    const { normalizedPath, eventType, confidence, signals } = event;
    
    // Determine risk delta
    let delta = 0;
    if (eventType === "HONEYPOT_HIT") delta += 15;
    if (eventType === "SECRET_PROBE") delta += 20;
    if (eventType === "ADMIN_ENUMERATION") delta += 10;
    if (eventType === "CVE_PROBE") delta += 25;
    if (eventType === "REQUEST_TAMPERING") delta += 15;
    if (eventType === "CANARY_TRIGGER") delta += 35;
    
    // Upsert session
    let session = await db.select().from(attackSessions).where(eq(attackSessions.ipHash, ipHash)).limit(1);
    let currentScore = delta;
    
    if (session.length === 0) {
      const res = await db.insert(attackSessions).values({
        ipHash,
        riskScore: delta,
        requestCount: 1,
        honeypotHits: eventType === "HONEYPOT_HIT" ? 1 : 0,
        classification: [eventType],
        status: delta >= 70 ? "banned" : (delta >= 50 ? "tarpitted" : "suspicious")
      }).returning();
      session = res;
    } else {
      currentScore = session[0].riskScore + delta;
      
      const newClasses = new Set((session[0].classification as string[]) || []);
      newClasses.add(eventType);
      
      const res = await db.update(attackSessions).set({
        riskScore: currentScore,
        requestCount: session[0].requestCount + 1,
        honeypotHits: session[0].honeypotHits + (eventType === "HONEYPOT_HIT" ? 1 : 0),
        classification: Array.from(newClasses),
        lastSeenAt: new Date(),
        status: currentScore >= 70 ? "banned" : (currentScore >= 50 ? "tarpitted" : "suspicious")
      }).where(eq(attackSessions.id, session[0].id)).returning();
      session = res;
    }

    // Insert security event
    await db.insert(securityEvents).values({
      sessionId: session[0].id,
      ipHash,
      requestId: event.requestId,
      method: event.method || "GET",
      normalizedPath: event.normalizedPath || "/",
      eventType: event.eventType,
      riskScoreDelta: delta,
      confidence: event.confidence || 0,
      signals: event.signals || []
    });

    if (eventType === "HONEYPOT_HIT") {
      await db.insert(honeypotHits).values({
        sessionId: session[0].id,
        path: event.normalizedPath,
        persona: event.persona || "GENERIC",
        responseStatus: event.responseStatus || 200
      });
    }

    // Apply bans if threshold reached
    let banned = false;
    if (currentScore >= 70) {
      banned = true;
      let level: "TEMPORARY" | "LONG" | "PERMANENT" = "TEMPORARY";
      if (currentScore >= 95) level = "PERMANENT";
      else if (currentScore >= 85) level = "LONG";

      await BanEnforcer.applyBan(ipHash, level, currentScore, "RISK_THRESHOLD_EXCEEDED");
    }

    // Calculate Tarpit
    let tarpitMs = 0;
    if (!banned && currentScore >= 50 && process.env.SECURITY_TARPIT_ENABLED !== "false") {
      tarpitMs = 500 + Math.random() * 2000; // 500ms to 2.5s
      if (currentScore >= 60) tarpitMs += 2000;
    }

    return { tarpitMs, banned };
  }
}
