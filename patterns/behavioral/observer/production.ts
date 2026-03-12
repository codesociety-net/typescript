// ── Typed Event Bus with Filtering ────────────────────────────────

export type EventMap = Record<string, unknown>;
export type Unsubscribe = () => void;

export interface SubscribeOptions<T> {
  filter?: (event: T) => boolean;
  once?: boolean;
}

export class TypedEventBus<TEvents extends EventMap> {
  private handlers = new Map<keyof TEvents, Set<{
    fn: (event: unknown) => void;
    filter?: (event: unknown) => boolean;
    once: boolean;
  }>>();

  on<K extends keyof TEvents>(
    event: K,
    handler: (event: TEvents[K]) => void,
    options: SubscribeOptions<TEvents[K]> = {}
  ): Unsubscribe {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    const entry = {
      fn: handler as (event: unknown) => void,
      filter: options.filter as ((event: unknown) => boolean) | undefined,
      once: options.once ?? false,
    };

    this.handlers.get(event)!.add(entry);

    return () => this.handlers.get(event)?.delete(entry);
  }

  once<K extends keyof TEvents>(
    event: K,
    handler: (event: TEvents[K]) => void,
    options: Omit<SubscribeOptions<TEvents[K]>, "once"> = {}
  ): Unsubscribe {
    return this.on(event, handler, { ...options, once: true });
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const entries = this.handlers.get(event);
    if (!entries) return;

    for (const entry of [...entries]) {
      if (entry.filter && !entry.filter(payload)) continue;
      entry.fn(payload);
      if (entry.once) entries.delete(entry);
    }
  }

  off<K extends keyof TEvents>(event: K): void {
    this.handlers.delete(event);
  }
}

// ── Usage ─────────────────────────────────────────────────────────

export interface AppEvents extends EventMap {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "order:placed": { orderId: string; total: number; userId: string };
  "order:shipped": { orderId: string; trackingCode: string };
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const bus = new TypedEventBus<AppEvents>();
  
  bus.on("order:placed", ({ orderId, total }) => {
    console.log(`New order ${orderId} for $${total}`);
  });
  
  bus.on(
    "order:placed",
    ({ orderId }) => console.log(`High-value order alert: ${orderId}`),
    { filter: e => e.total > 500 }
  );
  
  bus.once("user:login", ({ userId }) => {
    console.log(`Welcome back, ${userId}!`);
  });
}
