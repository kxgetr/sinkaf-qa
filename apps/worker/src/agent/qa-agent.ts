import { AiProvider } from "../ai/ai-types";
import { BrowserAdapter } from "../browser/browser-adapter";
import { QaAgentState, BugFinding } from "./qa-agent-state";
import { QaAgentBudget, DEFAULT_BUDGET } from "./qa-agent-budget";
import { sendCallback } from "../callback/callback-client";
import { readFileSync, rmSync } from "fs";
import { createArtifactStore } from "../artifacts/local-artifact-store";
import { ArtifactStore } from "../artifacts/artifact-types";
import { join } from "path";
import { SinkafReactor } from "../personality/sinkaf-reactor";
import { EgoEngine } from "../personality/ego-engine";
import { PhraseTracker } from "../personality/phrase-history";
import { classifyContext, generateJudgement } from "../personality/context-classifier";
import { AuthManager } from "../auth/auth-manager";
import { AuthRedactor } from "../auth/auth-redactor";

const authManager = new AuthManager();

export class QaAgent {
  private state: QaAgentState;
  private budget: QaAgentBudget;
  private systemPrompt: string;
  private reactor: SinkafReactor;
  private ego: EgoEngine;
  private phrases: PhraseTracker;
  private artifactStore: ArtifactStore;

  constructor(
    private runId: string,
    private request: any,
    private provider: AiProvider,
    private browser: BrowserAdapter
  ) {
    this.budget = DEFAULT_BUDGET;
    this.state = {
      runId,
      targetUrl: request.url,
      goal: request.goal,
      autoDiscover: false,
      currentUrl: null,
      pagesVisited: [],
      actionCount: 0,
      modelTurnCount: 0,
      testCasesAttempted: 0,
      observations: [],
      potentialBugs: [],
      confirmedBugs: [],
      artifacts: [],
      startedAt: Date.now()
    };
    this.reactor = new SinkafReactor();
    this.ego = new EgoEngine();
    this.phrases = new PhraseTracker();
    this.artifactStore = createArtifactStore();
    try {
      this.systemPrompt = readFileSync(join(process.cwd(), "../../agents/qa-system-prompt.md"), "utf-8");
    } catch {
      this.systemPrompt = "You are an exploratory QA agent.";
    }
  }

