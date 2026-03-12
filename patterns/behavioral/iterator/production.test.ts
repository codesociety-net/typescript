import { describe, it, expect, vi } from "vitest";
import { PaginatedIterator, collectAll, FetchPage, Page } from "./production";

describe("Iterator — Paginated API Iterator", () => {
  function makeFetchPage<T>(pages: T[][], pageSize: number): FetchPage<T> {
    return async (cursor, _size): Promise<Page<T>> => {
      const pageIndex = cursor ? parseInt(cursor, 10) : 0;
      const items = pages[pageIndex] ?? [];
      const nextCursor = pageIndex + 1 < pages.length ? String(pageIndex + 1) : null;
      return { items, nextCursor, totalCount: pages.flat().length };
    };
  }

  it("iterates through all items across multiple pages", async () => {
    const fetchPage = makeFetchPage([[1, 2], [3, 4], [5]], 2);
    const results: number[] = [];

    const iter = new PaginatedIterator(fetchPage, 2);
    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns done when there are no items", async () => {
    const fetchPage = makeFetchPage<number>([], 10);
    const iter = new PaginatedIterator(fetchPage, 10);
    const result = await iter.next();
    expect(result.done).toBe(true);
  });

  it("respects maxItems limit", async () => {
    const fetchPage = makeFetchPage([[1, 2, 3], [4, 5, 6]], 3);
    const iter = new PaginatedIterator(fetchPage, 3, 4);
    const results: number[] = [];

    for await (const item of iter) {
      results.push(item);
    }

    expect(results).toEqual([1, 2, 3, 4]);
  });

  it("collectAll gathers all items into an array", async () => {
    const fetchPage = makeFetchPage([["a", "b"], ["c"]], 2);
    const results = await collectAll(fetchPage);
    expect(results).toEqual(["a", "b", "c"]);
  });

  it("collectAll respects maxItems option", async () => {
    const fetchPage = makeFetchPage([["a", "b"], ["c", "d"]], 2);
    const results = await collectAll(fetchPage, { maxItems: 3 });
    expect(results).toEqual(["a", "b", "c"]);
  });

  it("fetchPage is called with correct cursor values", async () => {
    const spy = vi.fn(async (cursor: string | null, _size: number): Promise<Page<number>> => {
      if (cursor === null) return { items: [1], nextCursor: "page2", totalCount: 2 };
      return { items: [2], nextCursor: null, totalCount: 2 };
    });

    const results = await collectAll(spy);
    expect(results).toEqual([1, 2]);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, null, 20); // default pageSize
    expect(spy).toHaveBeenNthCalledWith(2, "page2", 20);
  });

  it("single page with no next cursor stops iteration", async () => {
    const fetchPage = makeFetchPage([[10, 20, 30]], 10);
    const results = await collectAll(fetchPage);
    expect(results).toEqual([10, 20, 30]);
  });

  it("PaginatedIterator implements Symbol.asyncIterator", () => {
    const fetchPage = makeFetchPage<number>([], 10);
    const iter = new PaginatedIterator(fetchPage, 10);
    expect(iter[Symbol.asyncIterator]()).toBe(iter);
  });
});
