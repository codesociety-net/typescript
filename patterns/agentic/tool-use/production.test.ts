import { describe, it, expect } from "vitest";
import { JsonSchemaProperty, ToolSchema, ToolUseAgent } from "./production";
import type { ToolDefinition } from "./production";

describe("Tool Use Agent (Production)", () => {
  it("JsonSchemaProperty validates correct property", () => {
    const valid = { type: "string", description: "A name" };
    expect(() => JsonSchemaProperty.parse(valid)).not.toThrow();
  });

  it("JsonSchemaProperty rejects invalid type", () => {
    const invalid = { type: "uuid", description: "An id" };
    expect(() => JsonSchemaProperty.parse(invalid)).toThrow();
  });

  it("ToolSchema validates a correct tool definition", () => {
    const valid = {
      name: "search_web",
      description: "Search the web for information",
      parameters: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: "Search query" },
        },
        required: ["query"],
      },
    };
    expect(() => ToolSchema.parse(valid)).not.toThrow();
  });

  it("ToolSchema rejects invalid tool name format", () => {
    const invalid = {
      name: "Search-Web", // invalid: contains uppercase and hyphen
      description: "Search the web for information",
      parameters: {
        type: "object" as const,
        properties: {},
        required: [],
      },
    };
    expect(() => ToolSchema.parse(invalid)).toThrow();
  });

  it("ToolSchema rejects short description", () => {
    const invalid = {
      name: "search",
      description: "Short", // less than 10 chars
      parameters: {
        type: "object" as const,
        properties: {},
        required: [],
      },
    };
    expect(() => ToolSchema.parse(invalid)).toThrow();
  });

  it("ToolUseAgent can register tools with method chaining", () => {
    const agent = new ToolUseAgent("You are helpful");
    const toolDef: ToolDefinition = {
      name: "get_time",
      description: "Get the current time in UTC format",
      parameters: {
        type: "object",
        properties: {
          timezone: { type: "string", description: "Timezone" },
        },
        required: [],
      },
    };

    const result = agent.registerTool(toolDef, async () => "12:00 UTC");
    expect(result).toBe(agent); // chaining
  });

  it("ToolUseAgent.run returns mock response from default callLLM", async () => {
    const agent = new ToolUseAgent("You are helpful");
    const result = await agent.run("Hello");
    expect(result).toBe("Mock LLM response");
  });
});
