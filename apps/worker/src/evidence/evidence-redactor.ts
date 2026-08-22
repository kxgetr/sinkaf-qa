import { AuthRedactor } from "../auth/auth-redactor";

export class EvidenceRedactor {
  static redact(text: string): string {
    if (!text) return text;
    
    let redacted = AuthRedactor.redact(text);
    
    // Simple regex replacements for common secrets
    redacted = redacted.replace(/(authorization:\s*bearer\s+)([a-zA-Z0-9\-\._~+\/]+)/gi, "$1[REDACTED]");
    redacted = redacted.replace(/(password|secret|token|api_key|apikey)=([^&]+)/gi, "$1=[REDACTED]");
    
    return redacted;
  }
}
