import { GoogleGenAI, Content } from "@google/genai";
import { AiProvider, AgentTurnInput, AgentTurnResult } from "./ai-types";
import { config } from "../config";

export class GeminiProvider implements AiProvider {
  private client: GoogleGenAI;
  
  constructor() {
    if (!config.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY_MISSING");
    this.client = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }

  async runAgentTurn(input: AgentTurnInput): Promise<AgentTurnResult> {
    const contents: Content[] = input.history.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));

    const response = await this.client.models.generateContent({
      model: config.GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: input.systemPrompt,
        tools: input.tools.length > 0 ? [{ functionDeclarations: input.tools }] : undefined,
        temperature: 0.1, // low temp for deterministic QA
      }
    });

    const text = response.text;
    const functionCalls = response.functionCalls || [];
    
    const toolCalls = functionCalls.map(call => ({
      name: call.name || "",
      args: call.args || {}
    }));

    return {
      text,
      toolCalls,
      usage: response.usageMetadata ? {
        inputTokens: response.usageMetadata.promptTokenCount || 0,
        outputTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0,
      } : undefined
    };
  }
}
