import { describe, it, expect, vi } from "vitest";
import {
  VectorRenderer,
  RasterRenderer,
  Circle,
  Square,
} from "./conceptual";

describe("Bridge (Conceptual)", () => {
  it("Circle.draw delegates to renderer.renderCircle", () => {
    const renderer = new VectorRenderer();
    const spy = vi.spyOn(renderer, "renderCircle");
    const circle = new Circle(renderer, 5);
    circle.draw();
    expect(spy).toHaveBeenCalledWith(5);
  });

  it("Square.draw delegates to renderer.renderSquare", () => {
    const renderer = new RasterRenderer();
    const spy = vi.spyOn(renderer, "renderSquare");
    const square = new Square(renderer, 10);
    square.draw();
    expect(spy).toHaveBeenCalledWith(10);
  });

  it("Circle.resize scales the radius before drawing", () => {
    const renderer = new VectorRenderer();
    const spy = vi.spyOn(renderer, "renderCircle");
    const circle = new Circle(renderer, 5);
    circle.resize(2);
    circle.draw();
    expect(spy).toHaveBeenCalledWith(10);
  });

  it("Square.resize scales the side before drawing", () => {
    const renderer = new RasterRenderer();
    const spy = vi.spyOn(renderer, "renderSquare");
    const square = new Square(renderer, 4);
    square.resize(3);
    square.draw();
    expect(spy).toHaveBeenCalledWith(12);
  });

  it("same shape can use different renderers (vector)", () => {
    const vector = new VectorRenderer();
    const spy = vi.spyOn(vector, "renderCircle");
    new Circle(vector, 7).draw();
    expect(spy).toHaveBeenCalledWith(7);
  });

  it("same shape can use different renderers (raster)", () => {
    const raster = new RasterRenderer();
    const spy = vi.spyOn(raster, "renderCircle");
    new Circle(raster, 7).draw();
    expect(spy).toHaveBeenCalledWith(7);
  });

  it("VectorRenderer and RasterRenderer are interchangeable via the Renderer interface", () => {
    const vector = new VectorRenderer();
    const raster = new RasterRenderer();
    expect(typeof vector.renderCircle).toBe("function");
    expect(typeof vector.renderSquare).toBe("function");
    expect(typeof raster.renderCircle).toBe("function");
    expect(typeof raster.renderSquare).toBe("function");
  });
});
