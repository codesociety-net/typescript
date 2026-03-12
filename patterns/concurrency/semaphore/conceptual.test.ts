import { describe, it, expect } from "vitest";
import { Semaphore } from "./conceptual";

describe("Semaphore (Conceptual)", () => {
  it("throws when initialized with permits < 1", () => {
    expect(() => new Semaphore(0)).toThrow("Permits must be >= 1");
    expect(() => new Semaphore(-1)).toThrow("Permits must be >= 1");
  });

  it("acquire decrements available permits", async () => {
    const sem = new Semaphore(3);
    expect(sem.available).toBe(3);
    await sem.acquire();
    expect(sem.available).toBe(2);
    await sem.acquire();
    expect(sem.available).toBe(1);
  });

  it("release increments available permits", async () => {
    const sem = new Semaphore(2);
    await sem.acquire();
    expect(sem.available).toBe(1);
    sem.release();
    expect(sem.available).toBe(2);
  });

  it("blocks when no permits are available", async () => {
    const sem = new Semaphore(1);
    await sem.acquire();
    let acquired = false;
    const pending = sem.acquire().then(() => {
      acquired = true;
    });
    await Promise.resolve();
    expect(acquired).toBe(false);
    expect(sem.queued).toBe(1);
    sem.release();
    await pending;
    expect(acquired).toBe(true);
    expect(sem.queued).toBe(0);
  });

  it("withPermit limits concurrency", async () => {
    const sem = new Semaphore(2);
    let maxConcurrent = 0;
    let current = 0;

    const task = () =>
      sem.withPermit(async () => {
        current++;
        maxConcurrent = Math.max(maxConcurrent, current);
        await new Promise((r) => setTimeout(r, 20));
        current--;
        return "done";
      });

    const results = await Promise.all(Array.from({ length: 6 }, task));
    expect(maxConcurrent).toBeLessThanOrEqual(2);
    expect(results.every((r) => r === "done")).toBe(true);
  });

  it("withPermit releases permit even on error", async () => {
    const sem = new Semaphore(1);
    await expect(
      sem.withPermit(async () => {
        throw new Error("fail");
      })
    ).rejects.toThrow("fail");
    expect(sem.available).toBe(1);
  });
});
