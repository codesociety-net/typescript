// ── Multi-Agent System with Message Passing, Shared State, Coordination ──

export type MessageType = "task" | "result" | "error" | "broadcast" | "heartbeat";
export type AgentStatus = "idle" | "busy" | "error" | "offline";

export interface AgentMessage<T = unknown> {
  id: string;
  correlationId?: string;
  from: string;
  to: string | "broadcast";
  type: MessageType;
  payload: T;
  timestamp: number;
  ttlMs?: number;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: Record<string, string>;
}

export interface SharedState {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
}

export class InMemorySharedState implements SharedState {
  private store = new Map<string, unknown>();
  get<T>(key: string): T | undefined { return this.store.get(key) as T; }
  set<T>(key: string, value: T): void { this.store.set(key, value); }
  delete(key: string): void { this.store.delete(key); }
}

export abstract class BaseAgent {
  protected status: AgentStatus = "idle";
  protected messageLog: AgentMessage[] = [];

  constructor(
    public readonly id: string,
    public readonly capabilities: AgentCapability[],
    protected sharedState: SharedState
  ) {}

  abstract processTask(payload: unknown, correlationId: string): Promise<unknown>;

  async receive(message: AgentMessage): Promise<AgentMessage | null> {
    if (message.ttlMs && Date.now() - message.timestamp > message.ttlMs) {
      return this.errorResponse(message, "Message expired");
    }

    this.messageLog.push(message);
    this.status = "busy";

    try {
      if (message.type === "heartbeat") {
        this.status = "idle";
        return this.reply(message, "heartbeat", { status: this.status });
      }

      if (message.type === "task") {
        const result = await this.processTask(message.payload, message.id);
        this.status = "idle";
        return this.reply(message, "result", result);
      }

      return null;
    } catch (e) {
      this.status = "error";
      return this.errorResponse(message, e instanceof Error ? e.message : String(e));
    }
  }

  protected reply<T>(original: AgentMessage, type: MessageType, payload: T): AgentMessage<T> {
    return {
      id: crypto.randomUUID(),
      correlationId: original.id,
      from: this.id,
      to: original.from,
      type,
      payload,
      timestamp: Date.now(),
    };
  }

  private errorResponse(original: AgentMessage, message: string): AgentMessage {
    return this.reply(original, "error", { message });
  }

  getStatus(): AgentStatus { return this.status; }
}

export class MultiAgentOrchestrator {
  private agents = new Map<string, BaseAgent>();
  private sharedState: SharedState;

  constructor(state?: SharedState) {
    this.sharedState = state ?? new InMemorySharedState();
  }

  register(agent: BaseAgent): this {
    this.agents.set(agent.id, agent);
    return this;
  }

  findByCapability(capabilityName: string): BaseAgent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.capabilities.some(c => c.name === capabilityName)) {
        return agent;
      }
    }
  }

  async send<T>(
    toId: string,
    payload: T,
    opts: { ttlMs?: number; correlationId?: string } = {}
  ): Promise<unknown> {
    const agent = this.agents.get(toId);
    if (!agent) throw new Error(`Agent "${toId}" not registered`);

    const message: AgentMessage<T> = {
      id: crypto.randomUUID(),
      correlationId: opts.correlationId,
      from: "orchestrator",
      to: toId,
      type: "task",
      payload,
      timestamp: Date.now(),
      ttlMs: opts.ttlMs,
    };

    const response = await agent.receive(message);
    if (!response) return null;
    if (response.type === "error") {
      throw new Error(`Agent "${toId}" error: ${JSON.stringify(response.payload)}`);
    }
    return response.payload;
  }

  async broadcast<T>(payload: T): Promise<Map<string, unknown>> {
    const results = new Map<string, unknown>();
    await Promise.all(
      [...this.agents.entries()].map(async ([id, agent]) => {
        const msg: AgentMessage<T> = {
          id: crypto.randomUUID(),
          from: "orchestrator",
          to: "broadcast",
          type: "broadcast",
          payload,
          timestamp: Date.now(),
        };
        const response = await agent.receive(msg);
        results.set(id, response?.payload);
      })
    );
    return results;
  }

  async healthCheck(): Promise<Record<string, AgentStatus>> {
    const statuses: Record<string, AgentStatus> = {};
    for (const [id, agent] of this.agents) {
      statuses[id] = agent.getStatus();
    }
    return statuses;
  }

  getSharedState(): SharedState { return this.sharedState; }
}

