import { Run } from "../domain";
import { NeonRunRepository } from "../db/repository/neon-run-repository";

export interface RunRepository {
  create(run: Run): Promise<Run>;
  getById(id: string): Promise<Run | null>;
  update(id: string, run: Partial<Run>): Promise<Run | null>;
  listRecent?(limit?: number): Promise<Run[]>;
  listEvents?(runId: string): Promise<unknown[]>;
  appendEvent?(runId: string, event: { type: string, message: string, metadata: unknown }): Promise<void>;
}

// Phase 02: Neon is the production backend
export const runRepository = new NeonRunRepository();
