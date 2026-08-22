import { db } from "../../db/client";
import { ipBans } from "../../db/schema";
import { eq, and, gt, or, isNull } from "drizzle-orm";

export class BanEnforcer {
  static async checkBan(ipHash: string): Promise<{ banned: boolean; reason?: string }> {
    const activeBan = await db.select().from(ipBans).where(
      and(
        eq(ipBans.ipHash, ipHash),
        or(
          isNull(ipBans.expiresAt),
          gt(ipBans.expiresAt, new Date())
        )
      )
    ).limit(1);

    if (activeBan.length > 0) {
      return { banned: true, reason: activeBan[0].reasonCode };
    }
    return { banned: false };
  }

  static async applyBan(ipHash: string, level: "TEMPORARY" | "LONG" | "PERMANENT", riskScore: number, reasonCode: string, evidenceEventIds: string[] = []): Promise<void> {
    let expiresAt: Date | null = null;
    let permanent = false;

    if (level === "TEMPORARY") {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    } else if (level === "LONG") {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else if (level === "PERMANENT") {
      permanent = true;
    }

    const existing = await db.select().from(ipBans).where(eq(ipBans.ipHash, ipHash)).limit(1);

    if (existing.length > 0) {
      await db.update(ipBans).set({
        level,
        reasonCode,
        riskScore,
        expiresAt,
        permanent,
        previousBanCount: existing[0].previousBanCount + 1,
        evidenceEventIds: [...((existing[0].evidenceEventIds as string[]) || []), ...evidenceEventIds]
      }).where(eq(ipBans.ipHash, ipHash));
    } else {
      await db.insert(ipBans).values({
        ipHash,
        level,
        reasonCode,
        riskScore,
        expiresAt,
        permanent,
        evidenceEventIds
      });
    }
  }
}
