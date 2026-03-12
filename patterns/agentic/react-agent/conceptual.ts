export interface Tool {
  name: string;
  description: string;
  execute(input: string): Promise<string>;
}

export interface AgentStep {
  thought: string;
  action: string;
  actionInput: string;
  observation: string;
}

export const MAX_STEPS = 10;

export async function reactLoop(
  query: string,
  tools: Tool[],
  llm: (prompt: string) => Promise<string>
): Promise<string> {
  const steps: AgentStep[] = [];

  for (let i = 0; i < MAX_STEPS; i++) {
    // Reason about what to do next
    const prompt = buildPrompt(query, tools, steps);
    const response = await llm(prompt);

    // Parse thought and action from response
    const { thought, action, actionInput, isFinal, finalAnswer } =
      parseResponse(response);

    if (isFinal) return finalAnswer;

    // Execute the chosen tool
    const tool = tools.find((t) => t.name === action);
    if (!tool) throw new Error(`Unknown tool: ${action}`);

    const observation = await tool.execute(actionInput);

    steps.push({ thought, action, actionInput, observation });
  }

  return "Max steps reached without final answer.";
}

export function buildPrompt(
  query: string,
  tools: Tool[],
  steps: AgentStep[]
): string {
  // Build prompt with tools, history, and instructions
  return `Query: ${query}\nTools: ${tools.map(t => t.name).join(", ")}`;
}

export function parseResponse(response: string) {
  // Parse LLM output into structured action
  return {
    thought: "",
    action: "",
    actionInput: "",
    isFinal: false,
    finalAnswer: "",
  };
}
