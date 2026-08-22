import dns from "dns/promises";

export async function validateTargetUrl(urlInput: string, allowPrivate: boolean = false): Promise<string> {
  let url: URL;
  try {
    url = new URL(urlInput);
  } catch (err) {
    throw new Error("INVALID_TARGET_URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("INVALID_TARGET_URL");
  }

  if (allowPrivate) return url.toString();

  const hostname = url.hostname;
  
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "0.0.0.0") {
    throw new Error("BLOCKED_TARGET_URL");
  }

  if (hostname.includes("169.254")) {
    throw new Error("BLOCKED_TARGET_URL");
  }

  try {
    const records = await dns.lookup(hostname, { all: true });
    for (const record of records) {
      if (isPrivateIp(record.address)) {
        throw new Error("BLOCKED_TARGET_URL");
      }
    }
  } catch (err) {
    throw new Error("BLOCKED_TARGET_URL");
  }

  return url.toString();
}

export function isPrivateIp(ip: string): boolean {
  if (ip === "::1") return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("fd")) return true;
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}
