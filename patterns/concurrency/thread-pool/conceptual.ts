export type Task<T> = () => Promise<T>;

export class ThreadPool {
  private queue: Array<{
    task: Task<unknown>;
    resolve: (v: unknown) => void;
    reject: (e: unknown) => void;
  }> = [];
  private activeCount = 0;

  constructor(private size: number) {}

  submit<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task: task as Task<unknown>,
        resolve: resolve as (v: unknown) => void,
        reject,
      });
      this.dispatch();
    });
  }

  private dispatch(): void {
    while (this.activeCount < this.size && this.queue.length > 0) {
      const entry = this.queue.shift()!;
      this.activeCount++;

      entry.task()
        .then(entry.resolve)
        .catch(entry.reject)
        .finally(() => {
          this.activeCount--;
          this.dispatch();
        });
    }
  }

  get pending(): number { return this.queue.length; }
  get active(): number { return this.activeCount; }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const pool = new ThreadPool(4);
  
  const results = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      pool.submit(async () => {
        await new Promise(r => setTimeout(r, Math.random() * 100));
        return `task-${i}-done`;
      })
    )
  );
  
  console.log(results);
}
