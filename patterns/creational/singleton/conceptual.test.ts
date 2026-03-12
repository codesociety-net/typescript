import { describe, it, expect } from "vitest";
import { Singleton } from "./conceptual";

describe("Singleton (Conceptual)", () => {
  it("returns an instance via getInstance()", () => {
    const instance = Singleton.getInstance();
    expect(instance).toBeInstanceOf(Singleton);
  });

  it("returns the same instance on multiple calls", () => {
    const a = Singleton.getInstance();
    const b = Singleton.getInstance();
    expect(a).toBe(b);
  });

  it("has a doSomething method", () => {
    const instance = Singleton.getInstance();
    expect(typeof instance.doSomething).toBe("function");
  });

  it("doSomething executes without throwing", () => {
    const instance = Singleton.getInstance();
    expect(() => instance.doSomething()).not.toThrow();
  });

  it("strict equality holds across separate variable references", () => {
    const refs = Array.from({ length: 5 }, () => Singleton.getInstance());
    for (const ref of refs) {
      expect(ref).toBe(refs[0]);
    }
  });
});
