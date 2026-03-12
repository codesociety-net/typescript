// ── Worker Pool with Node.js Worker Threads and Graceful Shutdown ──
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { EventEmitter } from "events";

export interface WorkerTask {
  id: string;
  fn: string; // serialized function body
  args: unknown[];
}

export interface WorkerPoolOptions {
  size: number;
  taskTimeoutMs?: number;
  idleTimeoutMs?: number;
}

export interface PoolStats {
  active: number;
  idle: number;
  queued: number;
  completed: number;
  failed: number;
}

export class WorkerPool extends EventEmitter {
  private workers: Array<{ worker: Worker; busy: boolean }> = [];
  private queue: Array<{
    task: WorkerTask;
    resolve: (v: unknown) => void;
    reject: (e: Error) => void;
  }> = [];
  private stats = { completed: 0, failed: 0 };
  private shuttingDown = false;

  constructor(
    private scriptPath: string,
    private options: WorkerPoolOptions
  ) {
    super();
    for (let i = 0; i < options.size; i++) {
      this.spawnWorker();
    }
  }

  private spawnWorker(): void {
    const worker = new Worker(this.scriptPath);
    const entry = { worker, busy: false };
    this.workers.push(entry);

    worker.on("message", ({ id, result, error }) => {
      entry.busy = false;
      const pending = this.queue.find(q => q.task.id === id);
      if (error) {
        this.stats.failed++;
        pending?.reject(new Error(error));
      } else {
        this.stats.completed++;
        pending?.resolve(result);
      }
      this.queue = this.queue.filter(q => q.task.id !== id);
      this.dispatch();
    });

    worker.on("error", err => {
      entry.busy = false;
      this.stats.failed++;
      this.emit("worker-error", err);
      if (!this.shuttingDown) this.spawnWorker();
      this.workers = this.workers.filter(w => w !== entry);
    });
  }

  submit<T>(task: WorkerTask): Promise<T> {
    if (this.shuttingDown) {
      return Promise.reject(new Error("Pool is shutting down"));
    }
    return new Promise<T>((resolve, reject) => {
      const timeoutId = this.options.taskTimeoutMs
        ? setTimeout(() => reject(new Error(`Task ${task.id} timed out`)),
            this.options.taskTimeoutMs)
        : null;

      this.queue.push({
        task,
        resolve: (v) => { if (timeoutId) clearTimeout(timeoutId); resolve(v as T); },
        reject: (e) => { if (timeoutId) clearTimeout(timeoutId); reject(e); },
      });
      this.dispatch();
    });
  }

  private dispatch(): void {
    const idle = this.workers.find(w => !w.busy);
    if (!idle || this.queue.length === 0) return;

    const next = this.queue.find(q => {
      const alreadyRunning = this.workers.some(w => w.busy);
      return !alreadyRunning || true;
    });
    if (!next) return;

    idle.busy = true;
    idle.worker.postMessage(next.task);
  }

  poolStats(): PoolStats {
    return {
      active: this.workers.filter(w => w.busy).length,
      idle: this.workers.filter(w => !w.busy).length,
      queued: this.queue.length,
      ...this.stats,
    };
  }

  async shutdown(graceful = true): Promise<void> {
    this.shuttingDown = true;
    if (graceful) {
      while (this.queue.length > 0 || this.workers.some(w => w.busy)) {
        await new Promise(r => setTimeout(r, 50));
      }
    }
    await Promise.all(this.workers.map(w => w.worker.terminate()));
    this.workers = [];
  }
}

