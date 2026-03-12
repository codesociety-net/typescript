import { describe, it, expect } from "vitest";
import {
  InMemorySharedState,
  BaseAgent,
  MultiAgentOrchestrator,
} from "./production";
import type { AgentCapability, SharedState, AgentMessage } from "./production";

class TestAgent extends BaseAgent {
  async processTask(payload: unknown, correlationId: string): Promise<unknown> {
    return { echo: payload, correlationId };
  }
}

class FailingAgent extends BaseAgent {
  async processTask(): Promise<unknown> {
    throw new Error("agent failure");
  }
}

describe("Multi-Agent Orchestration (Production)", () => {
  it("InMemorySharedState get/set/delete", () => {
    const state = new InMemorySharedState();
    expect(state.get("key")).toBeUndefined();

    state.set("key", "value");
    expect(state.get<string>("key")).toBe("value");

    state.delete("key");
    expect(state.get("key")).toBeUndefined();
  });

  it("BaseAgent receives a task and returns a result", async () => {
    const state = new InMemorySharedState();
    const agent = new TestAgent("agent-1", [{ name: "echo", description: "Echo", inputSchema: {} }], state);

    const message: AgentMessage = {
      id: "msg-1",
      from: "orchestrator",
      to: "agent-1",
      type: "task",
      payload: "hello",
      timestamp: Date.now(),
    };

    const response = await agent.receive(message);
    expect(response).not.toBeNull();
    expect(response!.type).toBe("result");
    expect(response!.payload).toEqual({ echo: "hello", correlationId: "msg-1" });
    expect(response!.from).toBe("agent-1");
    expect(response!.correlationId).toBe("msg-1");
  });

  it("BaseAgent responds to heartbeat messages", async () => {
    const state = new InMemorySharedState();
    const agent = new TestAgent("agent-2", [], state);

    const hb: AgentMessage = {
      id: "hb-1",
      from: "orchestrator",
      to: "agent-2",
      type: "heartbeat",
      payload: null,
      timestamp: Date.now(),
    };

    const response = await agent.receive(hb);
    expect(response!.type).toBe("heartbeat");
    expect(agent.getStatus()).toBe("idle");
  });

  it("BaseAgent rejects expired messages", async () => {
    const state = new InMemorySharedState();
    const agent = new TestAgent("agent-3", [], state);

    const expired: AgentMessage = {
      id: "exp-1",
      from: "orchestrator",
      to: "agent-3",
      type: "task",
      payload: "old",
      timestamp: Date.now() - 10000,
      ttlMs: 1000,
    };

    const response = await agent.receive(expired);
    expect(response!.type).toBe("error");
    expect((response!.payload as { message: string }).message).toContain("expired");
  });

  it("MultiAgentOrchestrator registers and sends to agents", async () => {
    const state = new InMemorySharedState();
    const orch = new MultiAgentOrchestrator(state);
    const agent = new TestAgent(
      "worker",
      [{ name: "process", description: "Process data", inputSchema: {} }],
      state
    );

    orch.register(agent);
    const result = await orch.send("worker", { data: 42 });
    expect(result).toEqual({ echo: { data: 42 }, correlationId: expect.any(String) });
  });

  it("MultiAgentOrchestrator throws on unknown agent", async () => {
    const orch = new MultiAgentOrchestrator();
    await expect(orch.send("ghost", "payload")).rejects.toThrow(
      'Agent "ghost" not registered'
    );
  });

  it("MultiAgentOrchestrator.findByCapability returns correct agent", () => {
    const state = new InMemorySharedState();
    const orch = new MultiAgentOrchestrator(state);
    const caps: AgentCapability[] = [{ name: "translate", description: "Translate text", inputSchema: {} }];
    const agent = new TestAgent("translator", caps, state);
    orch.register(agent);

    expect(orch.findByCapability("translate")?.id).toBe("translator");
    expect(orch.findByCapability("fly")).toBeUndefined();
  });

  it("MultiAgentOrchestrator.healthCheck returns all agent statuses", async () => {
    const state = new InMemorySharedState();
    const orch = new MultiAgentOrchestrator(state);
    orch.register(new TestAgent("a", [], state));
    orch.register(new TestAgent("b", [], state));

    const health = await orch.healthCheck();
    expect(health.a).toBe("idle");
    expect(health.b).toBe("idle");
  });

  it("MultiAgentOrchestrator.broadcast sends to all agents", async () => {
    const state = new InMemorySharedState();
    const orch = new MultiAgentOrchestrator(state);
    orch.register(new TestAgent("a", [], state));
    orch.register(new TestAgent("b", [], state));

    const results = await orch.broadcast("ping");
    expect(results.size).toBe(2);
  });

  it("agent error sets status to error", async () => {
    const state = new InMemorySharedState();
    const agent = new FailingAgent("fail-agent", [], state);

    const msg: AgentMessage = {
      id: "m1",
      from: "orch",
      to: "fail-agent",
      type: "task",
      payload: "trigger",
      timestamp: Date.now(),
    };

    const response = await agent.receive(msg);
    expect(response!.type).toBe("error");
    expect(agent.getStatus()).toBe("error");
  });
});
