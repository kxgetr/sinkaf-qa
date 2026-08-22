export type AuthOriginPolicy = {
  exactHostnames?: string[];
  allowedSuffixes?: string[];
  requireGithubRepository?: string;
};

export type AuthProfile = {
  id: string;
  name: string;
  hostname: string;
  loginUrl: string;
  method: "form" | "storage_state";

  usernameSecretRef?: string;
  passwordSecretRef?: string;
  storageStateSecretRef?: string;

  usernameFieldHints?: string[];
  passwordFieldHints?: string[];
  submitButtonHints?: string[];

  successUrlPattern?: string;
  successElementHint?: string;

  originPolicy?: AuthOriginPolicy;
  
  maxConcurrentSessions?: number;
  
  enabled: boolean;
};

export type AuthSession = {
  profileId: string;
  hostname: string;
  createdAt: string;
  lastVerifiedAt: string;
  expiresAt?: string;
  stateLocation: string; // ephemeral, or path
  status: "valid" | "expired" | "invalid";
};

export type AuthMetrics = {
  authRequired: boolean;
  sessionReused: boolean;
  authDurationMs: number;
  reauthenticationCount: number;
};
