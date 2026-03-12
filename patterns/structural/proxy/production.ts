// Proxy Pattern – Production
// Caching proxy with per-key TTL sitting in front of any async data fetcher.

export interface DataSource<T> {
  fetch(key: string): Promise<T>;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CachingProxy<T> implements DataSource<T> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly origin: DataSource<T>,
    private readonly ttlMs: number = 60_000,
  ) {}

  async fetch(key: string): Promise<T> {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      console.log(`[Cache HIT]  key="${key}"`);
      return entry.value;
    }

    console.log(`[Cache MISS] key="${key}" – fetching from origin`);
    const value = await this.origin.fetch(key);
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    return value;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    console.log(`[Cache] invalidated key="${key}"`);
  }

  invalidateAll(): void {
    this.cache.clear();
    console.log("[Cache] cleared all entries");
  }
}

// ── Example origin ────────────────────────────────────────────────────────────
export interface WeatherData { temp: number; condition: string }

export class WeatherApiClient implements DataSource<WeatherData> {
  async fetch(city: string): Promise<WeatherData> {
    console.log(`[API] GET /weather?city=${city}`);
    // Simulate network delay + response
    await new Promise((r) => setTimeout(r, 50));
    return { temp: 22, condition: "sunny" };
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Usage ─────────────────────────────────────────────────────────────────────
  const proxy = new CachingProxy(new WeatherApiClient(), 5_000);
  
  (async () => {
    await proxy.fetch("London"); // MISS – calls API
    await proxy.fetch("London"); // HIT  – served from cache
    proxy.invalidate("London");
    await proxy.fetch("London"); // MISS – cache was cleared
  })();
}
