import { describe, it, expect } from "vitest";
import { SubsystemA, SubsystemB, Facade } from "./conceptual";

describe("Facade (Conceptual)", () => {
  it("SubsystemA.operationA returns ready string", () => {
    expect(new SubsystemA().operationA()).toBe("SubsystemA: ready");
  });

  it("SubsystemA.operationA2 returns go string", () => {
    expect(new SubsystemA().operationA2()).toBe("SubsystemA: go!");
  });

  it("SubsystemB.operationB returns ready string", () => {
    expect(new SubsystemB().operationB()).toBe("SubsystemB: ready");
  });

  it("SubsystemB.operationB2 returns fire string", () => {
    expect(new SubsystemB().operationB2()).toBe("SubsystemB: fire!");
  });

  it("Facade.simpleOperation contains all subsystem outputs", () => {
    const facade = new Facade();
    const result = facade.simpleOperation();
    expect(result).toContain("SubsystemA: ready");
    expect(result).toContain("SubsystemB: ready");
    expect(result).toContain("SubsystemA: go!");
    expect(result).toContain("SubsystemB: fire!");
  });

  it("Facade.simpleOperation starts with initialization line", () => {
    const facade = new Facade();
    const result = facade.simpleOperation();
    expect(result.startsWith("Facade initialises subsystems:")).toBe(true);
  });

  it("Facade accepts custom subsystems", () => {
    const a = new SubsystemA();
    const b = new SubsystemB();
    const facade = new Facade(a, b);
    expect(facade.simpleOperation()).toContain("SubsystemA: ready");
  });

  it("Facade creates default subsystems when none provided", () => {
    const facade = new Facade();
    const result = facade.simpleOperation();
    expect(result).toContain("Facade triggers subsystems:");
  });

  it("simpleOperation output is newline-separated", () => {
    const facade = new Facade();
    const lines = facade.simpleOperation().split("\n");
    expect(lines.length).toBe(6);
  });
});
