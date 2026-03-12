import { describe, it, expect } from "vitest";
import { Adaptee, Adapter, clientCode } from "./conceptual";

describe("Adapter (Conceptual)", () => {
  it("Adaptee returns its specific behaviour string", () => {
    const adaptee = new Adaptee();
    expect(adaptee.specificRequest()).toBe("Adaptee: specific behaviour");
  });

  it("Adapter reverses the Adaptee output and wraps it", () => {
    const adaptee = new Adaptee();
    const adapter = new Adapter(adaptee);
    const reversed = "Adaptee: specific behaviour".split("").reverse().join("");
    expect(adapter.request()).toBe(`Adapter: (translated) ${reversed}`);
  });

  it("Adapter conforms to the Target interface (has request method)", () => {
    const adapter = new Adapter(new Adaptee());
    expect(typeof adapter.request).toBe("function");
  });

  it("Adapter wraps any Adaptee instance", () => {
    const a1 = new Adaptee();
    const a2 = new Adaptee();
    const adapter1 = new Adapter(a1);
    const adapter2 = new Adapter(a2);
    expect(adapter1.request()).toBe(adapter2.request());
  });

  it("clientCode calls request() on the target without error", () => {
    const adapter = new Adapter(new Adaptee());
    expect(() => clientCode(adapter)).not.toThrow();
  });

  it("Adapter result contains the translated marker", () => {
    const adapter = new Adapter(new Adaptee());
    expect(adapter.request()).toContain("Adapter: (translated)");
  });

  it("Adapter result does not equal the raw Adaptee output", () => {
    const adaptee = new Adaptee();
    const adapter = new Adapter(adaptee);
    expect(adapter.request()).not.toBe(adaptee.specificRequest());
  });
});
