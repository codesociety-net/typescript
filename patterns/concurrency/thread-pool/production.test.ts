import { describe, it, expect } from "vitest";
import { WorkerPool } from "./production";

// Note: WorkerPool uses actual Node worker_threads which require a real script path.
// We test the class API surface without spawning real workers.

describe("Thread Pool (Production)", () => {
  it("WorkerPool is a class with expected methods", () => {
    expect(typeof WorkerPool).toBe("function");
    expect(WorkerPool.prototype.submit).toBeDefined();
    expect(WorkerPool.prototype.poolStats).toBeDefined();
    expect(WorkerPool.prototype.shutdown).toBeDefined();
  });

  it("rejects submit after shutdown", async () => {
    // Use a subclass to avoid spawning real workers
    class TestPool extends WorkerPool {
      constructor() {
        super("", { size: 0 });
      }
    }

    const pool = new TestPool();
    await pool.shutdown(false);
    await expect(
      pool.submit({ id: "1", fn: "return 1", args: [] })
    ).rejects.toThrow("Pool is shutting down");
  });

  it("poolStats returns correct structure", () => {
    class TestPool extends WorkerPool {
      constructor() {
        super("", { size: 0 });
      }
    }

    const pool = new TestPool();
    const stats = pool.poolStats();
    expect(stats).toHaveProperty("active");
    expect(stats).toHaveProperty("idle");
    expect(stats).toHaveProperty("queued");
    expect(stats).toHaveProperty("completed");
    expect(stats).toHaveProperty("failed");
    expect(stats.active).toBe(0);
    expect(stats.idle).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.failed).toBe(0);
  });

  it("poolStats tracks initial state for zero-size pool", async () => {
    class TestPool extends WorkerPool {
      constructor() {
        super("", { size: 0 });
      }
    }
    const pool = new TestPool();
    const stats = pool.poolStats();
    expect(stats.queued).toBe(0);
    await pool.shutdown(false);
  });
});
