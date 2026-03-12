import { describe, it, expect } from "vitest";
import { Leaf, Composite } from "./conceptual";

describe("Composite (Conceptual)", () => {
  it("Leaf.operation returns its name wrapped", () => {
    const leaf = new Leaf("A");
    expect(leaf.operation()).toBe("Leaf(A)");
  });

  it("Leaf.isComposite returns false", () => {
    expect(new Leaf("X").isComposite()).toBe(false);
  });

  it("Composite.isComposite returns true", () => {
    expect(new Composite().isComposite()).toBe(true);
  });

  it("empty Composite.operation returns Branch()", () => {
    const composite = new Composite();
    expect(composite.operation()).toBe("Branch()");
  });

  it("Composite with one leaf returns Branch(Leaf(x))", () => {
    const composite = new Composite();
    composite.add(new Leaf("x"));
    expect(composite.operation()).toBe("Branch(Leaf(x))");
  });

  it("Composite with multiple leaves joins with +", () => {
    const composite = new Composite();
    composite.add(new Leaf("1"));
    composite.add(new Leaf("2"));
    expect(composite.operation()).toBe("Branch(Leaf(1)+Leaf(2))");
  });

  it("nested composites produce nested Branch() output", () => {
    const tree = new Composite();
    const branch = new Composite();
    branch.add(new Leaf("1"));
    branch.add(new Leaf("2"));
    tree.add(branch);
    tree.add(new Leaf("3"));
    expect(tree.operation()).toBe("Branch(Branch(Leaf(1)+Leaf(2))+Leaf(3))");
  });

  it("remove removes a child by reference", () => {
    const composite = new Composite();
    const leaf = new Leaf("x");
    composite.add(leaf);
    composite.remove(leaf);
    expect(composite.operation()).toBe("Branch()");
  });

  it("remove does not affect other children", () => {
    const composite = new Composite();
    const a = new Leaf("a");
    const b = new Leaf("b");
    composite.add(a);
    composite.add(b);
    composite.remove(a);
    expect(composite.operation()).toBe("Branch(Leaf(b))");
  });
});
