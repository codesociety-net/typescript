// ── Thread-Safe Singleton with Lazy Initialization ───────────────
// In Node.js/browser JS, true thread-safety isn't needed
// (single-threaded), but this pattern guards against
// async initialization races.

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  maxConnections: number;
}

export class DatabasePool {
  private static instance: DatabasePool | null = null;
  private static initPromise: Promise<DatabasePool> | null = null;

  private connections: unknown[] = [];
  private isShutdown = false;

  private constructor(private config: DatabaseConfig) {}

  /**
   * Async-safe singleton accessor.
   * Multiple concurrent calls during initialization
   * will all await the same promise.
   */
  static async getInstance(
    config?: DatabaseConfig
  ): Promise<DatabasePool> {
    if (DatabasePool.instance) {
      return DatabasePool.instance;
    }

    if (!DatabasePool.initPromise) {
      const cfg = config ?? {
        host: "localhost",
        port: 5432,
        database: "app",
        maxConnections: 10,
      };

      DatabasePool.initPromise = (async () => {
        const pool = new DatabasePool(cfg);
        await pool.initialize();
        DatabasePool.instance = pool;
        return pool;
      })();
    }

    return DatabasePool.initPromise;
  }

  private async initialize(): Promise<void> {
    // Simulate async connection setup
    for (let i = 0; i < this.config.maxConnections; i++) {
      this.connections.push({ id: i, active: false });
    }
  }

  async query(sql: string, params?: unknown[]): Promise<unknown[]> {
    if (this.isShutdown) {
      throw new Error("Pool has been shut down");
    }
    // Execute query against connection pool
    return [{ sql, params, result: "mock" }];
  }

  async shutdown(): Promise<void> {
    this.isShutdown = true;
    this.connections = [];
    DatabasePool.instance = null;
    DatabasePool.initPromise = null;
  }

  /** Reset for testing */
  static resetInstance(): void {
    DatabasePool.instance = null;
    DatabasePool.initPromise = null;
  }
}

