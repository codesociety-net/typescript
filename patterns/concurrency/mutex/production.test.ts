import { describe, it, expect } from "vitest";
import { AsyncMutex, MutexTimeoutError, getOrRefresh, cache } from "./production";

describe("Mutex / Lock (Production)", () => {
  it("acquire returns an unlock function", async () => {
    const mutex = new AsyncMutex("test");
    const unlock = await mutex.acquire();
    expect(typeof unlock).toBe("function");
    expect(mutex.isLocked).toBe(true);
    unlock();
    expect(mutex.isLocked).toBe(false);
  });

  it("withLock serializes access and returns the result", async () => {
    const mutex = new AsyncMutex("test");
    let counter = 0;

    const increment = () =>
      mutex.withLock(async () => {
        const current = counter;
        await new Promise((r) => setTimeout(r, 1));
        counter = current + 1;
      });

    await Promise.all(Array.from({ length: 5 }, increment));
    expect(counter).toBe(5);
  });

  it("throws MutexTimeoutError when acquisition times out", async () => {
    const mutex = new AsyncMutex("test");
    await mutex.acquire(); // lock it

    try {
      await mutex.acquire({ timeoutMs: 10 });
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MutexTimeoutError);
      expect((e as MutexTimeoutError).waitedMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("tracks totalAcquisitions and queueDepth", async () => {
    const mutex = new AsyncMutex("test");
    expect(mutex.totalAcquisitions).toBe(0);
    const unlock = await mutex.acquire();
    expect(mutex.totalAcquisitions).toBe(1);

    // Queue a waiter
    const p = mutex.acquire();
    await Promise.resolve();
    expect(mutex.queueDepth).toBe(1);

    unlock();
    const unlock2 = await p;
    expect(mutex.totalAcquisitions).toBe(2);
    expect(mutex.queueDepth).toBe(0);
    unlock2();
  });

  it("tracks currentOwner via label option", async () => {
    const mutex = new AsyncMutex("test");
    const unlock = await mutex.acquire({ label: "writer-1" });
    expect(mutex.currentOwner).toBe("writer-1");
    unlock();
    expect(mutex.currentOwner).toBeUndefined();
  });

  it("getOrRefresh caches and returns fresh values", async () => {
    cache.clear();
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return "data";
    };

    const r1 = await getOrRefresh("key1", fetcher, 5000);
    expect(r1).toBe("data");
    expect(fetchCount).toBe(1);

    const r2 = await getOrRefresh("key1", fetcher, 5000);
    expect(r2).toBe("data");
    expect(fetchCount).toBe(1);

    cache.clear();
  });
});
