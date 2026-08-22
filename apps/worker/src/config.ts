import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || "8080", 10),
  QA_WORKER_API_KEY: process.env.QA_WORKER_API_KEY || "",
  WORKER_CALLBACK_SECRET: process.env.WORKER_CALLBACK_SECRET || "",
  APP_BASE_URL: process.env.APP_BASE_URL || "",
  ALLOW_PRIVATE_NETWORKS: process.env.ALLOW_PRIVATE_NETWORKS === "true",
  BROWSER_NAVIGATION_TIMEOUT_MS: parseInt(process.env.BROWSER_NAVIGATION_TIMEOUT_MS || "30000", 10),
  RUN_TIMEOUT_MS: parseInt(process.env.RUN_TIMEOUT_MS || "60000", 10),
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || "2", 10),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.7-flash",
  ARTIFACT_PROVIDER: process.env.ARTIFACT_PROVIDER || "local",
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || ""
};

if (!config.QA_WORKER_API_KEY) console.warn("WARN: QA_WORKER_API_KEY not set");
if (!config.WORKER_CALLBACK_SECRET) console.warn("WARN: WORKER_CALLBACK_SECRET not set");
if (!config.APP_BASE_URL) console.warn("WARN: APP_BASE_URL not set");
