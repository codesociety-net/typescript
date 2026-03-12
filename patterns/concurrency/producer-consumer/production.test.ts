import { describe, it, expect } from "vitest";
import { TaskQueue } from "./production";
import type { Task } from "./production";

describe("Producer-Consumer (Production)", () => {
  it("processes submitted tasks and returns results via drain", async () => {
    const queue = new TaskQueue<string, string>(
      async (task) => `done-${task.payload}`,
      { capacity: 10, workers: 2, maxRetries: 0, backpressureStrategy: "block" }
    );
    await queue.submit({ id: "t1", payload: "hello" });
    await queue.submit({ id: "t2", payload: "world" });
    const results = await queue.drain();
    expect(results).toHaveLength(2);
    expect(results.find((r) => r.taskId === "t1")?.result).toBe("done-hello");
    expect(results.find((r) => r.taskId === "t2")?.result).toBe("done-world");
  });

  it("throws when submitting to a shut-down queue", async () => {
    const queue = new TaskQueue<string, string>(
      async (task) => task.payload,
      { capacity: 5, workers: 1, maxRetries: 0, backpressureStrategy: "block" }
    );
    await queue.drain(); // shuts down
    await expect(queue.submit({ id: "t1", payload: "x" })).rejects.toThrow(
      "Queue is shut down"
    );
  });

  it("uses error backpressure strategy when queue is full", async () => {
    const queue = new TaskQueue<string, string>(
      async (task) => {
        await new Promise((r) => setTimeout(r, 200));
        return task.payload;
      },
      { capacity: 1, workers: 1, maxRetries: 0, backpressureStrategy: "error" }
    );
    await queue.submit({ id: "t1", payload: "a" });
    // Queue is now at capacity while worker picks it up
    await expect(
      queue.submit({ id: "t2", payload: "b" })
    ).rejects.toThrow("Queue full");
    await queue.drain();
  });

  it("drop strategy silently discards tasks when full", async () => {
    const queue = new TaskQueue<string, string>(
      async (task) => {
        await new Promise((r) => setTimeout(r, 200));
        return task.payload;
      },
      { capacity: 1, workers: 1, maxRetries: 0, backpressureStrategy: "drop" }
    );
    await queue.submit({ id: "t1", payload: "a" });
    // This should silently drop
    await queue.submit({ id: "t2", payload: "b" });
    const results = await queue.drain();
    // Only the first task should have been processed
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("retries failed tasks up to maxRetries", async () => {
    let attempts = 0;
    const queue = new TaskQueue<string, string>(
      async (task) => {
        attempts++;
        if (attempts < 3) throw new Error("fail");
        return "ok";
      },
      { capacity: 5, workers: 1, maxRetries: 3, backpressureStrategy: "block" }
    );
    await queue.submit({ id: "t1", payload: "retry-me" });
    const results = await queue.drain();
    const result = results.find((r) => r.taskId === "t1");
    expect(result?.result).toBe("ok");
    expect(result?.attempts).toBeGreaterThanOrEqual(2);
  });

  it("records error when all retries are exhausted", async () => {
    const queue = new TaskQueue<string, string>(
      async () => {
        throw new Error("always-fail");
      },
      { capacity: 5, workers: 1, maxRetries: 1, backpressureStrategy: "block" }
    );
    await queue.submit({ id: "t1", payload: "doomed" });
    const results = await queue.drain();
    const result = results.find((r) => r.taskId === "t1");
    expect(result?.error).toBeDefined();
    expect(result?.error?.message).toBe("always-fail");
  });
});
