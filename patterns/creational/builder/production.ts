// ── HTTP Request Builder ──────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  retryOn: number[];
}

export interface RequestConfig {
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
  readonly timeoutMs: number;
  readonly retry: Readonly<RetryPolicy>;
}

export class RequestBuilder {
  private config = {
    method: "GET" as HttpMethod,
    url: "",
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    timeoutMs: 30_000,
    retry: { maxRetries: 0, baseDelayMs: 1000, retryOn: [429, 500, 502, 503] },
  };

  static create(): RequestBuilder { return new RequestBuilder(); }

  method(m: HttpMethod): this { this.config.method = m; return this; }
  url(u: string): this { this.config.url = u; return this; }
  header(key: string, value: string): this { this.config.headers[key] = value; return this; }
  bearerToken(token: string): this { this.config.headers["Authorization"] = `Bearer ${token}`; return this; }

  json(data: unknown): this {
    this.config.body = data;
    this.config.headers["Content-Type"] = "application/json";
    return this;
  }

  timeout(ms: number): this {
    if (ms <= 0) throw new Error("Timeout must be positive");
    this.config.timeoutMs = ms;
    return this;
  }

  retries(max: number, baseDelayMs = 1000): this {
    this.config.retry = { ...this.config.retry, maxRetries: max, baseDelayMs };
    return this;
  }

  build(): RequestConfig {
    if (!this.config.url) throw new Error("URL is required");
    if (this.config.body && (this.config.method === "GET" || this.config.method === "DELETE")) {
      throw new Error(`${this.config.method} requests should not have a body`);
    }
    return Object.freeze({ ...this.config, headers: Object.freeze({ ...this.config.headers }) });
  }
}

// Executor
export async function executeRequest<T = unknown>(config: RequestConfig): Promise<{ status: number; data: T; attempts: number }> {
  let lastError: Error | null = null;
  const maxAttempts = config.retry.maxRetries + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      if (!response.ok && config.retry.retryOn.includes(response.status) && attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, config.retry.baseDelayMs * 2 ** (attempt - 1)));
        continue;
      }

      return { status: response.status, data: (await response.json()) as T, attempts: attempt };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt === maxAttempts) break;
    }
  }
  throw lastError ?? new Error("Request failed");
}

