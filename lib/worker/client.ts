import { RunRequest } from "../domain";

export interface StartQaRunInput {
  runId: string;
  request: RunRequest;
}

export interface StartQaRunResult {
  success: boolean;
  message?: string;
}

export interface WorkerEvent {
  runId: string;
  type: string;
  data: unknown;
}

export interface WorkerResult {
  runId: string;
  success: boolean;
  findings: unknown[];
}

export interface QaWorkerClient {
  startRun(input: StartQaRunInput): Promise<StartQaRunResult>;
}

export class DisabledQaWorkerClient implements QaWorkerClient {
  async startRun(): Promise<StartQaRunResult> {
    throw new Error("WORKER_NOT_CONFIGURED");
  }
}

export class RemoteQaWorkerClient implements QaWorkerClient {
  async startRun(input: StartQaRunInput): Promise<StartQaRunResult> {
    if (!process.env.QA_WORKER_URL || !process.env.QA_WORKER_API_KEY) {
      throw new Error("WORKER_NOT_CONFIGURED");
    }

    const callbackUrl = `${process.env.APP_BASE_URL || ""}/api/internal/worker/runs/${input.runId}`;

    const res = await fetch(`${process.env.QA_WORKER_URL}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.QA_WORKER_API_KEY}`
      },
      body: JSON.stringify({
        runId: input.runId,
        url: input.request.url,
        goal: input.request.goal || "browser smoke test",
        callbackUrl
      })
    });

    if (!res.ok) {
      throw new Error(`Worker rejected run: ${res.statusText}`);
    }

    return { success: true };
  }
}

export const workerClient = (process.env.QA_WORKER_URL && process.env.QA_WORKER_API_KEY)
  ? new RemoteQaWorkerClient()
  : new DisabledQaWorkerClient();


