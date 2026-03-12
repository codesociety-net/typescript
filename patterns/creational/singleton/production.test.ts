import { describe, it, expect, beforeEach } from "vitest";
import { DatabasePool } from "./production";

describe("DatabasePool (Production Singleton)", () => {
  beforeEach(() => {
    DatabasePool.resetInstance();
  });

  it("returns a DatabasePool instance", async () => {
    const pool = await DatabasePool.getInstance();
    expect(pool).toBeInstanceOf(DatabasePool);
  });

  it("returns the same instance on subsequent calls", async () => {
    const a = await DatabasePool.getInstance();
    const b = await DatabasePool.getInstance();
    expect(a).toBe(b);
  });

  it("accepts custom config on first creation", async () => {
    const pool = await DatabasePool.getInstance({
      host: "db.example.com",
      port: 3306,
      database: "test",
      maxConnections: 5,
    });
    expect(pool).toBeInstanceOf(DatabasePool);
  });

  it("query returns a result array", async () => {
    const pool = await DatabasePool.getInstance();
    const result = await pool.query("SELECT 1");
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("query includes sql and params in result", async () => {
    const pool = await DatabasePool.getInstance();
    const result = await pool.query("SELECT * FROM users", ["param1"]);
    expect(result[0]).toMatchObject({
      sql: "SELECT * FROM users",
      params: ["param1"],
      result: "mock",
    });
  });

  it("throws when querying after shutdown", async () => {
    const pool = await DatabasePool.getInstance();
    await pool.shutdown();
    await expect(pool.query("SELECT 1")).rejects.toThrow("Pool has been shut down");
  });

  it("allows creating a new instance after shutdown and reset", async () => {
    const pool1 = await DatabasePool.getInstance();
    await pool1.shutdown();

    const pool2 = await DatabasePool.getInstance();
    expect(pool2).not.toBe(pool1);
    expect(pool2).toBeInstanceOf(DatabasePool);
  });

  it("concurrent getInstance calls return the same instance", async () => {
    const [a, b, c] = await Promise.all([
      DatabasePool.getInstance(),
      DatabasePool.getInstance(),
      DatabasePool.getInstance(),
    ]);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });
});
