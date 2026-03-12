import { describe, it, expect } from "vitest";
import { AsyncQueue, producer, consumer } from "./conceptual";

describe("Producer-Consumer (Conceptual)", () => {
  it("enqueue and dequeue a single item", async () => {
    const queue = new AsyncQueue<number>(5);
    await queue.enqueue(42);
    expect(queue.size).toBe(1);
    const item = await queue.dequeue();
    expect(item).toBe(42);
    expect(queue.size).toBe(0);
  });

  it("maintains FIFO order", async () => {
    const queue = new AsyncQueue<string>(5);
    await queue.enqueue("a");
    await queue.enqueue("b");
    await queue.enqueue("c");
    expect(await queue.dequeue()).toBe("a");
    expect(await queue.dequeue()).toBe("b");
    expect(await queue.dequeue()).toBe("c");
  });

  it("blocks producer when queue is full", async () => {
    const queue = new AsyncQueue<number>(2);
    await queue.enqueue(1);
    await queue.enqueue(2);
    // Third enqueue should block until a consumer dequeues
    let enqueueResolved = false;
    const enqueuePromise = queue.enqueue(3).then(() => {
      enqueueResolved = true;
    });
    // Give microtasks a chance to run
    await Promise.resolve();
    expect(enqueueResolved).toBe(false);
    // Now consume to unblock
    const item = await queue.dequeue();
    expect(item).toBe(1);
    await enqueuePromise;
    expect(enqueueResolved).toBe(true);
  });

  it("blocks consumer when queue is empty", async () => {
    const queue = new AsyncQueue<number>(5);
    let dequeueResolved = false;
    const dequeuePromise = queue.dequeue().then((item) => {
      dequeueResolved = true;
      return item;
    });
    await Promise.resolve();
    expect(dequeueResolved).toBe(false);
    await queue.enqueue(99);
    const result = await dequeuePromise;
    expect(result).toBe(99);
    expect(dequeueResolved).toBe(true);
  });

  it("producer and consumer transfer all 10 items", async () => {
    const queue = new AsyncQueue<number>(3);
    const consumed: number[] = [];
    const originalConsumer = async () => {
      for (let i = 0; i < 10; i++) {
        consumed.push(await queue.dequeue());
      }
    };
    await Promise.all([producer(queue), originalConsumer()]);
    expect(consumed).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("size reflects current queue length", async () => {
    const queue = new AsyncQueue<number>(10);
    expect(queue.size).toBe(0);
    await queue.enqueue(1);
    await queue.enqueue(2);
    expect(queue.size).toBe(2);
    await queue.dequeue();
    expect(queue.size).toBe(1);
  });
});
