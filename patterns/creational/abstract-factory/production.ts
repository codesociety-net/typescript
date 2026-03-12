// ── Cross-Database Abstract Factory ──────────────────────────────

export interface ConnectionOptions {
  host: string;
  port: number;
  database: string;
}

export interface DbConnection {
  readonly dialect: string;
  connect(options: ConnectionOptions): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

export interface QueryBuilder {
  select(table: string, columns?: string[]): QueryBuilder;
  where(condition: string, params?: unknown[]): QueryBuilder;
  limit(count: number): QueryBuilder;
  build(): { sql: string; params: unknown[] };
  execute<T = Record<string, unknown>>(): Promise<QueryResult<T>>;
}

export interface DatabaseFactory {
  createConnection(): DbConnection;
  createQueryBuilder(conn: DbConnection): QueryBuilder;
}

// PostgreSQL Family
export class PgConnection implements DbConnection {
  readonly dialect = "postgresql";
  private connected = false;
  async connect() { this.connected = true; }
  async disconnect() { this.connected = false; }
  isConnected() { return this.connected; }
}

export class PgQueryBuilder implements QueryBuilder {
  private parts = { table: "", columns: ["*"], conditions: [] as string[], params: [] as unknown[], limitCount: undefined as number | undefined };
  constructor(private conn: DbConnection) {}

  select(table: string, columns = ["*"]): this {
    this.parts.table = table;
    this.parts.columns = columns;
    return this;
  }

  where(condition: string, params: unknown[] = []): this {
    this.parts.conditions.push(condition);
    this.parts.params.push(...params);
    return this;
  }

  limit(count: number): this {
    this.parts.limitCount = count;
    return this;
  }

  build() {
    let sql = `SELECT ${this.parts.columns.join(", ")} FROM ${this.parts.table}`;
    if (this.parts.conditions.length) sql += ` WHERE ${this.parts.conditions.join(" AND ")}`;
    if (this.parts.limitCount !== undefined) sql += ` LIMIT ${this.parts.limitCount}`;
    return { sql, params: this.parts.params };
  }

  async execute<T = Record<string, unknown>>(): Promise<QueryResult<T>> {
    if (!this.conn.isConnected()) throw new Error("Not connected");
    return { rows: [] as T[], rowCount: 0 };
  }
}

export class PostgresFactory implements DatabaseFactory {
  createConnection() { return new PgConnection(); }
  createQueryBuilder(conn: DbConnection) { return new PgQueryBuilder(conn); }
}

// SQLite Family
export class SqliteConnection implements DbConnection {
  readonly dialect = "sqlite";
  private connected = false;
  async connect() { this.connected = true; }
  async disconnect() { this.connected = false; }
  isConnected() { return this.connected; }
}

export class SqliteQueryBuilder implements QueryBuilder {
  private parts = { table: "", columns: ["*"], conditions: [] as string[], params: [] as unknown[], limitCount: undefined as number | undefined };
  constructor(private conn: DbConnection) {}
  select(table: string, columns = ["*"]): this { this.parts.table = table; this.parts.columns = columns; return this; }
  where(condition: string, params: unknown[] = []): this { this.parts.conditions.push(condition); this.parts.params.push(...params); return this; }
  limit(count: number): this { this.parts.limitCount = count; return this; }
  build() {
    let sql = `SELECT ${this.parts.columns.join(", ")} FROM ${this.parts.table}`;
    if (this.parts.conditions.length) sql += ` WHERE ${this.parts.conditions.join(" AND ")}`;
    if (this.parts.limitCount !== undefined) sql += ` LIMIT ${this.parts.limitCount}`;
    return { sql, params: this.parts.params };
  }
  async execute<T = Record<string, unknown>>(): Promise<QueryResult<T>> {
    if (!this.conn.isConnected()) throw new Error("Not connected");
    return { rows: [] as T[], rowCount: 0 };
  }
}

export class SqliteFactory implements DatabaseFactory {
  createConnection() { return new SqliteConnection(); }
  createQueryBuilder(conn: DbConnection) { return new SqliteQueryBuilder(conn); }
}

// Factory Registry
export const factories: Record<string, () => DatabaseFactory> = {
  postgresql: () => new PostgresFactory(),
  sqlite: () => new SqliteFactory(),
};

export function getDatabaseFactory(dialect: string): DatabaseFactory {
  const create = factories[dialect];
  if (!create) throw new Error(`Unsupported dialect "${dialect}"`);
  return create();
}

