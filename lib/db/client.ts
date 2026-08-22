import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. DATABASE_PROVISIONING_REQUIRED.");
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
};

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof getDb>];
  }
});
