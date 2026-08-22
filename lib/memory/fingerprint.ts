import crypto from "crypto";

export function generateFingerprint(category: string, url: string, expected: string, actual: string) {
  try {
    const parsedUrl = new URL(url);
    const normalizedPath = parsedUrl.pathname;
    
    // Convert to lowercase, remove punctuation, stop words, multiple spaces
    const normalizeText = (text: string) => {
      return text.toLowerCase()
        .replace(/[^\w\s\d]|_/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const normCategory = category.toLowerCase();
    const normExpected = normalizeText(expected).split(" ").slice(0, 5).join(" ");
    const normActual = normalizeText(actual).split(" ").slice(0, 5).join(" ");

    const raw = `${normCategory}|${normalizedPath}|${normExpected}|${normActual}`;
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    
    return {
      fingerprint: hash,
      normalizedPath
    };
  } catch {
    // Fallback if URL parsing fails
    const raw = `${category}|${url}|${expected}|${actual}`;
    return {
      fingerprint: crypto.createHash("sha256").update(raw).digest("hex"),
      normalizedPath: url
    };
  }
}
