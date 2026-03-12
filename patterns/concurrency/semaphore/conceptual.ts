export class Semaphore {
  private permits: number;
  private waiters: Array<() => void> = [];

  constructor(initialPermits: number) {
    if (initialPermits < 1) throw new Error("Permits must be >= 1");
    this.permits = initialPermits;
  }

  acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }
    return new Promise<void>(resolve => this.waiters.push(resolve));
  }

  release(): void {
    const next = this.waiters.shift();
    if (next) {
      next(); // pass permit directly to next waiter
    } else {
      this.permits++;
    }
  }

  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  get available(): number { return this.permits; }
  get queued(): number { return this.waiters.length; }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage: limit concurrent tasks to 3
  const semaphore = new Semaphore(3);
  
  const tasks = Array.from({ length: 10 }, (_, i) =>
    semaphore.withPermit(async () => {
      await new Promise(r => setTimeout(r, 100));
      return `task-${i}`;
    })
  );
  
  const results = await Promise.all(tasks);
  console.log(results);
}
