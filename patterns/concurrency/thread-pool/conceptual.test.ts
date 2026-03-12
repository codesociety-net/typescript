import { describe, it, expect } from "vitest";
import { ThreadPool } from "./conceptual";

describe("Thread Pool (Conceptual)", () => {
  it("executes a single task and returns its result", async () => {
    const pool = new ThreadPool(2);
    const result = await pool.submit(async () => "hello");
    expect(result).toBe("hello");
  });

  it("executes multiple tasks and returns all results", async () => {
    const pool = new ThreadPool(3);
    const results = await Promise.all([
      pool.submit(async () => 1),
      pool.submit(async () => 2),
      pool.submit(async () => 3),
    ]);
    expect(results).toEqual([1, 2, 3]);
  });

  it("limits concurrency to pool size", async () => {
    const pool = new ThreadPool(2);
    let maxConcurrent = 0;
    let currentConcurrent = 0;

    const makeTask = () =>
      pool.submit(async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise((r) => setTimeout(r, 50));
        currentConcurrent--;
        return true;
      });

    await Promise.all(Array.from({ length: 6 }, makeTask));
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it("propagates task errors", async () => {
    const pool = new ThreadPool(2);
    await expect(
      pool.submit(async () => {
        throw new Error("task-error");
      })
    ).rejects.toThrow("task-error");
  });

  it("tracks pending and active counts", async () => {
    const pool = new ThreadPool(1);
    let resolveFirst!: () => void;
    const blockingPromise = new Promise<void>((r) => (resolveFirst = r));

    const task1 = pool.submit(async () => {
      await blockingPromise;
      return "done";
    });
    // Submit a second task that will be queued
    const task2 = pool.submit(async () => "second");

    expect(pool.active).toBe(1);
    expect(pool.pending).toBe(1);

    resolveFirst();
    await task1;
    await task2;
    // Allow finally() callbacks to complete
    await new Promise((r) => setTimeout(r, 10));
    expect(pool.active).toBe(0);
    expect(pool.pending).toBe(0);
  });
});
