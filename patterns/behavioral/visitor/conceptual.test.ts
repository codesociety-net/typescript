import { describe, it, expect } from "vitest";
import { Circle, Rectangle, Triangle, ShapeVisitor, Shape } from "./conceptual";

describe("Visitor (Conceptual)", () => {
  const areaVisitor: ShapeVisitor = {
    visitCircle: (s) => Math.PI * s.radius ** 2,
    visitRectangle: (s) => s.width * s.height,
    visitTriangle: (s) => 0.5 * s.base * s.height,
  };

  const perimeterVisitor: ShapeVisitor = {
    visitCircle: (s) => 2 * Math.PI * s.radius,
    visitRectangle: (s) => 2 * (s.width + s.height),
    visitTriangle: (s) => s.base + s.sideA + s.sideB,
  };

  it("Circle dispatches to visitCircle", () => {
    const circle = new Circle(5);
    const area = circle.accept(areaVisitor);
    expect(area).toBeCloseTo(Math.PI * 25);
  });

  it("Rectangle dispatches to visitRectangle", () => {
    const rect = new Rectangle(4, 6);
    const area = rect.accept(areaVisitor);
    expect(area).toBe(24);
  });

  it("Triangle dispatches to visitTriangle", () => {
    const tri = new Triangle(3, 4, 3, 5);
    const area = tri.accept(areaVisitor);
    expect(area).toBe(6);
  });

  it("perimeter visitor computes circle perimeter", () => {
    const circle = new Circle(5);
    expect(circle.accept(perimeterVisitor)).toBeCloseTo(2 * Math.PI * 5);
  });

  it("perimeter visitor computes rectangle perimeter", () => {
    const rect = new Rectangle(4, 6);
    expect(rect.accept(perimeterVisitor)).toBe(20);
  });

  it("perimeter visitor computes triangle perimeter", () => {
    const tri = new Triangle(3, 4, 3, 5);
    expect(tri.accept(perimeterVisitor)).toBe(11); // 3 + 3 + 5
  });

  it("same visitor works across a collection of shapes", () => {
    const shapes: Shape[] = [
      new Circle(1),
      new Rectangle(2, 3),
      new Triangle(4, 5, 4, 6),
    ];

    const areas = shapes.map((s) => s.accept(areaVisitor));
    expect(areas[0]).toBeCloseTo(Math.PI);
    expect(areas[1]).toBe(6);
    expect(areas[2]).toBe(10);
  });

  it("different visitors produce different results on the same shape", () => {
    const circle = new Circle(10);
    const area = circle.accept(areaVisitor);
    const perimeter = circle.accept(perimeterVisitor);
    expect(area).not.toBe(perimeter);
  });

  it("shapes expose their properties", () => {
    const circle = new Circle(7);
    expect(circle.radius).toBe(7);

    const rect = new Rectangle(3, 4);
    expect(rect.width).toBe(3);
    expect(rect.height).toBe(4);

    const tri = new Triangle(5, 6, 7, 8);
    expect(tri.base).toBe(5);
    expect(tri.height).toBe(6);
    expect(tri.sideA).toBe(7);
    expect(tri.sideB).toBe(8);
  });
});
