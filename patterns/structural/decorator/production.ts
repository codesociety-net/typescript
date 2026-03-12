// Decorator Pattern – Production
// Transparent logging and in-memory caching decorators
// layered over any async service method.

export interface UserService {
  getUser(id: string): Promise<{ id: string; name: string }>;
}

// ── Concrete service ──────────────────────────────────────────────────────────
export class RealUserService implements UserService {
  async getUser(id: string) {
    // Simulates an I/O call
    return { id, name: `User ${id}` };
  }
}

// ── Logging decorator ─────────────────────────────────────────────────────────
export class LoggingUserService implements UserService {
  constructor(private readonly inner: UserService) {}

  async getUser(id: string) {
    console.log(`[LOG] getUser called with id=${id}`);
    const start = Date.now();
    try {
      const result = await this.inner.getUser(id);
      console.log(`[LOG] getUser succeeded in ${Date.now() - start}ms`);
      return result;
    } catch (err) {
      console.error(`[LOG] getUser failed after ${Date.now() - start}ms`, err);
      throw err;
    }
  }
}

// ── Caching decorator ─────────────────────────────────────────────────────────
export class CachingUserService implements UserService {
  private cache = new Map<string, { value: { id: string; name: string }; expiresAt: number }>();

  constructor(
    private readonly inner: UserService,
    private readonly ttlMs: number = 60_000,
  ) {}

  async getUser(id: string) {
    const cached = this.cache.get(id);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`[CACHE] HIT for id=${id}`);
      return cached.value;
    }

    console.log(`[CACHE] MISS for id=${id}`);
    const value = await this.inner.getUser(id);
    this.cache.set(id, { value, expiresAt: Date.now() + this.ttlMs });
    return value;
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Composition ────────────────────────────────────────────────────────────────
  // Logging → Caching → Real service
  const service: UserService = new LoggingUserService(
    new CachingUserService(new RealUserService(), 30_000),
  );
  
  // First call: cache miss, then real fetch, then logged
  service.getUser("abc-123").then(console.log);
  // Second call: served from cache
  service.getUser("abc-123").then(console.log);
}
