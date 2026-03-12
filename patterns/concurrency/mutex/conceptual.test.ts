import { describe, it, expect } from "vitest";
import { Mutex } from "./conceptual";

describe("Mutex / Lock (Conceptual)", () => {
  it("acquire and release work for a single holder", async () => {
    const mutex = new Mutex();
    await mutex.acquire();
    // Should be able to release without error
    mutex.release();
  });

  it("withLock executes the function and returns its result", async () => {
    const mutex = new Mutex();
    const result = await mutex.withLock(async () => 42);
    expect(result).toBe(42);
  });

  it("withLock releases the lock even when function throws", async () => {
    const mutex = new Mutex();
    await expect(
      mutex.withLock(async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");
    // Lock should be released: we should be able to acquire immediately
    await mutex.acquire();
    mutex.release();
  });

  it("serializes concurrent access to a shared resource", async () => {
    const mutex = new Mutex();
    let counter = 0;

    const increment = async () => {
      await mutex.withLock(async () => {
        const current = counter;
        await new Promise((r) => setTimeout(r, 1));
        counter = current + 1;
      });
    };

    await Promise.all(Array.from({ length: 10 }, increment));
    expect(counter).toBe(10);
  });

  it("queues waiters in order", async () => {
    const mutex = new Mutex();
    const order: number[] = [];

    await mutex.acquire();

    // Queue up waiters
    const p1 = mutex.acquire().then(() => {
      order.push(1);
      mutex.release();
    });
    const p2 = mutex.acquire().then(() => {
      order.push(2);
      mutex.release();
    });

    // Release the initial lock
    mutex.release();
    await p1;
    await p2;
    expect(order).toEqual([1, 2]);
  });
});
