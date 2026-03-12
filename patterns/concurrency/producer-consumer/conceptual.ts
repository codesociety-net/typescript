export interface BoundedQueue<T> {
  enqueue(item: T): Promise<void>;
  dequeue(): Promise<T>;
  readonly size: number;
}

export class AsyncQueue<T> implements BoundedQueue<T> {
  private items: T[] = [];
  private waitingProducers: Array<(v: void) => void> = [];
  private waitingConsumers: Array<(item: T) => void> = [];

  constructor(private capacity: number) {}

  get size(): number { return this.items.length; }

  async enqueue(item: T): Promise<void> {
    if (this.waitingConsumers.length > 0) {
      this.waitingConsumers.shift()!(item);
      return;
    }
    if (this.items.length < this.capacity) {
      this.items.push(item);
      return;
    }
    // Block producer: queue is full
    await new Promise<void>(resolve => this.waitingProducers.push(resolve));
    this.items.push(item);
  }

  async dequeue(): Promise<T> {
    if (this.items.length > 0) {
      const item = this.items.shift()!;
      this.waitingProducers.shift()?.();
      return item;
    }
    // Block consumer: queue is empty
    return new Promise<T>(resolve => this.waitingConsumers.push(resolve));
  }
}

export async function producer(queue: BoundedQueue<number>): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await queue.enqueue(i);
    console.log(`Produced: ${i}`);
  }
}

export async function consumer(queue: BoundedQueue<number>): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const item = await queue.dequeue();
    console.log(`Consumed: ${item}`);
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const queue = new AsyncQueue<number>(3);
  await Promise.all([producer(queue), consumer(queue)]);
}
