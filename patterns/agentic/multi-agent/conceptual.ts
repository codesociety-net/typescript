export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: "task" | "result" | "error";
  payload: unknown;
}

export interface SpecialistAgent {
  id: string;
  capabilities: string[];
  handle(message: AgentMessage): Promise<AgentMessage>;
}

export class Orchestrator {
  private agents = new Map<string, SpecialistAgent>();

  register(agent: SpecialistAgent): void {
    this.agents.set(agent.id, agent);
  }

  findAgent(capability: string): SpecialistAgent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.capabilities.includes(capability)) return agent;
    }
  }

  async dispatch(
    task: string,
    capability: string,
    payload: unknown
  ): Promise<unknown> {
    const agent = this.findAgent(capability);
    if (!agent) throw new Error(`No agent for capability: ${capability}`);

    const message: AgentMessage = {
      id: crypto.randomUUID(),
      from: "orchestrator",
      to: agent.id,
      type: "task",
      payload: { task, data: payload },
    };

    const response = await agent.handle(message);
    if (response.type === "error") throw new Error(String(response.payload));
    return response.payload;
  }

  async runPipeline(
    steps: Array<{ capability: string; payload: unknown }>
  ): Promise<unknown[]> {
    const results: unknown[] = [];
    for (const step of steps) {
      const result = await this.dispatch(step.capability, step.capability, step.payload);
      results.push(result);
    }
    return results;
  }
}
