import { chromium, Browser, BrowserContext, Page, BrowserContextOptions } from "playwright";
import { BrowserAdapter, BrowserOptions } from "./browser-adapter";
import { config } from "../config";
import { ConsoleEvidence, NetworkEvidence } from "../evidence/evidence-types";
import { EvidenceRedactor } from "../evidence/evidence-redactor";

export class PlaywrightBrowserAdapter implements BrowserAdapter {
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;
  
  private consoleEvents: ConsoleEvidence[] = [];
  private networkEvents: NetworkEvidence[] = [];

  async open(options?: BrowserOptions): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    const contextOptions: BrowserContextOptions = {};
    if (options?.storageState) {
      contextOptions.storageState = options.storageState;
    }
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();
    this.page.setDefaultNavigationTimeout(config.BROWSER_NAVIGATION_TIMEOUT_MS);
    this.page.setDefaultTimeout(config.BROWSER_NAVIGATION_TIMEOUT_MS);
    
    this.page.on("console", msg => {
      this.consoleEvents.push({
        type: msg.type(),
        text: EvidenceRedactor.redact(msg.text()),
        timestamp: new Date().toISOString(),
        pageUrl: this.page?.url() || ""
      });
    });

    this.page.on("requestfailed", req => {
      this.networkEvents.push({
        method: req.method(),
        url: EvidenceRedactor.redact(req.url()),
        failureText: req.failure()?.errorText || "failed",
        resourceType: req.resourceType(),
        timestamp: new Date().toISOString()
      });
    });

    this.page.on("response", res => {
      if (res.status() >= 400) {
        this.networkEvents.push({
          method: res.request().method(),
          url: EvidenceRedactor.redact(res.url()),
          status: res.status(),
          resourceType: res.request().resourceType(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error("BROWSER_NOT_OPEN");
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async getTitle(): Promise<string> {
    if (!this.page) throw new Error("BROWSER_NOT_OPEN");
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    if (!this.page) throw new Error("BROWSER_NOT_OPEN");
    return this.page.url();
  }

  async getTextSnapshot(): Promise<string> {
    if (!this.page) throw new Error("BROWSER_NOT_OPEN");
    return this.page.evaluate(() => document.body.innerText);
  }

  async getStructuralSnapshot(): Promise<any> {
    if (!this.page) throw new Error("BROWSER_NOT_OPEN");
    return this.page.evaluate(() => {
      const elements: any[] = [];
      let idCounter = 0;
      
      const processElement = (el: Element) => {
        if (!el.tagName) return;
        const tag = el.tagName.toLowerCase();
        const isInteractive = ["button", "a", "input", "select", "textarea"].includes(tag);
        
        if (isInteractive) {
          const eId = "e" + (++idCounter);
          el.setAttribute("data-sinkaf-id", eId);
          elements.push({
            id: eId,
            tag,
            text: (el as HTMLElement).innerText?.slice(0, 100) || (el as HTMLInputElement).value || (el as HTMLInputElement).placeholder || "",
            role: el.getAttribute("role") || tag,
            name: el.getAttribute("name") || el.getAttribute("aria-label") || ""
          });
        }
        
        for (let i = 0; i < el.children.length; i++) {
          processElement(el.children[i]);
        }
      };
      
      processElement(document.body);
      
      return {
        url: window.location.href,
        title: document.title,
        elements
      };
    });
  }

  async click(id: string): Promise<void> {
    if (!this.page) throw new Error("BROWSER_NOT_OPEN");
    await this.page.click(`[data-sinkaf-id="${id}"]`);
  }

  async fill(id: string, value: string): Promise<void> {
    if (!this.page) throw new Error("BROWSER_NOT_OPEN");
    await this.page.fill(`[data-sinkaf-id="${id}"]`, value);
  }

  async screenshot(): Promise<Buffer> {
    if (!this.page) throw new Error("BROWSER_NOT_OPEN");
    return this.page.screenshot({ type: "png" });
  }

  async startTracing(): Promise<void> {
    if (this.context) {
      await this.context.tracing.start({ screenshots: true, snapshots: true });
    }
  }

  async stopTracing(path: string): Promise<void> {
    if (this.context) {
      await this.context.tracing.stop({ path });
    }
  }

  getConsoleEvents() { return this.consoleEvents; }
  getNetworkEvents() { return this.networkEvents; }
  async getStorageState(): Promise<any> {
    if (!this.context) throw new Error("BROWSER_NOT_OPEN");
    return this.context.storageState();
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close().catch(() => {});
    if (this.context) await this.context.close().catch(() => {});
    if (this.browser) await this.browser.close().catch(() => {});
  }
}
