import { z } from "zod";

// ── Types ────────────────────────────────────────────────────────
export const ToolResultSchema = z.object({
  success: z.boolean(),
  data: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type ToolResult = z.infer<typeof ToolResultSchema>;

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, string>;
  execute(input: Record<string, string>): Promise<ToolResult>;
}

export interface AgentStep {
  thought: string;
  action: string;
  actionInput: Record<string, string>;
  observation: ToolResult;
  timestamp: number;
}

export interface AgentConfig {
  maxSteps: number;
  model: string;
  temperature: number;
  tools: Tool[];
  systemPrompt: string;
}

export interface AgentResult {
  answer: string;
  steps: AgentStep[];
  totalTokens: number;
  durationMs: number;
}

// ── ReAct Agent ──────────────────────────────────────────────────
export class ReActAgent {
  private steps: AgentStep[] = [];

  constructor(private config: AgentConfig) {}

  async run(
    query: string,
    signal?: AbortSignal
  ): Promise<AgentResult> {
    const startTime = Date.now();
    this.steps = [];
    let totalTokens = 0;

    for (let i = 0; i < this.config.maxSteps; i++) {
      if (signal?.aborted) {
        throw new Error("Agent execution aborted");
      }

      // Build messages with full history
      const messages = this.buildMessages(query);

      // Get LLM response
      const response = await this.callLLM(messages);
      totalTokens += response.tokens;

      // Check for final answer
      if (response.isFinalAnswer) {
        return {
          answer: response.finalAnswer,
          steps: this.steps,
          totalTokens,
          durationMs: Date.now() - startTime,
        };
      }

      // Execute tool
      const tool = this.config.tools.find(
        (t) => t.name === response.action
      );

      if (!tool) {
        throw new Error(
          `Tool "${response.action}" not found. Available: ${
            this.config.tools.map((t) => t.name).join(", ")
          }`
        );
      }

      const observation = await tool.execute(response.actionInput);

      this.steps.push({
        thought: response.thought,
        action: response.action,
        actionInput: response.actionInput,
        observation,
        timestamp: Date.now(),
      });
    }

    return {
      answer: "Reached maximum steps without a final answer.",
      steps: this.steps,
      totalTokens,
      durationMs: Date.now() - startTime,
    };
  }

  private buildMessages(query: string) {
    return {
      system: this.config.systemPrompt,
      query,
      history: this.steps,
    };
  }

  private async callLLM(_messages: unknown) {
    // Replace with actual LLM API call
    return {
      thought: "",
      action: "",
      actionInput: {} as Record<string, string>,
      isFinalAnswer: true,
      finalAnswer: "Mock response",
      tokens: 150,
    };
  }
}

