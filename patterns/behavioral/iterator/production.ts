// ── Paginated API Iterator (Async) ────────────────────────────────

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
}

export interface FetchPage<T> {
  (cursor: string | null, pageSize: number): Promise<Page<T>>;
}

export class PaginatedIterator<T> implements AsyncIterator<T> {
  private buffer: T[] = [];
  private cursor: string | null = null;
  private done = false;
  private fetched = 0;

  constructor(
    private readonly fetchPage: FetchPage<T>,
    private readonly pageSize: number = 20,
    private readonly maxItems?: number
  ) {}

  async next(): Promise<IteratorResult<T>> {
    // Enforce maxItems limit
    if (this.maxItems !== undefined && this.fetched >= this.maxItems) {
      return { value: undefined as unknown as T, done: true };
    }

    // Refill buffer if empty
    if (this.buffer.length === 0) {
      if (this.done) return { value: undefined as unknown as T, done: true };

      const page = await this.fetchPage(this.cursor, this.pageSize);
      this.buffer = page.items;
      this.cursor = page.nextCursor;

      if (page.nextCursor === null) this.done = true;
      if (this.buffer.length === 0) return { value: undefined as unknown as T, done: true };
    }

    this.fetched++;
    return { value: this.buffer.shift()!, done: false };
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this;
  }
}

// ── Utility: collect all items ────────────────────────────────────

export async function collectAll<T>(
  fetchPage: FetchPage<T>,
  options: { pageSize?: number; maxItems?: number } = {}
): Promise<T[]> {
  const results: T[] = [];
  const iterator = new PaginatedIterator(fetchPage, options.pageSize, options.maxItems);

  for await (const item of iterator) {
    results.push(item);
  }

  return results;
}

// ── Usage ─────────────────────────────────────────────────────────

export interface GitHubRepo { id: number; name: string; stargazers_count: number }

export async function fetchGitHubRepos(
  org: string,
  cursor: string | null,
  pageSize: number
): Promise<Page<GitHubRepo>> {
  const page = cursor ? parseInt(cursor, 10) : 1;
  const url = `https://api.github.com/orgs/${org}/repos?per_page=${pageSize}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const items: GitHubRepo[] = await res.json();
  return {
    items,
    nextCursor: items.length === pageSize ? String(page + 1) : null,
    totalCount: -1,
  };
}

