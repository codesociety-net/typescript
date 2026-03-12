import { describe, it, expect } from "vitest";
import { UserImportPipeline } from "./production";

describe("Template Method — ETL Pipeline", () => {
  it("run returns pipeline metrics", async () => {
    const pipeline = new UserImportPipeline();
    const metrics = await pipeline.run("users.csv");

    expect(metrics.source).toBe("users.csv");
    expect(typeof metrics.extractedCount).toBe("number");
    expect(typeof metrics.transformedCount).toBe("number");
    expect(typeof metrics.loadedCount).toBe("number");
    expect(typeof metrics.errorCount).toBe("number");
    expect(typeof metrics.durationMs).toBe("number");
  });

  it("extracts 3 raw records from the hardcoded data", async () => {
    const pipeline = new UserImportPipeline();
    const metrics = await pipeline.run("source");
    expect(metrics.extractedCount).toBe(3);
  });

  it("transforms valid records and skips invalid ones", async () => {
    const pipeline = new UserImportPipeline();
    const metrics = await pipeline.run("source");
    // Alice is valid, Bob is valid, third record (empty name) returns null
    expect(metrics.transformedCount).toBe(2);
  });

  it("loads the transformed records into the database", async () => {
    const pipeline = new UserImportPipeline();
    await pipeline.run("source");
    const db = pipeline.getDb();
    expect(db).toHaveLength(2);
    expect(db.map(u => u.name)).toContain("Alice");
    expect(db.map(u => u.name)).toContain("Bob");
  });

  it("loadedCount matches the number of successfully loaded records", async () => {
    const pipeline = new UserImportPipeline();
    const metrics = await pipeline.run("source");
    expect(metrics.loadedCount).toBe(2);
  });

  it("errorCount is 0 because the invalid record returns null, not throw", async () => {
    const pipeline = new UserImportPipeline();
    const metrics = await pipeline.run("source");
    // The third record has empty name so transform returns null (no error)
    // No exceptions are thrown
    expect(metrics.errorCount).toBe(0);
  });

  it("durationMs is a non-negative number", async () => {
    const pipeline = new UserImportPipeline();
    const metrics = await pipeline.run("source");
    expect(metrics.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("running the pipeline twice accumulates records in db", async () => {
    const pipeline = new UserImportPipeline();
    await pipeline.run("first");
    await pipeline.run("second");
    expect(pipeline.getDb()).toHaveLength(4);
  });

  it("transformed users have correct fields", async () => {
    const pipeline = new UserImportPipeline();
    await pipeline.run("source");
    const alice = pipeline.getDb().find(u => u.name === "Alice")!;
    expect(alice.email).toBe("alice@example.com");
    expect(alice.createdAt).toBeInstanceOf(Date);
    expect(typeof alice.id).toBe("string");
  });
});
