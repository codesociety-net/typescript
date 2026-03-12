// ── Structured Tool-Use Agent with JSON Schema Validation ─────────
import { z } from "zod";

// ── Tool Schema Types ─────────────────────────────────────────────
export const JsonSchemaProperty = z.object({
  type: z.enum(["string", "number", "boolean", "object", "array"]),
  description: z.string(),
  enum: z.array(z.string()).optional(),
});

export const ToolSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  description: z.string().min(10),
  parameters: z.object({
    type: z.literal("object"),
    properties: z.record(JsonSchemaProperty),
    required: z.array(z.string()),
  }),
});

export type ToolDefinition = z.infer<typeof ToolSchema>;

export interface ToolCall {
  id: string;
  toolName: string;
  params: Record<string, unknown>;
}

export interface ToolResult {
  callId: string;
  toolName: string;
  output: unknown;
  isError: boolean;
  durationMs: number;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
}

export type ToolHandler<P = Record<string, unknown>, R = unknown> =
  (params: P) => Promise<R>;

export class ToolUseAgent {
  private tools = new Map<string, { definition: ToolDefinition; handler: ToolHandler }>();
  private history: LLMMessage[] = [];

  constructor(private systemPrompt: string) {
    this.history.push({ role: "system", content: systemPrompt });
  }

  registerTool<P extends Record<string, unknown>, R>(
    definition: ToolDefinition,
    handler: ToolHandler<P, R>
  ): this {
    const parsed = ToolSchema.parse(definition);
    this.tools.set(parsed.name, { definition: parsed, handler: handler as ToolHandler });
    return this;
  }

  async run(userMessage: string, signal?: AbortSignal): Promise<string> {
    this.history.push({ role: "user", content: userMessage });

    for (let i = 0; i < 15; i++) {
      if (signal?.aborted) throw new Error("Agent aborted");

      const response = await this.callLLM(this.history, [...this.tools.values()].map(t => t.definition));

      if (!response.toolCall) {
        this.history.push({ role: "assistant", content: response.content });
        return response.content;
      }

      this.history.push({
        role: "assistant",
        content: `Using tool: ${response.toolCall.toolName}`,
        toolCallId: response.toolCall.id,
      });

      const result = await this.executeTool(response.toolCall);

      this.history.push({
        role: "tool",
        content: result.isError
          ? `Error: ${result.output}`
          : JSON.stringify(result.output),
        toolCallId: result.callId,
      });
    }

    throw new Error("Exceeded max tool-use iterations");
  }

  private async executeTool(call: ToolCall): Promise<ToolResult> {
    const entry = this.tools.get(call.toolName);
    const start = Date.now();

    if (!entry) {
      return {
        callId: call.id,
        toolName: call.toolName,
        output: `Tool "${call.toolName}" not registered`,
        isError: true,
        durationMs: 0,
      };
    }

    // Validate required parameters
    const { required } = entry.definition.parameters;
    for (const key of required) {
      if (!(key in call.params)) {
        return {
          callId: call.id,
          toolName: call.toolName,
          output: `Missing required parameter: "${key}"`,
          isError: true,
          durationMs: Date.now() - start,
        };
      }
    }

    try {
      const output = await entry.handler(call.params);
      return { callId: call.id, toolName: call.toolName, output, isError: false, durationMs: Date.now() - start };
    } catch (e) {
      return { callId: call.id, toolName: call.toolName, output: String(e), isError: true, durationMs: Date.now() - start };
    }
  }

  private async callLLM(
    _messages: LLMMessage[],
    _tools: ToolDefinition[]
  ): Promise<{ content: string; toolCall?: ToolCall }> {
    // Replace with actual LLM API call (Anthropic, OpenAI, etc.)
    return { content: "Mock LLM response" };
  }
}

