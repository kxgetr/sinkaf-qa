export class AuthRedactor {
  private static secrets: Set<string> = new Set();

  static registerSecret(value: string) {
    if (value && value.length > 2) {
      this.secrets.add(value);
    }
  }

  static clearSecrets() {
    this.secrets.clear();
  }

  static redact(text: string): string {
    if (!text) return text;
    let redacted = text;
    for (const secret of this.secrets) {
      if (redacted.includes(secret)) {
        redacted = redacted.split(secret).join("[REDACTED_SECRET]");
      }
    }
    return redacted;
  }
}
