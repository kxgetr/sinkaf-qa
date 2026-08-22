import "dotenv/config";
import { execSync } from "child_process";

console.log("\nSINKAF QA DOCTOR\n");

let errors = 0;

function check(name: string, condition: boolean, optional = false) {
  if (condition) {
    console.log(`✓ ${name}`);
  } else {
    if (optional) {
      console.log(`- ${name} (Optional)`);
    } else {
      console.log(`✗ ${name} eksik`);
      errors++;
    }
  }
}

// Node version
try {
  const version = execSync("node -v").toString().trim();
  console.log(`✓ Node.js (${version})`);
} catch {
  check("Node.js", false);
}

// Database
check("DATABASE_URL", !!process.env.DATABASE_URL);

// Worker
check("QA_WORKER_URL", !!process.env.QA_WORKER_URL);
check("QA_WORKER_API_KEY", !!process.env.QA_WORKER_API_KEY);

// AI Provider
const provider = process.env.AI_PROVIDER || "gemini";
if (provider === "gemini") {
  check("GEMINI_API_KEY configuration", !!process.env.GEMINI_API_KEY);
}

// Artifact Storage
const artifactProvider = process.env.ARTIFACT_PROVIDER || "local";
if (artifactProvider === "vercel_blob") {
  check("BLOB_READ_WRITE_TOKEN", !!process.env.BLOB_READ_WRITE_TOKEN);
} else {
  console.log(`✓ Artifact storage (local)`);
}

// Public Demo
const demoEnabled = process.env.PUBLIC_DEMO_ENABLED === "true";
if (demoEnabled) {
  check("DEMO_IDENTITY_PEPPER", !!process.env.DEMO_IDENTITY_PEPPER);
  console.log(`✓ Public demo enabled`);
} else {
  console.log(`✓ Public demo disabled`);
}

// GitHub Integration
const githubEnabled = !!process.env.SINKAF_TRIGGER_TOKEN;
if (githubEnabled) {
  console.log(`✓ GitHub integration enabled`);
} else {
  console.log(`- GitHub integration optional`);
}

// Auth
const authEncrypted = process.env.AUTH_SESSION_PERSISTENCE === "encrypted";
if (authEncrypted) {
  check("AUTH_STATE_ENCRYPTION_KEY", !!process.env.AUTH_STATE_ENCRYPTION_KEY);
}

console.log("");
if (errors === 0) {
  console.log("Hazır aq.");
  process.exit(0);
} else {
  console.log(`${errors} problem var, çözmeden çalışma amk.`);
  process.exit(1);
}
