import { describe, it, expect } from "vitest";
import { Orchestrator } from "./conceptual";
import type { SpecialistAgent, AgentMessage } from "./conceptual";

function makeAgent(id: string, caps: string[], handler?: (msg: AgentMessage) => Promise<AgentMessage>): SpecialistAgent {
  return {
    id,
    capabilities: caps,
    handle: handler ?? (async (msg) => ({
      id: crypto.randomUUID(),
      from: id,
      to: msg.from,
      type: "result" as const,
      payload: `handled by ${id}`,
    })),
  };
}

describe("Multi-Agent Orchestration (Conceptual)", () => {
  it("registers and finds agents by capability", () => {
    const orch = new Orchestrator();
    orch.register(makeAgent("writer", ["write"]));
    orch.register(makeAgent("coder", ["code", "debug"]));

    expect(orch.findAgent("write")?.id).toBe("writer");
    expect(orch.findAgent("code")?.id).toBe("coder");
    expect(orch.findAgent("debug")?.id).toBe("coder");
    expect(orch.findAgent("fly")).toBeUndefined();
  });

  it("dispatch sends task to the correct agent", async () => {
    const orch = new Orchestrator();
    orch.register(makeAgent("analyzer", ["analyze"]));

    const result = await orch.dispatch("analyze data", "analyze", { data: [1, 2, 3] });
    expect(result).toBe("handled by analyzer");
  });

  it("dispatch throws when no agent has the capability", async () => {
    const orch = new Orchestrator();
    await expect(
      orch.dispatch("task", "unknown-cap", {})
    ).rejects.toThrow("No agent for capability: unknown-cap");
  });

  it("dispatch throws when agent returns error type", async () => {
    const orch = new Orchestrator();
    const errorAgent: SpecialistAgent = {
      id: "error-agent",
      capabilities: ["fail"],
      handle: async (msg) => ({
        id: crypto.randomUUID(),
        from: "error-agent",
        to: msg.from,
        type: "error",
        payload: "something went wrong",
      }),
    };
    orch.register(errorAgent);

    await expect(
      orch.dispatch("task", "fail", {})
    ).rejects.toThrow("something went wrong");
  });

  it("runPipeline executes steps in order", async () => {
    const orch = new Orchestrator();
    const executionOrder: string[] = [];

    orch.register({
      id: "step-agent",
      capabilities: ["step1", "step2", "step3"],
      handle: async (msg) => {
        const payload = msg.payload as { task: string };
        executionOrder.push(payload.task);
        return {
          id: crypto.randomUUID(),
          from: "step-agent",
          to: msg.from,
          type: "result" as const,
          payload: `done:${payload.task}`,
        };
      },
    });

    const results = await orch.runPipeline([
      { capability: "step1", payload: "data1" },
      { capability: "step2", payload: "data2" },
      { capability: "step3", payload: "data3" },
    ]);

    expect(results).toHaveLength(3);
    expect(executionOrder).toEqual(["step1", "step2", "step3"]);
  });
});
