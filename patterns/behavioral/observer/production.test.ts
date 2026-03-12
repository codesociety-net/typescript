import { describe, it, expect, vi } from "vitest";
import { TypedEventBus, AppEvents } from "./production";

describe("Observer — Typed Event Bus", () => {
  it("handler receives matching event", () => {
    const bus = new TypedEventBus<AppEvents>();
    const handler = vi.fn();

    bus.on("user:login", handler);
    bus.emit("user:login", { userId: "u1", timestamp: 100 });

    expect(handler).toHaveBeenCalledWith({ userId: "u1", timestamp: 100 });
  });

  it("handler does not receive events from other channels", () => {
    const bus = new TypedEventBus<AppEvents>();
    const loginHandler = vi.fn();
    const logoutHandler = vi.fn();

    bus.on("user:login", loginHandler);
    bus.on("user:logout", logoutHandler);
    bus.emit("user:login", { userId: "u1", timestamp: 100 });

    expect(loginHandler).toHaveBeenCalledTimes(1);
    expect(logoutHandler).not.toHaveBeenCalled();
  });

  it("unsubscribe function removes the handler", () => {
    const bus = new TypedEventBus<AppEvents>();
    const handler = vi.fn();

    const unsub = bus.on("user:logout", handler);
    bus.emit("user:logout", { userId: "u1" });
    unsub();
    bus.emit("user:logout", { userId: "u2" });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("once handler fires only one time", () => {
    const bus = new TypedEventBus<AppEvents>();
    const handler = vi.fn();

    bus.once("user:login", handler);
    bus.emit("user:login", { userId: "u1", timestamp: 1 });
    bus.emit("user:login", { userId: "u2", timestamp: 2 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ userId: "u1", timestamp: 1 });
  });

  it("filter option only delivers matching events", () => {
    const bus = new TypedEventBus<AppEvents>();
    const handler = vi.fn();

    bus.on("order:placed", handler, {
      filter: (e) => e.total > 500,
    });

    bus.emit("order:placed", { orderId: "o1", total: 100, userId: "u1" });
    bus.emit("order:placed", { orderId: "o2", total: 999, userId: "u2" });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ orderId: "o2", total: 999, userId: "u2" });
  });

  it("off removes all handlers for an event", () => {
    const bus = new TypedEventBus<AppEvents>();
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    bus.on("user:login", handlerA);
    bus.on("user:login", handlerB);
    bus.off("user:login");
    bus.emit("user:login", { userId: "u1", timestamp: 1 });

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });

  it("emitting an event with no handlers does not throw", () => {
    const bus = new TypedEventBus<AppEvents>();
    expect(() => bus.emit("user:logout", { userId: "u1" })).not.toThrow();
  });

  it("once with filter fires only when filter matches", () => {
    const bus = new TypedEventBus<AppEvents>();
    const handler = vi.fn();

    bus.once("order:placed", handler, {
      filter: (e) => e.total > 100,
    });

    bus.emit("order:placed", { orderId: "o1", total: 50, userId: "u1" });
    expect(handler).not.toHaveBeenCalled();

    bus.emit("order:placed", { orderId: "o2", total: 200, userId: "u2" });
    expect(handler).toHaveBeenCalledTimes(1);

    bus.emit("order:placed", { orderId: "o3", total: 300, userId: "u3" });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
