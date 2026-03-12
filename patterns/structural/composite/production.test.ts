import { describe, it, expect } from "vitest";
import { File, Directory } from "./production";

describe("Composite (Production)", () => {
  it("File.size returns its byte count", () => {
    const file = new File("readme.md", 500);
    expect(file.size()).toBe(500);
  });

  it("File.name is set correctly", () => {
    const file = new File("index.ts", 100);
    expect(file.name).toBe("index.ts");
  });

  it("empty Directory.size returns 0", () => {
    const dir = new Directory("empty");
    expect(dir.size()).toBe(0);
  });

  it("Directory.size sums children sizes", () => {
    const dir = new Directory("src");
    dir.add(new File("a.ts", 100));
    dir.add(new File("b.ts", 200));
    expect(dir.size()).toBe(300);
  });

  it("Directory.size recurses through nested directories", () => {
    const root = new Directory("root");
    const sub = new Directory("sub");
    sub.add(new File("a.ts", 100));
    root.add(sub);
    root.add(new File("b.ts", 200));
    expect(root.size()).toBe(300);
  });

  it("Directory.add returns this for chaining", () => {
    const dir = new Directory("src");
    const result = dir.add(new File("a.ts", 100));
    expect(result).toBe(dir);
  });

  it("Directory.remove removes a child by name", () => {
    const dir = new Directory("src");
    dir.add(new File("a.ts", 100));
    dir.add(new File("b.ts", 200));
    const removed = dir.remove("a.ts");
    expect(removed).toBe(true);
    expect(dir.size()).toBe(200);
  });

  it("Directory.remove returns false when name not found", () => {
    const dir = new Directory("src");
    expect(dir.remove("nonexistent")).toBe(false);
  });

  it("Directory.find locates a direct child", () => {
    const dir = new Directory("src");
    const file = new File("index.ts", 100);
    dir.add(file);
    expect(dir.find("index.ts")).toBe(file);
  });

  it("Directory.find locates a deeply nested file", () => {
    const root = new Directory("root");
    const sub = new Directory("sub");
    const deep = new File("deep.ts", 50);
    sub.add(deep);
    root.add(sub);
    expect(root.find("deep.ts")).toBe(deep);
  });

  it("Directory.find returns undefined when not found", () => {
    const dir = new Directory("src");
    expect(dir.find("nope")).toBeUndefined();
  });

  it("print does not throw on a complex tree", () => {
    const root = new Directory("project")
      .add(new Directory("src").add(new File("index.ts", 1200)))
      .add(new File("package.json", 300));
    expect(() => root.print()).not.toThrow();
  });
});
