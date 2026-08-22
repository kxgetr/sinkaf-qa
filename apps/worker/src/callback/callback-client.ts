import { config } from "../config";

export async function sendCallback(runId: string, payload: unknown): Promise<any> {
  const url = `${config.APP_BASE_URL}/api/internal/worker/runs/${runId}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.WORKER_CALLBACK_SECRET}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      console.error(`CALLBACK_FAILED for ${runId}: ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`CALLBACK_FAILED for ${runId}`, error);
    return null;
  }
}
