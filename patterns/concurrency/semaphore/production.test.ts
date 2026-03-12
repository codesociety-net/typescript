import { describe, it, expect } from "vitest";
import { Semaphore, ApiRateLimiter, fetchUser } from "./production";

describe("Semaphore (Production)", () => {
  it("Semaphore acquire/release cycle works", async () => {
    const sem = new Semaphore(2);
    await sem.acquire();
    await sem.acquire();
    sem.release();
    await sem.acquire();
    sem.release();
    sem.release();
  });

  it("Semaphore supports AbortSignal cancellation", async () => {
    const sem = new Semaphore(1);
    await sem.acquire();

    const controller = new AbortController();
    const acquirePromise = sem.acquire(controller.signal);
    controller.abort();

    await expect(acquirePromise).rejects.toThrow("aborted");
    sem.release();
  });

  it("ApiRateLimiter limits concurrency", async () => {
    let maxConcurrent = 0;
    let current = 0;

    const limiter = new ApiRateLimiter({ maxConcurrent: 2 });

    const makeCall = (id: string) =>
      limiter.call(
        async () => {
          current++;
          maxConcurrent = Math.max(maxConcurrent, current);
          await new Promise((r) => setTimeout(r, 20));
          current--;
          return `result-${id}`;
        },
        `req-${id}`
      );

    const responses = await Promise.all(
      Array.from({ length: 5 }, (_, i) => makeCall(String(i)))
    );

    expect(maxConcurrent).toBeLessThanOrEqual(2);
    expect(responses).toHaveLength(5);
    responses.forEach((r) => {
      expect(r.data).toMatch(/^result-/);
      expect(r.requestId).toMatch(/^req-/);
      expect(typeof r.durationMs).toBe("number");
    });
  });

  it("fetchUser returns user data", async () => {
    const user = await fetchUser("42");
    expect(user).toEqual({ id: "42", name: "User 42" });
  });

  it("ApiRateLimiter call returns ApiResponse shape", async () => {
    const limiter = new ApiRateLimiter({ maxConcurrent: 3 });
    const response = await limiter.call(async () => "hello", "test-req");
    expect(response).toHaveProperty("data", "hello");
    expect(response).toHaveProperty("requestId", "test-req");
    expect(response).toHaveProperty("durationMs");
  });
});
