import { describe, it, expect } from "vitest";
import { Shape, GroupShape, ShapeRegistry } from "./conceptual";

describe("Prototype (Conceptual)", () => {
  describe("Shape", () => {
    it("clone creates a new instance with the same properties", () => {
      const original = new Shape("circle", 10, 20, "red");
      const cloned = original.clone();
      expect(cloned).not.toBe(original);
      expect(cloned.type).toBe("circle");
      expect(cloned.x).toBe(10);
      expect(cloned.y).toBe(20);
      expect(cloned.color).toBe("red");
    });

    it("clone produces an independent copy", () => {
      const original = new Shape("square", 0, 0, "blue");
      const cloned = original.clone();
      cloned.x = 100;
      cloned.y = 200;
      cloned.color = "green";
      expect(original.x).toBe(0);
      expect(original.y).toBe(0);
      expect(original.color).toBe("blue");
    });

    it("toString returns a formatted description", () => {
      const shape = new Shape("rectangle", 5, 15, "yellow");
      expect(shape.toString()).toBe("yellow rectangle at (5, 15)");
    });

    it("cloned shape has the same toString output initially", () => {
      const original = new Shape("triangle", 3, 7, "pink");
      const cloned = original.clone();
      expect(cloned.toString()).toBe(original.toString());
    });
  });

  describe("GroupShape", () => {
    it("clone creates a new group with cloned shapes", () => {
      const s1 = new Shape("circle", 0, 0, "red");
      const s2 = new Shape("square", 1, 1, "blue");
      const group = new GroupShape("myGroup", [s1, s2]);
      const clonedGroup = group.clone();

      expect(clonedGroup).not.toBe(group);
      expect(clonedGroup.name).toBe("myGroup");
      expect(clonedGroup.shapes.length).toBe(2);
    });

    it("cloned group shapes are independent", () => {
      const s1 = new Shape("circle", 0, 0, "red");
      const group = new GroupShape("g", [s1]);
      const clonedGroup = group.clone();

      clonedGroup.shapes[0].x = 999;
      expect(s1.x).toBe(0);
      expect(group.shapes[0].x).toBe(0);
    });
  });

  describe("ShapeRegistry", () => {
    it("creates clones from registered templates", () => {
      const registry = new ShapeRegistry();
      registry.register("red-circle", new Shape("circle", 0, 0, "red"));

      const shape = registry.create("red-circle");
      expect(shape.type).toBe("circle");
      expect(shape.color).toBe("red");
    });

    it("each create call returns a new independent instance", () => {
      const registry = new ShapeRegistry();
      registry.register("dot", new Shape("dot", 0, 0, "black"));

      const a = registry.create("dot");
      const b = registry.create("dot");
      expect(a).not.toBe(b);

      a.x = 50;
      expect(b.x).toBe(0);
    });

    it("throws for unregistered template key", () => {
      const registry = new ShapeRegistry();
      expect(() => registry.create("missing")).toThrow('No template: "missing"');
    });

    it("modifying a clone does not affect the template", () => {
      const registry = new ShapeRegistry();
      registry.register("star", new Shape("star", 0, 0, "gold"));

      const clone = registry.create("star");
      clone.color = "silver";
      clone.x = 100;

      const fresh = registry.create("star");
      expect(fresh.color).toBe("gold");
      expect(fresh.x).toBe(0);
    });
  });
});
