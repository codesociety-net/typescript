// ── Rate Limiter Using Semaphore for Concurrent API Calls ─────────

export class Semaphore {
  private permits: number;
  private waiters: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];

  constructor(private maxConcurrency: number) {
    this.permits = maxConcurrency;
  }

  acquire(signal?: AbortSignal): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const waiter = { resolve, reject };
      this.waiters.push(waiter);

      signal?.addEventListener("abort", () => {
        const idx = this.waiters.indexOf(waiter);
        if (idx !== -1) {
          this.waiters.splice(idx, 1);
          reject(new Error("Semaphore acquisition aborted"));
        }
      }, { once: true });
    });
  }

  release(): void {
    const next = this.waiters.shift();
    if (next) {
      next.resolve();
    } else {
      this.permits++;
    }
  }

  async withPermit<T>(fn: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    await this.acquire(signal);
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

export interface RateLimiterOptions {
  maxConcurrent: number;
  minIntervalMs?: number; // token-bucket style spacing
}

export interface ApiResponse<T> {
  data: T;
  requestId: string;
  durationMs: number;
}

export class ApiRateLimiter {
  private semaphore: Semaphore;
  private lastCallTime = 0;

  constructor(private options: RateLimiterOptions) {
    this.semaphore = new Semaphore(options.maxConcurrent);
  }

  async call<T>(
    fn: () => Promise<T>,
    requestId: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<T>> {
    return this.semaphore.withPermit(async () => {
      // Enforce minimum spacing between requests
      if (this.options.minIntervalMs) {
        const elapsed = Date.now() - this.lastCallTime;
        if (elapsed < this.options.minIntervalMs) {
          await new Promise(r =>
            setTimeout(r, this.options.minIntervalMs! - elapsed)
          );
        }
      }

      const start = Date.now();
      this.lastCallTime = Date.now();
      const data = await fn();

      return {
        data,
        requestId,
        durationMs: Date.now() - start,
      };
    }, signal);
  }

  get available(): number { return (this.semaphore as unknown as { permits: number }).permits; }
}

// Usage: limit to 5 concurrent API calls with 100ms minimum spacing
export const limiter = new ApiRateLimiter({
  maxConcurrent: 5,
  minIntervalMs: 100,
});

export async function fetchUser(id: string): Promise<{ id: string; name: string }> {
  // Simulated API call
  return { id, name: `User ${id}` };
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const userIds = Array.from({ length: 20 }, (_, i) => String(i + 1));
  
  const responses = await Promise.all(
    userIds.map(id =>
      limiter.call(() => fetchUser(id), `req-${id}`)
    )
  );
}
