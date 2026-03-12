export class Mutex {
  private locked = false;
  private queue: Array<() => void> = [];

  acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return Promise.resolve();
    }
    return new Promise<void>(resolve => this.queue.push(resolve));
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next(); // pass lock to next waiter
    } else {
      this.locked = false;
    }
  }

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// Usage: protect a shared counter
export const mutex = new Mutex();
let counter = 0;

export async function increment(): Promise<void> {
  await mutex.withLock(async () => {
    const current = counter;
    await new Promise(r => setTimeout(r, 1)); // simulate async work
    counter = current + 1;
  });
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  await Promise.all(Array.from({ length: 10 }, increment));
  console.log(counter); // always 10
}
