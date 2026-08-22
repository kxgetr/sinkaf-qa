export interface AgentTurnInput {
  systemPrompt: string;
  history: Array<{ role: "user" | "model"; parts: any[] }>;
  tools: any[];
}

export interface AgentTurnResult {
  text?: string;
  toolCalls: Array<{ name: string; args: any }>;
  finishReason?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface AiProvider {
  runAgentTurn(input: AgentTurnInput): Promise<AgentTurnResult>;
}
