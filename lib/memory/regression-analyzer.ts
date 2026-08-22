import { db } from "../db/client";
import { bugFingerprints, projectMemory } from "../db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { generateFingerprint } from "./fingerprint";
import crypto from "crypto";
import { RunResult } from "../domain";

export type RunComparison = {
  previousRunId?: string;
  newBugs: string[];
  recurringBugs: string[];
  fixedBugs: string[];
  regressedBugs: string[];
  unresolvedBugs: string[];
  bugsDelta: number;
  criticalDelta: number;
};

export async function analyzeRegression(projectId: string, currentRunId: string, result: RunResult): Promise<RunComparison> {
  const comparison: RunComparison = {
    newBugs: [],
    recurringBugs: [],
    fixedBugs: [],
    regressedBugs: [],
    unresolvedBugs: [],
    bugsDelta: 0,
    criticalDelta: 0
  };

  const findings = result.findings || [];
  const currentFingerprints = findings.map(f => {
    return { bugId: f.id, ...generateFingerprint(f.category, f.url, f.expected, f.actual), finding: f };
  });

  // Get historical bugs for this project
  const historicalBugs = await db.select().from(bugFingerprints).where(eq(bugFingerprints.projectId, projectId));
  const historicalMap = new Map(historicalBugs.map((b: any) => [b.fingerprint, b]));

  // Process current bugs
  for (const cf of currentFingerprints) {
    const history = historicalMap.get(cf.fingerprint);
    if (!history) {
      // NEW BUG
      await db.insert(bugFingerprints).values({
        id: "bf_" + crypto.randomUUID(),
        projectId,
        fingerprint: cf.fingerprint,
        category: cf.finding.category,
        normalizedPath: cf.normalizedPath,
        firstSeenRunId: currentRunId,
        lastSeenRunId: currentRunId,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        occurrenceCount: 1,
        currentState: "open"
      });
      comparison.newBugs.push(cf.bugId);
      
      // Add memory
      await db.insert(projectMemory).values({
        id: "mem_" + crypto.randomUUID(),
        projectId,
        type: "KNOWN_BUG",
        key: cf.normalizedPath,
        value: { title: cf.finding.title, expected: cf.finding.expected },
        sourceRunId: currentRunId,
        sourceBugId: cf.bugId
      });
    } else {
      // RECURRING or REGRESSED
      const historyAny = history as any;
      const isRegressed = historyAny.currentState === "fixed" || historyAny.currentState === "possibly_fixed";
      const newState = isRegressed ? "regressed" : "open"; // recurring
      
      await db.update(bugFingerprints).set({
        lastSeenRunId: currentRunId,
        lastSeenAt: new Date(),
        occurrenceCount: historyAny.occurrenceCount + 1,
        currentState: newState
      }).where(eq(bugFingerprints.id, historyAny.id));

      if (isRegressed) {
        comparison.regressedBugs.push(cf.bugId);
        // Ego Engine mutation will happen later via SinkafReactor
      } else {
        comparison.recurringBugs.push(cf.bugId);
      }
    }
  }

  // Detect fixed bugs
  // If a historical bug is open/regressed, and its normalizedPath was visited in this run, but it's not in current bugs -> FIXED
  // For simplicity, we just check if it's missing from currentFingerprints
  const currentFpSet = new Set(currentFingerprints.map(f => f.fingerprint));
  
  for (const history of historicalBugs) {
    if (!currentFpSet.has(history.fingerprint)) {
      if (history.currentState === "open" || history.currentState === "regressed") {
        await db.update(bugFingerprints).set({
          currentState: "fixed"
        }).where(eq(bugFingerprints.id, history.id));
        comparison.fixedBugs.push(history.id);
      } else if (history.currentState === "fixed") {
        // Still fixed
      }
    }
  }

  comparison.bugsDelta = comparison.newBugs.length + comparison.regressedBugs.length - comparison.fixedBugs.length;
  // criticalDelta omitted for simplicity

  return comparison;
}
