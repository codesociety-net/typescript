import { describe, it, expect } from "vitest";
import { NumberRange, RangeIterator } from "./conceptual";

describe("Iterator (Conceptual)", () => {
  it("iterates through a range with step 1", () => {
    const range = new NumberRange(1, 5);
    const iter = range.createIterator();
    const values: number[] = [];

    while (iter.hasNext()) {
      values.push(iter.next());
    }

    expect(values).toEqual([1, 2, 3, 4, 5]);
  });

  it("iterates with a custom step", () => {
    const range = new NumberRange(1, 10, 2);
    const iter = range.createIterator();
    const values: number[] = [];

    while (iter.hasNext()) {
      values.push(iter.next());
    }

    expect(values).toEqual([1, 3, 5, 7, 9]);
  });

  it("hasNext returns false when range is exhausted", () => {
    const range = new NumberRange(1, 1);
    const iter = range.createIterator();
    expect(iter.hasNext()).toBe(true);
    iter.next();
    expect(iter.hasNext()).toBe(false);
  });

  it("next throws when no more elements", () => {
    const range = new NumberRange(1, 1);
    const iter = range.createIterator();
    iter.next();
    expect(() => iter.next()).toThrow("No more elements");
  });

  it("empty range (start > end) has no elements", () => {
    const range = new NumberRange(10, 5);
    const iter = range.createIterator();
    expect(iter.hasNext()).toBe(false);
  });

  it("single element range works", () => {
    const range = new NumberRange(42, 42);
    const iter = range.createIterator();
    expect(iter.hasNext()).toBe(true);
    expect(iter.next()).toBe(42);
    expect(iter.hasNext()).toBe(false);
  });

  it("createIterator returns independent iterators", () => {
    const range = new NumberRange(1, 3);
    const iter1 = range.createIterator();
    const iter2 = range.createIterator();

    iter1.next(); // advance iter1 to 2

    expect(iter1.next()).toBe(2);
    expect(iter2.next()).toBe(1); // iter2 is independent
  });

  it("RangeIterator can be constructed directly", () => {
    const iter = new RangeIterator(0, 2, 1);
    expect(iter.next()).toBe(0);
    expect(iter.next()).toBe(1);
    expect(iter.next()).toBe(2);
    expect(iter.hasNext()).toBe(false);
  });

  it("large step skips over end boundary", () => {
    const range = new NumberRange(0, 10, 7);
    const iter = range.createIterator();
    const values: number[] = [];
    while (iter.hasNext()) values.push(iter.next());
    expect(values).toEqual([0, 7]);
  });
});
