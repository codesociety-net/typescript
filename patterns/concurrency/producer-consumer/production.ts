// ── Task Queue with Workers and Backpressure ─────────────────────

export interface Task<T> {
  id: string;
  payload: T;
  priority?: number;
  retries?: number;
}

export interface WorkerResult<T, R> {
  taskId: string;
  result?: R;
  error?: Error;
  attempts: number;
  durationMs: number;
}

export interface QueueOptions {
  capacity: number;
  workers: number;
  maxRetries: number;
  backpressureStrategy: "block" | "drop" | "error";
}

export class TaskQueue<T, R> {
  private queue: Task<T>[] = [];
  private waitingProducers: Array<(v: void) => void> = [];
  private activeWorkers = 0;
  private isShutdown = false;
  private results: WorkerResult<T, R>[] = [];

  constructor(
    private handler: (task: Task<T>) => Promise<R>,
    private options: QueueOptions
  ) {
    for (let i = 0; i < options.workers; i++) {
      void this.runWorker();
    }
  }

  async submit(task: Task<T>): Promise<void> {
    if (this.isShutdown) throw new Error("Queue is shut down");

    if (this.queue.length >= this.options.capacity) {
      switch (this.options.backpressureStrategy) {
        case "drop":
          return;
        case "error":
          throw new Error(`Queue full (capacity: ${this.options.capacity})`);
        case "block":
          await new Promise<void>(r => this.waitingProducers.push(r));
      }
    }

    this.queue.push(task);
    this.queue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  private async runWorker(): Promise<void> {
    while (!this.isShutdown || this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) {
        await new Promise(r => setTimeout(r, 10));
        continue;
      }

      this.waitingProducers.shift()?.();
      this.activeWorkers++;

      const start = Date.now();
      let attempts = 0;
      let lastError: Error | undefined;

      while (attempts <= (task.retries ?? this.options.maxRetries)) {
        try {
          const result = await this.handler(task);
          this.results.push({
            taskId: task.id,
            result,
            attempts: attempts + 1,
            durationMs: Date.now() - start,
          });
          break;
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          attempts++;
          if (attempts <= (task.retries ?? this.options.maxRetries)) {
            await new Promise(r => setTimeout(r, 100 * 2 ** attempts));
          }
        }
      }

      if (lastError && attempts > (task.retries ?? this.options.maxRetries)) {
        this.results.push({
          taskId: task.id,
          error: lastError,
          attempts,
          durationMs: Date.now() - start,
        });
      }

      this.activeWorkers--;
    }
  }

  async drain(): Promise<WorkerResult<T, R>[]> {
    while (this.queue.length > 0 || this.activeWorkers > 0) {
      await new Promise(r => setTimeout(r, 50));
    }
    this.isShutdown = true;
    return this.results;
  }
}

