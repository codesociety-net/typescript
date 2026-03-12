// ── Configuration Snapshots with Metadata ─────────────────────────

export interface ConfigSnapshot<T> {
  readonly id: string;
  readonly label: string;
  readonly state: Readonly<T>;
  readonly createdAt: number;
  readonly tags: string[];
}

export class ConfigMemento<T> {
  readonly id: string;
  readonly createdAt: number;

  constructor(
    private readonly state: T,
    public readonly label: string,
    public readonly tags: string[] = []
  ) {
    this.id = crypto.randomUUID();
    this.createdAt = Date.now();
  }

  getSnapshot(): ConfigSnapshot<T> {
    return {
      id: this.id,
      label: this.label,
      state: Object.freeze(structuredClone(this.state)),
      createdAt: this.createdAt,
      tags: [...this.tags],
    };
  }
}

// ── Caretaker with Search ─────────────────────────────────────────

export class SnapshotHistory<T> {
  private snapshots: ConfigMemento<T>[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  save(memento: ConfigMemento<T>): void {
    this.snapshots.push(memento);
    if (this.snapshots.length > this.maxSize) {
      this.snapshots.shift();
    }
  }

  getById(id: string): ConfigMemento<T> | undefined {
    return this.snapshots.find(s => s.id === id);
  }

  getByTag(tag: string): ConfigMemento<T>[] {
    return this.snapshots.filter(s => s.tags.includes(tag));
  }

  latest(): ConfigMemento<T> | undefined {
    return this.snapshots[this.snapshots.length - 1];
  }

  list(): ConfigSnapshot<T>[] {
    return this.snapshots.map(s => s.getSnapshot());
  }
}

// ── Configurable (Originator) ─────────────────────────────────────

export interface AppConfig {
  theme: "light" | "dark";
  language: string;
  features: Record<string, boolean>;
  rateLimits: { requestsPerMinute: number; burstSize: number };
}

export class AppConfigManager {
  private config: AppConfig;
  private history = new SnapshotHistory<AppConfig>();

  constructor(initial: AppConfig) {
    this.config = structuredClone(initial);
  }

  update(patch: Partial<AppConfig>, label: string, tags: string[] = []): void {
    const memento = new ConfigMemento(this.config, label, tags);
    this.history.save(memento);
    this.config = { ...this.config, ...patch };
  }

  rollback(snapshotId?: string): ConfigSnapshot<AppConfig> | null {
    const memento = snapshotId
      ? this.history.getById(snapshotId)
      : this.history.latest();

    if (!memento) return null;

    const snapshot = memento.getSnapshot();
    this.config = structuredClone(snapshot.state as AppConfig);
    return snapshot;
  }

  getConfig(): Readonly<AppConfig> { return this.config; }
  getHistory(): ConfigSnapshot<AppConfig>[] { return this.history.list(); }
  getSnapshotsByTag(tag: string): ConfigSnapshot<AppConfig>[] {
    return this.history.getByTag(tag).map(m => m.getSnapshot());
  }
}

