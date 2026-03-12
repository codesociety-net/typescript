// ── Async Mutex with Timeout for Critical Sections ───────────────

export class MutexTimeoutError extends Error {
  constructor(public readonly waitedMs: number) {
    super(`Mutex acquisition timed out after ${waitedMs}ms`);
    this.name = "MutexTimeoutError";
  }
}

export interface MutexOptions {
  timeoutMs?: number;
  label?: string;
}

export class AsyncMutex {
  private locked = false;
  private waiters: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];
  private owner?: string;
  private acquisitionCount = 0;

  constructor(private label = "mutex") {}

  async acquire(opts: MutexOptions = {}): Promise<() => void> {
    const { timeoutMs, label } = opts;
    const start = Date.now();

    if (!this.locked) {
      this.locked = true;
      this.owner = label;
      this.acquisitionCount++;
      return () => this.release();
    }

    return new Promise<() => void>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const waiter = {
        resolve: () => {
          if (timeoutId) clearTimeout(timeoutId);
          this.owner = label;
          this.acquisitionCount++;
          resolve(() => this.release());
        },
        reject,
      };

      this.waiters.push(waiter);

      if (timeoutMs !== undefined) {
        timeoutId = setTimeout(() => {
          const idx = this.waiters.indexOf(waiter);
          if (idx !== -1) this.waiters.splice(idx, 1);
          reject(new MutexTimeoutError(Date.now() - start));
        }, timeoutMs);
      }
    });
  }

  private release(): void {
    const next = this.waiters.shift();
    if (next) {
      next.resolve();
    } else {
      this.locked = false;
      this.owner = undefined;
    }
  }

  async withLock<T>(fn: () => Promise<T>, opts: MutexOptions = {}): Promise<T> {
    const unlock = await this.acquire(opts);
    try {
      return await fn();
    } finally {
      unlock();
    }
  }

  get isLocked(): boolean { return this.locked; }
  get currentOwner(): string | undefined { return this.owner; }
  get totalAcquisitions(): number { return this.acquisitionCount; }
  get queueDepth(): number { return this.waiters.length; }
}

// Example: serialised cache refresh
export const cacheMutex = new AsyncMutex("cache-refresh");
export const cache = new Map<string, { value: unknown; expiresAt: number }>();

export async function getOrRefresh<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 60_000
): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  return cacheMutex.withLock(async () => {
    // Re-check after acquiring lock (another waiter may have refreshed)
    const fresh = cache.get(key);
    if (fresh && fresh.expiresAt > Date.now()) return fresh.value as T;

    const value = await fetcher();
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }, { timeoutMs: 5_000, label: `refresh:${key}` });
}

