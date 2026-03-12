import { describe, it, expect } from "vitest";
import { InvalidTransitionError, Order } from "./production";

describe("State — Order Lifecycle", () => {
  const items = [{ sku: "ITEM1", quantity: 2, price: 25 }];

  it("new order starts in pending state", () => {
    const order = new Order("o1", items);
    expect(order.status).toBe("pending");
  });

  it("computes total from items", () => {
    const order = new Order("o1", items);
    expect(order.context.total).toBe(50);
  });

  it("pending -> confirmed transition", () => {
    const order = new Order("o1", items);
    order.confirm();
    expect(order.status).toBe("confirmed");
  });

  it("confirmed -> processing transition", () => {
    const order = new Order("o1", items);
    order.confirm();
    order.process();
    expect(order.status).toBe("processing");
  });

  it("processing -> shipped transition", () => {
    const order = new Order("o1", items);
    order.confirm();
    order.process();
    order.ship("TRACK123");
    expect(order.status).toBe("shipped");
  });

  it("shipped -> delivered transition", () => {
    const order = new Order("o1", items);
    order.confirm();
    order.process();
    order.ship("TRACK123");
    order.deliver();
    expect(order.status).toBe("delivered");
  });

  it("delivered -> refunded transition", () => {
    const order = new Order("o1", items);
    order.confirm();
    order.process();
    order.ship("TRACK123");
    order.deliver();
    order.refund();
    expect(order.status).toBe("refunded");
  });

  it("pending order can be cancelled", () => {
    const order = new Order("o1", items);
    order.cancel("Changed mind");
    expect(order.status).toBe("cancelled");
  });

  it("confirmed order can be cancelled", () => {
    const order = new Order("o1", items);
    order.confirm();
    order.cancel("Out of stock");
    expect(order.status).toBe("cancelled");
  });

  it("processing order cannot be cancelled", () => {
    const order = new Order("o1", items);
    order.confirm();
    order.process();
    expect(() => order.cancel("reason")).toThrow(InvalidTransitionError);
  });

  it("pending order cannot be shipped", () => {
    const order = new Order("o1", items);
    expect(() => order.ship("TRACK")).toThrow(InvalidTransitionError);
  });

  it("cancelled order cannot be confirmed", () => {
    const order = new Order("o1", items);
    order.cancel("No reason");
    expect(() => order.confirm()).toThrow(InvalidTransitionError);
  });

  it("status history tracks all transitions", () => {
    const order = new Order("o1", items);
    order.confirm();
    order.process();

    const statuses = order.context.statusHistory.map(h => h.status);
    expect(statuses).toEqual(["pending", "confirmed", "processing"]);
  });

  it("error message includes from and to states", () => {
    const order = new Order("o1", items);
    try {
      order.deliver();
    } catch (e) {
      expect((e as Error).message).toContain("pending");
      expect((e as Error).message).toContain("delivered");
    }
  });
});
