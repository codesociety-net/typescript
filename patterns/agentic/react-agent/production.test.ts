import { describe, it, expect } from "vitest";
import { ToolResultSchema, ReActAgent } from "./production";
import type { Tool, AgentConfig } from "./production";

describe("ReAct Agent (Production)", () => {
  it("ToolResultSchema validates correct data", () => {
    const valid = { success: true, data: "hello" };
    expect(() => ToolResultSchema.parse(valid)).not.toThrow();
  });

  it("ToolResultSchema validates with optional metadata", () => {
    const valid = { success: false, data: "error", metadata: { code: 404 } };
    const parsed = ToolResultSchema.parse(valid);
    expect(parsed.metadata).toEqual({ code: 404 });
  });

  it("ToolResultSchema rejects invalid data", () => {
    expect(() => ToolResultSchema.parse({ success: "yes" })).toThrow();
    expect(() => ToolResultSchema.parse({})).toThrow();
  });

  it("ReActAgent.run returns a result with the default mock LLM", async () => {
    const tools: Tool[] = [
      {
        name: "search",
        description: "Search the web",
        parameters: { query: "search query" },
        execute: async () => ({
          success: true,
          data: "search result",
        }),
      },
    ];

    const config: AgentConfig = {
      maxSteps: 5,
      model: "test-model",
      temperature: 0,
      tools,
      systemPrompt: "You are a helpful assistant.",
    };

    const agent = new ReActAgent(config);
    const result = await agent.run("What is TypeScript?");

    // The built-in mock callLLM returns isFinalAnswer: true with "Mock response"
    expect(result.answer).toBe("Mock response");
    expect(result.steps).toEqual([]);
    expect(result.totalTokens).toBe(150);
    expect(typeof result.durationMs).toBe("number");
  });

  it("ReActAgent returns max steps message when limit is reached", async () => {
    // Subclass to override callLLM to never return final answer
    class TestAgent extends ReActAgent {
      constructor() {
        super({
          maxSteps: 2,
          model: "test",
          temperature: 0,
          tools: [
            {
              name: "echo",
              description: "Echo input",
              parameters: { input: "text" },
              execute: async () => ({ success: true, data: "echoed" }),
            },
          ],
          systemPrompt: "test",
        });
      }

      // Override private method via any cast
      private async callLLM(_messages: unknown) {
        return {
          thought: "thinking",
          action: "echo",
          actionInput: { input: "hello" },
          isFinalAnswer: false,
          finalAnswer: "",
          tokens: 50,
        };
      }
    }

    const agent = new TestAgent();
    const result = await agent.run("test query");
    expect(result.answer).toContain("maximum steps");
  });

  it("ReActAgent respects the agent config", () => {
    const config: AgentConfig = {
      maxSteps: 10,
      model: "gpt-4",
      temperature: 0.7,
      tools: [],
      systemPrompt: "Be helpful",
    };
    const agent = new ReActAgent(config);
    expect(agent).toBeDefined();
  });
});
