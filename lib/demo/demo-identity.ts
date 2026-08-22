import crypto from "crypto";

export function generateIdentityHash(input: string, pepper: string): string {
  return crypto.createHmac("sha256", pepper).update(input).digest("hex");
}

export function resolveClientIp(req: Request): string {
  // Trust X-Forwarded-For if deployed behind a trusted proxy/load balancer
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  // Vercel specific header
  const vercelForwarded = req.headers.get("x-real-ip");
  if (vercelForwarded) return vercelForwarded.trim();
  
  return "0.0.0.0"; // Fallback
}
