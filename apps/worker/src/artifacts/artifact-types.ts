export type ArtifactType =
  | "SCREENSHOT"
  | "TRACE"
  | "CONSOLE_LOG"
  | "NETWORK_LOG"
  | "PAGE_SNAPSHOT"
  | "RUN_REPORT";

export type StoredArtifact = {
  id: string;
  runId: string;
  bugId?: string;
  type: ArtifactType;
  storageProvider: string;
  storageKey: string;
  contentType: string;
  byteLength: number;
  sha256: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type PutArtifactInput = {
  runId: string;
  bugId?: string;
  type: ArtifactType;
  fileName: string;
  contentType: string;
  buffer: Buffer;
  metadata?: Record<string, unknown>;
};

export interface ArtifactStore {
  put(input: PutArtifactInput): Promise<StoredArtifact>;
  getMetadata(artifactId: string): Promise<StoredArtifact | null>;
  delete(artifactId: string): Promise<void>;
}
