import { describe, it, expect } from "vitest";
import { ToolRegistry, toolUseLoop } from "./conceptual";
import type { ToolDefinition, ToolHandler } from "./conceptual";

describe("Tool Use Agent (Conceptual)", () => {
  it("ToolRegistry registers and retrieves tool definitions", () => {
    const registry = new ToolRegistry();
    registry.register(
      {
        name: "calc",
        description: "Calculator",
        parameters: { expression: { type: "string", description: "math expression" } },
      },
      async () => "42"
    );

    const defs = registry.getDefinitions();
    expect(defs).toHaveLength(1);
    expect(defs[0].name).toBe("calc");
  });

  it("ToolRegistry executes a registered tool", async () => {
    const registry = new ToolRegistry();
    registry.register(
      {
        name: "greet",
        description: "Greet someone",
        parameters: { name: { type: "string", description: "name" } },
      },
      async (params) => `Hello, ${params.name}!`
    );

    const result = await registry.execute("greet", { name: "Alice" });
    expect(result.isError).toBe(false);
    expect(result.toolName).toBe("greet");
    expect(result.output).toBe("Hello, Alice!");
  });

  it("ToolRegistry returns error for unknown tool", async () => {
    const registry = new ToolRegistry();
    const result = await registry.execute("nonexistent", {});
    expect(result.isError).toBe(true);
    expect(result.output).toContain("Unknown tool");
  });

  it("ToolRegistry catches handler errors", async () => {
    const registry = new ToolRegistry();
    registry.register(
      {
        name: "fail",
        description: "Always fails",
        parameters: {},
      },
      async () => {
        throw new Error("handler error");
      }
    );

    const result = await registry.execute("fail", {});
    expect(result.isError).toBe(true);
    expect(result.output).toContain("handler error");
  });

  it("toolUseLoop returns final answer when LLM has no tool call", async () => {
    const registry = new ToolRegistry();
    const llm = async () => ({ content: "The answer is 42" });

    const result = await toolUseLoop("What is 6*7?", registry, llm);
    expect(result).toBe("The answer is 42");
  });

  it("toolUseLoop executes tool and feeds result back to LLM", async () => {
    const registry = new ToolRegistry();
    registry.register(
      {
        name: "multiply",
        description: "Multiply two numbers",
        parameters: { a: { type: "number", description: "first" }, b: { type: "number", description: "second" } },
      },
      async (params) => String(Number(params.a) * Number(params.b))
    );

    let callCount = 0;
    const llm = async (messages: unknown[]) => {
      callCount++;
      if (callCount === 1) {
        return {
          content: "Let me calculate that",
          toolCall: { name: "multiply", params: { a: 6, b: 7 } },
        };
      }
      return { content: "The answer is 42" };
    };

    const result = await toolUseLoop("What is 6*7?", registry, llm as any);
    expect(result).toBe("The answer is 42");
    expect(callCount).toBe(2);
  });
});
