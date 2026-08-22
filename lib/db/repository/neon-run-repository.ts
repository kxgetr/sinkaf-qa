import { Run, RunStatus, RunResult } from "../../domain";
import { db } from "../client";
import { runs, runEvents } from "../schema";
import { eq, desc } from "drizzle-orm";

export interface ExtendedRunRepository {
  create(run: Run): Promise<Run>;
  getById(id: string): Promise<Run | null>;
  update(id: string, updates: Partial<Run>): Promise<Run | null>;
  listRecent(limit?: number): Promise<Run[]>;
  listEvents(runId: string): Promise<unknown[]>;
  appendEvent(runId: string, event: { type: string, message: string, metadata: unknown }): Promise<void>;
}

export class NeonRunRepository implements ExtendedRunRepository {
  async create(run: Run): Promise<Run> {
    const dbRun = {
      id: run.id,
      url: run.request.url,
      goal: run.request.goal,
      autoDiscover: run.request.autoDiscover,
      status: run.status,
      createdAt: new Date(run.createdAt),
      updatedAt: new Date(run.updatedAt),
    };
    
    await db.insert(runs).values(dbRun);
    
    const eventId = crypto.randomUUID();
    await db.insert(runEvents).values({
      id: eventId,
      runId: run.id,
      sequence: 1,
      type: "run_created",
      message: "Test çalıştırması oluşturuldu.",
      metadata: {},
      createdAt: new Date(),
    });

    return run;
  }

  async getById(id: string): Promise<Run | null> {
    const records = await db.select().from(runs).where(eq(runs.id, id));
    if (!records.length) return null;
    
    const record = records[0];
    
    return {
      id: record.id,
      request: {
        url: record.url,
        goal: record.goal,
        autoDiscover: record.autoDiscover
      },
      status: record.status as RunStatus,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      result: record.result ? (record.result as RunResult) : undefined
    };
  }

  async update(id: string, updates: Partial<Run>): Promise<Run | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.status) updateData.status = updates.status;
    if (updates.result) updateData.result = updates.result;
    
    const returned = await db.update(runs)
      .set(updateData)
      .where(eq(runs.id, id))
      .returning();
      
    if (!returned.length) return null;
    return this.getById(id);
  }

  async listRecent(limit: number = 20): Promise<Run[]> {
    const safeLimit = Math.min(limit, 100);
    const records = await db.select()
      .from(runs)
      .orderBy(desc(runs.createdAt))
      .limit(safeLimit);
      
    return records.map(record => ({
      id: record.id,
      request: {
        url: record.url,
        goal: record.goal,
        autoDiscover: record.autoDiscover
      },
      status: record.status as RunStatus,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      result: record.result ? (record.result as RunResult) : undefined
    }));
  }

  async listEvents(runId: string): Promise<unknown[]> {
    return await db.select().from(runEvents).where(eq(runEvents.runId, runId)).orderBy(runEvents.sequence);
  }

  async appendEvent(runId: string, event: { type: string, message: string, metadata: unknown }): Promise<void> {
    const existing = await this.listEvents(runId);
    const seq = existing.length + 1;
    await db.insert(runEvents).values({
      id: crypto.randomUUID(),
      runId,
      sequence: seq,
      type: event.type,
      message: event.message,
      metadata: event.metadata,
      createdAt: new Date(),
    });
  }
}
