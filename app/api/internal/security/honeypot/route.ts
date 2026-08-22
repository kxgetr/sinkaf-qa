import { NextResponse } from "next/server";
import { resolveClientIp, generateIdentityHash } from "../../../../../lib/demo/demo-identity";
import { BanEnforcer } from "../../../../../lib/security/ban/ban-enforcer";
import { RiskEngine } from "../../../../../lib/security/attack/risk-engine";
import crypto from "crypto";

export async function GET(req: Request) {
  return handleHoneypot(req);
}
export async function POST(req: Request) {
  return handleHoneypot(req);
}
export async function PUT(req: Request) {
  return handleHoneypot(req);
}
export async function DELETE(req: Request) {
  return handleHoneypot(req);
}

async function handleHoneypot(req: Request) {
  const ip = resolveClientIp(req);
  const pepper = process.env.SECURITY_IDENTITY_PEPPER || process.env.DEMO_IDENTITY_PEPPER || "fallback_pepper";
  const ipHash = generateIdentityHash(ip, pepper);

  // 1. Check ban
  const banStatus = await BanEnforcer.checkBan(ipHash);
  if (banStatus.banned) {
    return new NextResponse("Sen hâlâ burada mısın amk? Kapı kapalı. 403 SECURITY_ACCESS_BLOCKED", { status: 403 });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  
  // Classify honeypot type
  let eventType = "HONEYPOT_HIT";
  let persona = "GENERIC";
  
  if (path.includes(".env")) {
    eventType = "SECRET_PROBE";
  } else if (path.includes(".git")) {
    eventType = "SOURCE_EXPOSURE_PROBE";
  } else if (path.includes("wp-admin") || path.includes("admin")) {
    eventType = "ADMIN_ENUMERATION";
    if (path.includes("wp-")) persona = "WORDPRESS_LIKE";
  } else if (path.includes("actuator") || path.includes("swagger")) {
    eventType = "API_ENUMERATION";
    persona = "JAVA_ENTERPRISE";
  }

  // Evaluate risk
  const { tarpitMs, banned } = await RiskEngine.evaluateAndRecord(ipHash, null, {
    requestId: crypto.randomUUID(),
    method: req.method,
    normalizedPath: path,
    eventType,
    persona,
    responseStatus: 200,
    confidence: 100,
    signals: [path]
  });

  if (banned) {
    return new NextResponse("Yeter aq. Bütün menüyü denedin. Bu IP'nin fişini çektim.", { status: 403 });
  }

  if (tarpitMs > 0) {
    await new Promise(resolve => setTimeout(resolve, tarpitMs));
  }

  // Deception Response
  if (persona === "WORDPRESS_LIKE") {
    return new NextResponse("<!-- wp-login.php fake -->\n<html><head><title>WordPress &rsaquo; Log In</title></head><body><form><input name='log'/><input name='pwd' type='password'/><input type='submit'/></form></body></html>", { status: 200, headers: { "X-Robots-Tag": "noindex, nofollow" } });
  }
  if (eventType === "SECRET_PROBE") {
    return new NextResponse("SINKAF_CANARY_SECRET=fake_abc123\nDB_PASS=SINKAF_CANARY_DB_999\n", { status: 200, headers: { "X-Robots-Tag": "noindex, nofollow" } });
  }
  
  return new NextResponse("{\"status\": \"ok\", \"version\": \"1.0.0\"}", { status: 200, headers: { "Content-Type": "application/json", "X-Robots-Tag": "noindex, nofollow" } });
}
