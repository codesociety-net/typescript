import { describe, it, expect } from "vitest";
import { BubbleSort, QuickSort, Sorter } from "./conceptual";

describe("Strategy (Conceptual)", () => {
  it("BubbleSort sorts numbers in ascending order", () => {
    const strategy = new BubbleSort<number>();
    expect(strategy.sort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5]);
  });

  it("QuickSort sorts numbers in ascending order", () => {
    const strategy = new QuickSort<number>();
    expect(strategy.sort([5, 3, 1, 4, 2])).toEqual([1, 2, 3, 4, 5]);
  });

  it("BubbleSort does not mutate the original array", () => {
    const original = [3, 1, 2];
    new BubbleSort<number>().sort(original);
    expect(original).toEqual([3, 1, 2]);
  });

  it("Sorter delegates to the provided strategy", () => {
    const sorter = new Sorter(new BubbleSort<number>());
    expect(sorter.sort([4, 2, 3, 1])).toEqual([1, 2, 3, 4]);
  });

  it("setStrategy swaps the sorting algorithm at runtime", () => {
    const sorter = new Sorter(new BubbleSort<number>());
    const result1 = sorter.sort([3, 1, 2]);
    expect(result1).toEqual([1, 2, 3]);

    sorter.setStrategy(new QuickSort<number>());
    const result2 = sorter.sort([6, 4, 5]);
    expect(result2).toEqual([4, 5, 6]);
  });

  it("BubbleSort handles empty array", () => {
    expect(new BubbleSort<number>().sort([])).toEqual([]);
  });

  it("QuickSort handles single element", () => {
    expect(new QuickSort<number>().sort([42])).toEqual([42]);
  });

  it("BubbleSort handles already-sorted array", () => {
    expect(new BubbleSort<number>().sort([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("QuickSort handles array with duplicates", () => {
    expect(new QuickSort<number>().sort([3, 1, 3, 2, 1])).toEqual([1, 1, 2, 3, 3]);
  });

  it("strategies produce identical results for the same input", () => {
    const data = [9, 7, 5, 3, 1, 8, 6, 4, 2];
    const bubble = new BubbleSort<number>().sort(data);
    const quick = new QuickSort<number>().sort(data);
    expect(bubble).toEqual(quick);
  });
});
