import { ArtifactStore, PutArtifactInput, StoredArtifact } from "../artifact-types";
import { put, head, del } from "@vercel/blob";
import crypto from "crypto";
import { config } from "../../config";

export class VercelBlobArtifactStore implements ArtifactStore {
  async put(input: PutArtifactInput): Promise<StoredArtifact> {
    const id = "art_" + crypto.randomUUID();
    const storageKey = `runs/${input.runId}/${input.type.toLowerCase()}/${id}_${input.fileName}`;

    const blob = await put(storageKey, input.buffer, {
      access: "public",
      contentType: input.contentType,
      token: config.BLOB_READ_WRITE_TOKEN
    });

    const sha256 = crypto.createHash("sha256").update(input.buffer).digest("hex");

    return {
      id,
      runId: input.runId,
      bugId: input.bugId,
      type: input.type,
      storageProvider: "vercel_blob",
      storageKey: blob.url,
      contentType: input.contentType,
      byteLength: input.buffer.length,
      sha256,
      createdAt: new Date().toISOString(),
      metadata: input.metadata || {}
    };
  }

  async getMetadata(artifactId: string): Promise<StoredArtifact | null> {
    // Vercel Blob doesn't store our Neon db metadata natively.
    return null;
  }

  async delete(storageKey: string): Promise<void> {
    await del(storageKey, { token: config.BLOB_READ_WRITE_TOKEN });
  }
}
