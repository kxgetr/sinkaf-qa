import { AiProvider } from "./ai-types";
import { GeminiProvider } from "./gemini-provider";

export function createProvider(): AiProvider {
  // Can be extended later based on config
  return new GeminiProvider();
}
