import { describe, it, expect } from "vitest";
import { Character, CharacterFactory, type CharacterStyle } from "./conceptual";

describe("Flyweight (Conceptual)", () => {
  const style: CharacterStyle = { font: "Arial", size: 12, bold: false };
  const boldStyle: CharacterStyle = { font: "Arial", size: 12, bold: true };

  it("Character stores char and style", () => {
    const ch = new Character("A", style);
    expect(ch.char).toBe("A");
    expect(ch.style).toEqual(style);
  });

  it("Character.render does not throw", () => {
    const ch = new Character("B", style);
    expect(() => ch.render(0, 0)).not.toThrow();
  });

  it("factory returns same instance for identical key", () => {
    const factory = new CharacterFactory();
    const a1 = factory.get("A", style);
    const a2 = factory.get("A", style);
    expect(a1).toBe(a2);
  });

  it("factory returns different instances for different chars", () => {
    const factory = new CharacterFactory();
    const a = factory.get("A", style);
    const b = factory.get("B", style);
    expect(a).not.toBe(b);
  });

  it("factory returns different instances for different styles", () => {
    const factory = new CharacterFactory();
    const normal = factory.get("A", style);
    const bold = factory.get("A", boldStyle);
    expect(normal).not.toBe(bold);
  });

  it("poolSize tracks unique flyweights", () => {
    const factory = new CharacterFactory();
    factory.get("A", style);
    factory.get("B", style);
    factory.get("A", style); // reuse
    expect(factory.poolSize).toBe(2);
  });

  it("rendering ABBA creates only 2 flyweights", () => {
    const factory = new CharacterFactory();
    ["A", "B", "B", "A"].forEach((ch) => factory.get(ch, style));
    expect(factory.poolSize).toBe(2);
  });

  it("poolSize starts at 0", () => {
    const factory = new CharacterFactory();
    expect(factory.poolSize).toBe(0);
  });
});
