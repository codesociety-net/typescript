export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string }>;
}

export interface ToolResult {
  toolName: string;
  output: string;
  isError: boolean;
}

export interface AgentMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
}

export type ToolHandler = (params: Record<string, unknown>) => Promise<string>;

export class ToolRegistry {
  private tools = new Map<string, { definition: ToolDefinition; handler: ToolHandler }>();

  register(definition: ToolDefinition, handler: ToolHandler): void {
    this.tools.set(definition.name, { definition, handler });
  }

  getDefinitions(): ToolDefinition[] {
    return [...this.tools.values()].map(t => t.definition);
  }

  async execute(name: string, params: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) return { toolName: name, output: `Unknown tool: ${name}`, isError: true };

    try {
      const output = await tool.handler(params);
      return { toolName: name, output, isError: false };
    } catch (e) {
      return { toolName: name, output: String(e), isError: true };
    }
  }
}

export async function toolUseLoop(
  userMessage: string,
  registry: ToolRegistry,
  llm: (messages: AgentMessage[], tools: ToolDefinition[]) => Promise<{ content: string; toolCall?: { name: string; params: Record<string, unknown> } }>
): Promise<string> {
  const messages: AgentMessage[] = [{ role: "user", content: userMessage }];

  for (let i = 0; i < 10; i++) {
    const response = await llm(messages, registry.getDefinitions());
    messages.push({ role: "assistant", content: response.content });

    if (!response.toolCall) return response.content;

    const result = await registry.execute(response.toolCall.name, response.toolCall.params);
    messages.push({ role: "tool", content: result.output, toolName: result.toolName });
  }

  return "Max iterations reached";
}
