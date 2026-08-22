import { ArtifactStore, PutArtifactInput, StoredArtifact } from "./artifact-types";
import { join } from "path";
import { mkdir, writeFile, stat, rm } from "fs/promises";
import crypto from "crypto";
import { config } from "../config";
import { VercelBlobArtifactStore } from "./providers/vercel-blob-artifact-store";

export class LocalArtifactStore implements ArtifactStore {
  private baseDir = join(process.cwd(), "artifacts", "runs");

  async put(input: PutArtifactInput): Promise<StoredArtifact> {
    const runDir = join(this.baseDir, input.runId);
    let subDir = "logs";
    if (input.type === "SCREENSHOT") subDir = "screenshots";
    else if (input.type === "TRACE") subDir = "trace";

    const targetDir = join(runDir, subDir);
    await mkdir(targetDir, { recursive: true });

    const id = "art_" + crypto.randomUUID();
    const storageKey = join(targetDir, `${id}_${input.fileName}`);
    
    await writeFile(storageKey, input.buffer);
    const stats = await stat(storageKey);
    const sha256 = crypto.createHash("sha256").update(input.buffer).digest("hex");

    return {
      id,
      runId: input.runId,
      bugId: input.bugId,
      type: input.type,
      storageProvider: "local",
      storageKey,
      contentType: input.contentType,
      byteLength: stats.size,
      sha256,
      createdAt: new Date().toISOString(),
      metadata: input.metadata || {}
    };
  }

  async getMetadata(artifactId: string): Promise<StoredArtifact | null> {
    // In local dev, we might not track DB metadata via this provider directly
    return null;
  }

  async delete(artifactId: string): Promise<void> {
    // Not implemented fully for local mock
  }
}

export function createArtifactStore(): ArtifactStore {
  if (config.ARTIFACT_PROVIDER === "vercel_blob") {
    return new VercelBlobArtifactStore();
  }
  return new LocalArtifactStore();
}
