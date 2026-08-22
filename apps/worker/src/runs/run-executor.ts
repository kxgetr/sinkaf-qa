import { PlaywrightBrowserAdapter } from "../browser/playwright-browser-adapter";
import { validateTargetUrl } from "../security/url-policy";
import { sendCallback } from "../callback/callback-client";
import { config } from "../config";
import { QaAgent } from "../agent/qa-agent";
import { createProvider } from "../ai/provider-factory";
import { SinkafReactor } from "../personality/sinkaf-reactor";
import { EgoEngine } from "../personality/ego-engine";
import { PhraseTracker } from "../personality/phrase-history";
import { generateJudgement } from "../personality/context-classifier";

import { AuthManager } from "../auth/auth-manager";

export async function executeRun(request: any) {
  const { runId, url, goal, authProfileId } = request;
  const adapter = new PlaywrightBrowserAdapter();
  
  try {
    const safeUrl = await validateTargetUrl(url, config.ALLOW_PRIVATE_NETWORKS);
    
    await sendCallback(runId, { type: "worker_started" });
    
    await adapter.open();
    await sendCallback(runId, { type: "browser_started" });
    
    const provider = createProvider();
    const agent = new QaAgent(runId, request, provider, adapter);
    
    const runPromise = agent.run();

    const timeoutPromise = new Promise<void>((_, reject) => 
      setTimeout(() => reject(new Error("BROWSER_RUN_TIMEOUT")), config.RUN_TIMEOUT_MS)
    );

    await Promise.race([runPromise, timeoutPromise]);

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Run ${runId} failed:`, errorMsg);
    const errorCode = getErrorCode(errorMsg);
    
    // Personality on infra error
    const reactor = new SinkafReactor();
    const ego = new EgoEngine();
    ego.recordInfraFailure();
    const output = reactor.generate({
      infraError: errorCode,
      context: "INFRA_FAILURE",
      judgement: generateJudgement("UNKNOWN", "low"),
      ego: ego.state,
      recentPhrases: new PhraseTracker().history
    });

    await sendCallback(runId, {
      type: "infra_error",
      error: {
        errorCode,
        errorMessage: errorMsg,
        comment: output.comment
      }
    });
  } finally {
    await adapter.close();
  }
}

function getErrorCode(msg: string) {
  if (msg.includes("BROWSER_RUN_TIMEOUT")) return "BROWSER_RUN_TIMEOUT";
  if (msg.includes("BLOCKED")) return "BLOCKED_TARGET_URL";
  if (msg.includes("INVALID")) return "INVALID_TARGET_URL";
  if (msg.includes("GEMINI_API_KEY_MISSING")) return "GEMINI_API_KEY_MISSING";
  return "INTERNAL_WORKER_ERROR";
}
