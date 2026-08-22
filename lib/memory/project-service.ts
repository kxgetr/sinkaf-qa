import { db } from "../db/client";
import { projects, runs } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function resolveProject(url: string, runId: string) {
  const parsed = new URL(url);
  const hostname = parsed.hostname;

  let project = await db.select().from(projects).where(eq(projects.hostname, hostname)).then((res: any) => res[0]);

  if (!project) {
    const newId = "proj_" + crypto.randomUUID();
    await db.insert(projects).values({
      id: newId,
      hostname,
      displayName: hostname,
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0
    });
    project = await db.select().from(projects).where(eq(projects.id, newId)).then((res: any) => res[0]);
  }

  // Link run
  await db.update(runs).set({ projectId: project.id }).where(eq(runs.id, runId));

  // Update project
  await db.update(projects).set({
    lastRunAt: new Date(),
    runCount: (project.runCount || 0) + 1,
    updatedAt: new Date()
  }).where(eq(projects.id, project.id));

  return project;
}
