import { describe, it, expect } from "vitest";
import { CsvMiner, JsonMiner } from "./conceptual";

describe("Template Method (Conceptual)", () => {
  it("CsvMiner.mine returns parsed CSV lines", () => {
    const miner = new CsvMiner();
    const result = miner.mine("report.csv");
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it("CsvMiner extracts content referencing the source", () => {
    const miner = new CsvMiner();
    const result = miner.mine("data.csv");
    // extractData returns "CSV content of data.csv", which is a single line
    expect(result).toEqual(["CSV content of data.csv"]);
  });

  it("JsonMiner.mine parses JSON data", () => {
    const miner = new JsonMiner();
    const result = miner.mine("api/v1/data");
    expect(result).toContain("a");
    expect(result).toContain("c");
  });

  it("JsonMiner applies filterData hook to remove item b", () => {
    const miner = new JsonMiner();
    const result = miner.mine("api/v1/data");
    expect(result).not.toContain("b");
    expect(result).toEqual(["a", "c"]);
  });

  it("CsvMiner does not filter (default hook)", () => {
    const miner = new CsvMiner();
    const result = miner.mine("report.csv");
    // default filterData returns data unchanged
    expect(result).toEqual(["CSV content of report.csv"]);
  });

  it("mine method returns the filtered results", () => {
    const miner = new JsonMiner();
    const result = miner.mine("source");
    expect(Array.isArray(result)).toBe(true);
  });

  it("different miners produce different results from same source", () => {
    const csv = new CsvMiner().mine("test");
    const json = new JsonMiner().mine("test");
    expect(csv).not.toEqual(json);
  });
});
