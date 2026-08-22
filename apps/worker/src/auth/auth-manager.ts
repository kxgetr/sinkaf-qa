import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AuthProfile } from "./auth-profile";
import { AuthError, AuthErrorCodes } from "./auth-errors";
import { EnvSecretProvider } from "./secrets/env-secret-provider";
import { FormAuthProvider } from "./providers/form-auth-provider";

export class AuthManager {
  private profiles: Map<string, AuthProfile> = new Map();
  private sessionCache: Map<string, any> = new Map(); // simple in-memory ephemeral cache

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const configPath = path.join(process.cwd(), "sinkaf.auth.json");
      if (fs.existsSync(configPath)) {
        const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (data.profiles && Array.isArray(data.profiles)) {
          for (const p of data.profiles) {
            this.profiles.set(p.id, p);
          }
        }
      } else {
        // load example if available for test purposes
        const examplePath = path.join(process.cwd(), "sinkaf.auth.example.json");
        if (fs.existsSync(examplePath)) {
          const data = JSON.parse(fs.readFileSync(examplePath, "utf-8"));
          if (data.profiles && Array.isArray(data.profiles)) {
            for (const p of data.profiles) {
              this.profiles.set(p.id, p);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load auth config", e);
    }
  }

  getProfile(id: string): AuthProfile | undefined {
    return this.profiles.get(id);
  }

  async authenticate(profileId: string, targetUrl: string): Promise<any> {
    const profile = this.getProfile(profileId);
    if (!profile) {
      throw new AuthError(AuthErrorCodes.PROFILE_NOT_FOUND, `Auth profile ${profileId} not found`);
    }

    if (!profile.enabled) {
      throw new AuthError(AuthErrorCodes.PROFILE_DISABLED, `Auth profile ${profileId} is disabled`);
    }

    const targetUrlObj = new URL(targetUrl);
    const hostname = targetUrlObj.hostname;

    let originAllowed = false;
    if (profile.hostname === hostname) originAllowed = true;
    if (profile.originPolicy?.exactHostnames?.includes(hostname)) originAllowed = true;
    if (profile.originPolicy?.allowedSuffixes?.some(s => hostname.endsWith(s))) originAllowed = true;
    
    // Default fallback: allow if profile hostname is a suffix of target
    if (hostname.endsWith(profile.hostname)) originAllowed = true;

    if (!originAllowed) {
      throw new AuthError(AuthErrorCodes.HOST_MISMATCH, `Target ${hostname} does not match profile ${profile.hostname}`);
    }

    const cacheKey = `${profile.id}:${hostname}`;
    if (this.sessionCache.has(cacheKey)) {
      return this.sessionCache.get(cacheKey);
    }

    // Authenticate
    let storageState = null;
    if (profile.method === "form") {
      const provider = new FormAuthProvider(new EnvSecretProvider());
      storageState = await provider.authenticate(profile);
    } else {
      throw new AuthError(AuthErrorCodes.EXTERNAL_PROVIDER_REQUIRED, "Unsupported auth method");
    }

    const persistenceMode = process.env.AUTH_SESSION_PERSISTENCE || "ephemeral";
    if (persistenceMode === "encrypted") {
      if (!process.env.AUTH_STATE_ENCRYPTION_KEY) {
        throw new AuthError(AuthErrorCodes.ENCRYPTION_KEY_MISSING, "AUTH_STATE_ENCRYPTION_KEY required for encrypted persistence");
      }
      // Mock encryption save logic - keeping it in memory for demo
      this.sessionCache.set(cacheKey, storageState);
    } else {
      // Ephemeral
      this.sessionCache.set(cacheKey, storageState);
    }

    return storageState;
  }
}
