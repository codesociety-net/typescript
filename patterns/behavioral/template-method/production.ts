// ── ETL Pipeline with Template Method ─────────────────────────────

export interface PipelineMetrics {
  source: string;
  extractedCount: number;
  transformedCount: number;
  loadedCount: number;
  errorCount: number;
  durationMs: number;
}

export interface PipelineRecord {
  id: string;
  [key: string]: unknown;
}

export abstract class ETLPipeline<TRaw, TTransformed extends PipelineRecord> {
  private metrics: Partial<PipelineMetrics> = {};

  // Template method — orchestrates the full ETL flow
  async run(source: string): Promise<PipelineMetrics> {
    const start = Date.now();
    this.metrics = { source, errorCount: 0 };

    await this.beforeExtract(source);
    const rawRecords = await this.extract(source);
    this.metrics.extractedCount = rawRecords.length;

    const transformed: TTransformed[] = [];
    for (const record of rawRecords) {
      try {
        const result = await this.transform(record);
        if (result) transformed.push(result);
      } catch (err) {
        this.metrics.errorCount = (this.metrics.errorCount ?? 0) + 1;
        this.onTransformError(record, err as Error);
      }
    }
    this.metrics.transformedCount = transformed.length;

    const loaded = await this.load(transformed);
    this.metrics.loadedCount = loaded;

    await this.afterLoad(transformed);

    return { ...this.metrics, durationMs: Date.now() - start } as PipelineMetrics;
  }

  // Abstract steps — subclasses must implement
  protected abstract extract(source: string): Promise<TRaw[]>;
  protected abstract transform(record: TRaw): Promise<TTransformed | null>;
  protected abstract load(records: TTransformed[]): Promise<number>;

  // Hooks — subclasses may override
  protected async beforeExtract(_source: string): Promise<void> {}
  protected async afterLoad(_records: TTransformed[]): Promise<void> {}
  protected onTransformError(record: TRaw, error: Error): void {
    console.error("Transform error:", error.message, record);
  }
}

// ── Concrete Pipeline ─────────────────────────────────────────────

export interface RawUser { name: string; email: string; created_at: string }
export interface User extends PipelineRecord { id: string; name: string; email: string; createdAt: Date }

export class UserImportPipeline extends ETLPipeline<RawUser, User> {
  private db: User[] = [];

  protected async extract(_source: string): Promise<RawUser[]> {
    // Simulate CSV/API fetch
    return [
      { name: "Alice", email: "alice@example.com", created_at: "2024-01-15" },
      { name: "Bob",   email: "bob@example.com",   created_at: "2024-02-20" },
      { name: "",      email: "invalid",            created_at: "bad-date"   },
    ];
  }

  protected async transform(record: RawUser): Promise<User | null> {
    if (!record.name || !record.email.includes("@")) return null;
    const date = new Date(record.created_at);
    if (isNaN(date.getTime())) throw new Error(`Invalid date: ${record.created_at}`);
    return { id: crypto.randomUUID(), name: record.name, email: record.email, createdAt: date };
  }

  protected async load(records: User[]): Promise<number> {
    this.db.push(...records);
    return records.length;
  }

  protected async afterLoad(records: User[]): Promise<void> {
    console.log(`Loaded ${records.length} users. Total in DB: ${this.db.length}`);
  }

  getDb(): User[] { return this.db; }
}