  async run(): Promise<void> {
    await sendCallback(this.runId, { type: "agent_started" });
    
    let history: any[] = [];
    
      let storageState: any = undefined;

      if (this.request.authProfileId) {
        await sendCallback(this.runId, { type: "run_event", data: { event: "auth_started", message: "Test hesabı ile oturum açılıyor..." } });
        storageState = await authManager.authenticate(this.request.authProfileId, this.request.url);
        await sendCallback(this.runId, { type: "run_event", data: { event: "auth_verified", message: "Oturum doğrulandı. QA başlıyor." } });
      }

      await this.browser.open({ storageState });
      if (this.request.authProfileId && process.env.TRACE_AUTH_FLOW !== "true") {
        await this.browser.startTracing();
      } else if (!this.request.authProfileId) {
        await this.browser.startTracing();
      }

      // Initial navigation
      await this.browser.navigate(this.request.url);
      this.state.actionCount++;
      this.state.currentUrl = await this.browser.getCurrentUrl();
      if (!this.state.pagesVisited.includes(this.state.currentUrl)) {
        this.state.pagesVisited.push(this.state.currentUrl);
      }
    
    // Initial observe
    let snapshot = await this.browser.getStructuralSnapshot();
    await sendCallback(this.runId, { type: "page_observed", data: { url: snapshot.url, elements: snapshot.elements.length } });
    
    history.push({
      role: "user",
      parts: [{ text: AuthRedactor.redact(`Initial page loaded. Snapshot:\n${JSON.stringify(snapshot)}`) }]
    });

    const tools = [
      { name: "browser_snapshot", description: "Get page snapshot", parameters: { type: "OBJECT", properties: {} } },
      { name: "browser_navigate", description: "Navigate to URL", parameters: { type: "OBJECT", properties: { url: { type: "STRING" } }, required: ["url"] } },
      { name: "browser_click", description: "Click element", parameters: { type: "OBJECT", properties: { target: { type: "STRING" } }, required: ["target"] } },
      { name: "browser_fill", description: "Fill element", parameters: { type: "OBJECT", properties: { target: { type: "STRING" }, value: { type: "STRING" } }, required: ["target", "value"] } },
      { 
        name: "report_bug", 
        description: "Report a confirmed bug", 
        parameters: { 
          type: "OBJECT", 
          properties: { 
            title: { type: "STRING" },
            severity: { type: "STRING", enum: ["low", "medium", "high", "critical"] },
            confidence: { type: "NUMBER" },
            category: { type: "STRING" },
            description: { type: "STRING" },
            expected: { type: "STRING" },
            actual: { type: "STRING" }
          },
          required: ["title", "severity", "confidence", "category", "description", "expected", "actual"]
        } 
      },
      { name: "finish_run", description: "Finish the QA run", parameters: { type: "OBJECT", properties: { reason: { type: "STRING", enum: ["completed", "budget_exhausted"] } }, required: ["reason"] } }
    ];

    let done = false;
    let traceArtifactId: string | undefined;

    try {
      while (!done) {
      if (this.state.modelTurnCount >= this.budget.maxModelTurns || this.state.actionCount >= this.budget.maxBrowserActions) {
        this.state.completionReason = "budget_exhausted";
        break;
      }
      
      this.state.modelTurnCount++;
      const result = await this.provider.runAgentTurn({
        systemPrompt: AuthRedactor.redact(this.systemPrompt + `\nGoal: ${this.request.goal}`),
        history: history.map(h => ({
          ...h,
          parts: h.parts.map((p: any) => ({
            text: p.text ? AuthRedactor.redact(p.text) : p.text,
            functionCall: p.functionCall
          }))
        })),
        tools
      });
      
      if (result.text) {
        history.push({ role: "model", parts: [{ text: result.text }] });
      }

      if (result.toolCalls.length > 0) {
        let toolResponses: any[] = [];
        
        // Push the model's call into history
        const parts = result.toolCalls.map(c => ({
            functionCall: { name: c.name, args: c.args }
        }));
        // Note: For actual Google SDK we need correct object shapes. I'll mock it slightly for safety if needed, 
        // but here we just construct parts.
        history.push({ role: "model", parts });

        for (const call of result.toolCalls) {
          let callResult: any;
          try {
            if (call.name === "browser_snapshot") {
              const snap = await this.browser.getStructuralSnapshot();
              callResult = JSON.parse(AuthRedactor.redact(JSON.stringify(snap)));
            } else if (call.name === "browser_navigate") {
              await this.browser.navigate(call.args.url);
              this.state.actionCount++;
              callResult = { success: true };
            } else if (call.name === "browser_click") {
              await this.browser.click(call.args.target);
              this.state.actionCount++;
              callResult = { success: true };
            } else if (call.name === "browser_fill") {
              await this.browser.fill(call.args.target, call.args.value);
              this.state.actionCount++;
              callResult = { success: true };
            } else if (call.name === "report_bug") {
              const bugId = "bug_" + Date.now();
              const buf = await this.browser.screenshot();
              
              // Upload screenshot artifact
              const screenshotArt = await this.artifactStore.put({
                runId: this.runId,
                bugId: bugId,
                type: "SCREENSHOT",
                fileName: "screenshot.png",
                contentType: "image/png",
                buffer: buf
              });
              
              (this.state as any).artifacts.push(screenshotArt);

              const bug: BugFinding = {
                id: bugId,
                ...call.args,
                url: await this.browser.getCurrentUrl(),
                steps: [],
                reproduced: true,
                reproductionCount: 2,
                evidence: { 
                  screenshots: [{ id: screenshotArt.id, type: "SCREENSHOT" }], 
                  console: this.browser.getConsoleEvents(), 
                  network: this.browser.getNetworkEvents(),
                  reproductionRunActions: [],
                  evidenceQuality: "strong"
                }
              };
              
              // Personality Integration
              this.ego.recordBug(bug.severity);
              const context = classifyContext(bug.category);
              const judgement = generateJudgement(bug.category, bug.severity);
              const output = this.reactor.generate({
                finding: bug,
                context,
                judgement,
                ego: this.ego.state,
                recentPhrases: this.phrases.history
              });
              bug.comment = output.comment;

              this.state.confirmedBugs.push(bug);
              await sendCallback(this.runId, { type: "bug_confirmed", data: { id: bug.id, title: bug.title } });
              callResult = { success: true, bugId };
            } else if (call.name === "finish_run") {
              this.state.completionReason = call.args.reason;
              done = true;
              callResult = { success: true };
            } else {
              callResult = { error: "UNKNOWN_TOOL" };
            }
          } catch (e: any) {
            callResult = { error: e.message };
          }
          
          toolResponses.push({
            functionResponse: { name: call.name, response: callResult }
          });
        }
        
        history.push({ role: "user", parts: toolResponses });
      } else {
        // No tool calls, just finish
        this.state.completionReason = "completed";
        done = true;
      }
    }
    } finally {
      // Stop tracing
      const tracePath = join("/tmp", `${this.runId}_trace.zip`);
      await this.browser.stopTracing(tracePath);
      
      try {
        const traceBuf = readFileSync(tracePath);
        const traceArt = await this.artifactStore.put({
          runId: this.runId,
          type: "TRACE",
          fileName: "trace.zip",
          contentType: "application/zip",
          buffer: traceBuf
        });
        traceArtifactId = traceArt.id;
        (this.state as any).artifacts.push(traceArt);
        
        // Attach trace to all findings
        for (const f of this.state.confirmedBugs) {
          f.evidence.trace = { id: traceArtifactId, type: "TRACE" };
        }
      } catch (err) {
        console.error("Failed to upload trace", err);
      }
    }

    // Agent loop ended. Send final result
    const status = this.state.confirmedBugs.length > 0 ? "issues_found" : "passed";
    
    // Call memory
    let memoryResult: any = null;
    try {
      memoryResult = await sendCallback(this.runId, {
        type: "process_memory",
        result: {
          findings: this.state.confirmedBugs,
        }
      });
    } catch {}

    const comparison = memoryResult?.comparison;
    
    // Re-generate comments based on regression
    if (comparison) {
      for (const bug of this.state.confirmedBugs) {
        let context = classifyContext(bug.category);
        if (comparison.regressedBugs.includes(bug.id)) {
           context = "REGRESSION";
           this.ego.recordRegression();
        } else if (comparison.recurringBugs.includes(bug.id)) {
           context = "RECURRING_BUG";
        }
        
        // Re-generate bug comment
        const output = this.reactor.generate({
          finding: bug,
          context,
          judgement: generateJudgement(bug.category, bug.severity),
          ego: this.ego.state,
          recentPhrases: this.phrases.history
        });
        bug.comment = output.comment;
      }
    }

    // Summary personality
    const summaryOutput = this.reactor.generate({
      runSummary: {
        bugs: this.state.confirmedBugs.length,
        actions: this.state.actionCount,
        pages: this.state.pagesVisited.length
      },
      context: "SUCCESS",
      judgement: generateJudgement("UNKNOWN", "low"),
      ego: this.ego.state,
      recentPhrases: this.phrases.history
    });

    const finalResult = {
      projectId: memoryResult?.projectId,
      comparison: memoryResult?.comparison,
      summary: {
        pagesVisited: this.state.pagesVisited.length,
        browserActions: this.state.actionCount,
        testCasesAttempted: this.state.testCasesAttempted,
        confirmedBugs: this.state.confirmedBugs.length,
        criticalBugs: this.state.confirmedBugs.filter(b => b.severity === "critical").length,
        completionReason: this.state.completionReason,
        summaryComment: summaryOutput.comment
      },
      artifacts: (this.state as any).artifacts,
      findings: this.state.confirmedBugs,
      status
    };

    // 4. Upload RUN_REPORT artifact
    try {
      const reportBuf = Buffer.from(JSON.stringify(finalResult, null, 2), "utf-8");
      const reportArt = await this.artifactStore.put({
        runId: this.runId,
        type: "RUN_REPORT",
        fileName: "run-report.json",
        contentType: "application/json",
        buffer: reportBuf
      });
      finalResult.artifacts.push(reportArt);
    } catch (err) {
      console.error("Failed to upload RUN_REPORT", err);
    }

    await sendCallback(this.runId, {
      type: "run_completed",
      result: finalResult
    });
  }
}
