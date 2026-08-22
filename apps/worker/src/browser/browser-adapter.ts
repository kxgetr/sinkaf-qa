export interface BrowserOptions {
  storageState?: any;
}

export interface BrowserAdapter {
  open(options?: BrowserOptions): Promise<void>;
  navigate(url: string): Promise<void>;
  getTitle(): Promise<string>;
  getCurrentUrl(): Promise<string>;
  getTextSnapshot(): Promise<string>;
  getStructuralSnapshot(): Promise<any>;
  click(id: string): Promise<void>;
  fill(id: string, value: string): Promise<void>;
  screenshot(): Promise<Buffer>;
  startTracing(): Promise<void>;
  stopTracing(path: string): Promise<void>;
  getConsoleEvents(): any[];
  getNetworkEvents(): any[];
  close(): Promise<void>;
}
