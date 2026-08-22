export type ConsoleEvidence = {
  type: string;
  text: string;
  timestamp: string;
  pageUrl: string;
};

export type NetworkEvidence = {
  method: string;
  url: string;
  status?: number;
  failureText?: string;
  resourceType?: string;
  timestamp: string;
};

export type BrowserActionEvidence = {
  sequence: number;
  action: "navigate" | "click" | "fill" | "press" | "reload" | "back" | "viewport";
  target?: string;
  urlBefore?: string;
  urlAfter?: string;
  success: boolean;
  durationMs: number;
  timestamp: string;
};

export type ArtifactReference = {
  id: string;
  type: string;
  url?: string;
};
