import { describe, it, expect, vi } from "vitest";
import { EventEmitter, StockUpdate } from "./conceptual";

describe("Observer (Conceptual)", () => {
  it("subscriber receives emitted events", () => {
    const emitter = new EventEmitter<StockUpdate>();
    const listener = vi.fn();

    emitter.subscribe(listener);
    emitter.emit({ symbol: "AAPL", price: 182.5 });

    expect(listener).toHaveBeenCalledWith({ symbol: "AAPL", price: 182.5 });
  });

  it("multiple subscribers all receive the event", () => {
    const emitter = new EventEmitter<string>();
    const listenerA = vi.fn();
    const listenerB = vi.fn();

    emitter.subscribe(listenerA);
    emitter.subscribe(listenerB);
    emitter.emit("hello");

    expect(listenerA).toHaveBeenCalledWith("hello");
    expect(listenerB).toHaveBeenCalledWith("hello");
  });

  it("unsubscribe prevents further notifications", () => {
    const emitter = new EventEmitter<string>();
    const listener = vi.fn();

    emitter.subscribe(listener);
    emitter.emit("first");
    emitter.unsubscribe(listener);
    emitter.emit("second");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("first");
  });

  it("subscribe returns an unsubscribe function", () => {
    const emitter = new EventEmitter<number>();
    const listener = vi.fn();

    const unsub = emitter.subscribe(listener);
    emitter.emit(1);
    unsub();
    emitter.emit(2);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it("emitting with no subscribers does not throw", () => {
    const emitter = new EventEmitter<string>();
    expect(() => emitter.emit("test")).not.toThrow();
  });

  it("unsubscribing a non-existent listener is safe", () => {
    const emitter = new EventEmitter<string>();
    const listener = vi.fn();
    expect(() => emitter.unsubscribe(listener)).not.toThrow();
  });

  it("events are delivered in subscription order", () => {
    const emitter = new EventEmitter<string>();
    const order: number[] = [];

    emitter.subscribe(() => order.push(1));
    emitter.subscribe(() => order.push(2));
    emitter.subscribe(() => order.push(3));
    emitter.emit("go");

    expect(order).toEqual([1, 2, 3]);
  });
});
