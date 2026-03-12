import { describe, it, expect } from "vitest";
import {
  PgConnection,
  PgQueryBuilder,
  PostgresFactory,
  SqliteConnection,
  SqliteQueryBuilder,
  SqliteFactory,
  getDatabaseFactory,
} from "./production";

describe("Database Abstract Factory (Production)", () => {
  describe("PostgresFactory", () => {
    const factory = new PostgresFactory();

    it("createConnection returns a PgConnection", () => {
      expect(factory.createConnection()).toBeInstanceOf(PgConnection);
    });

    it("PgConnection has dialect 'postgresql'", () => {
      const conn = factory.createConnection();
      expect(conn.dialect).toBe("postgresql");
    });

    it("PgConnection starts disconnected", () => {
      const conn = factory.createConnection();
      expect(conn.isConnected()).toBe(false);
    });

    it("PgConnection connects and disconnects", async () => {
      const conn = factory.createConnection();
      await conn.connect({} as any);
      expect(conn.isConnected()).toBe(true);
      await conn.disconnect();
      expect(conn.isConnected()).toBe(false);
    });

    it("createQueryBuilder returns a PgQueryBuilder", () => {
      const conn = factory.createConnection();
      const qb = factory.createQueryBuilder(conn);
      expect(qb).toBeInstanceOf(PgQueryBuilder);
    });

    it("PgQueryBuilder builds a SELECT query", () => {
      const conn = factory.createConnection();
      const qb = factory.createQueryBuilder(conn);
      const { sql, params } = qb.select("users", ["id", "name"]).build();
      expect(sql).toBe("SELECT id, name FROM users");
      expect(params).toEqual([]);
    });

    it("PgQueryBuilder builds query with WHERE and LIMIT", () => {
      const conn = factory.createConnection();
      const qb = factory.createQueryBuilder(conn);
      const { sql, params } = qb
        .select("orders")
        .where("status = $1", ["active"])
        .limit(10)
        .build();
      expect(sql).toBe("SELECT * FROM orders WHERE status = $1 LIMIT 10");
      expect(params).toEqual(["active"]);
    });

    it("execute throws when not connected", async () => {
      const conn = factory.createConnection();
      const qb = factory.createQueryBuilder(conn);
      await expect(qb.select("t").execute()).rejects.toThrow("Not connected");
    });

    it("execute returns result when connected", async () => {
      const conn = factory.createConnection();
      await conn.connect({} as any);
      const qb = factory.createQueryBuilder(conn);
      const result = await qb.select("t").execute();
      expect(result).toEqual({ rows: [], rowCount: 0 });
    });
  });

  describe("SqliteFactory", () => {
    const factory = new SqliteFactory();

    it("createConnection returns a SqliteConnection", () => {
      expect(factory.createConnection()).toBeInstanceOf(SqliteConnection);
    });

    it("SqliteConnection has dialect 'sqlite'", () => {
      expect(factory.createConnection().dialect).toBe("sqlite");
    });

    it("SqliteQueryBuilder builds query with chained methods", () => {
      const conn = factory.createConnection();
      const qb = factory.createQueryBuilder(conn);
      const { sql } = qb.select("items", ["name"]).where("qty > ?").limit(5).build();
      expect(sql).toBe("SELECT name FROM items WHERE qty > ? LIMIT 5");
    });
  });

  describe("getDatabaseFactory registry", () => {
    it("returns PostgresFactory for 'postgresql'", () => {
      const f = getDatabaseFactory("postgresql");
      expect(f).toBeInstanceOf(PostgresFactory);
    });

    it("returns SqliteFactory for 'sqlite'", () => {
      const f = getDatabaseFactory("sqlite");
      expect(f).toBeInstanceOf(SqliteFactory);
    });

    it("throws for unsupported dialect", () => {
      expect(() => getDatabaseFactory("oracle")).toThrow('Unsupported dialect "oracle"');
    });
  });
});
