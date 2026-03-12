import { describe, it, expect } from "vitest";
import {
  MiddlewarePipeline,
  corsMiddleware,
  authMiddleware,
  rateLimitMiddleware,
  HttpRequest,
  HttpResponse,
} from "./production";

function makeRequest(overrides: Partial<HttpRequest> = {}): HttpRequest {
  return {
    method: "GET",
    path: "/api/test",
    headers: {},
    body: null,
    context: new Map(),
    ...overrides,
  };
}

const okHandler = async (_req: HttpRequest): Promise<HttpResponse> => ({
  status: 200,
  headers: {},
  body: { ok: true },
});

describe("Chain of Responsibility — HTTP Middleware Pipeline", () => {
  it("pipeline executes handler when no middleware is added", async () => {
    const pipeline = new MiddlewarePipeline();
    const req = makeRequest();
    const res = await pipeline.execute(req, okHandler);
    expect(res.status).toBe(200);
  });

  it("corsMiddleware adds CORS headers to response", async () => {
    const pipeline = new MiddlewarePipeline().use(corsMiddleware);
    const req = makeRequest();
    const res = await pipeline.execute(req, okHandler);

    expect(res.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(res.headers["Access-Control-Allow-Methods"]).toContain("GET");
  });

  it("authMiddleware rejects request without authorization header", async () => {
    const pipeline = new MiddlewarePipeline().use(authMiddleware);
    const req = makeRequest();
    const res = await pipeline.execute(req, okHandler);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("authMiddleware allows request with valid Bearer token", async () => {
    const pipeline = new MiddlewarePipeline().use(authMiddleware);
    const req = makeRequest({ headers: { authorization: "Bearer abc123" } });
    const res = await pipeline.execute(req, okHandler);

    expect(res.status).toBe(200);
    expect(req.context.get("userId")).toBe("user_123");
  });

  it("rateLimitMiddleware allows requests under the limit", async () => {
    const pipeline = new MiddlewarePipeline().use(rateLimitMiddleware);
    const req = makeRequest({ headers: { "x-forwarded-for": "1.2.3.4" } });
    const res = await pipeline.execute(req, okHandler);

    expect(res.status).toBe(200);
  });

  it("rateLimitMiddleware rejects when rate limit exceeded", async () => {
    const pipeline = new MiddlewarePipeline().use(rateLimitMiddleware);
    const req = makeRequest({ headers: { "x-forwarded-for": "1.2.3.4" } });
    req.context.set("rate:1.2.3.4", 101);
    const res = await pipeline.execute(req, okHandler);

    expect(res.status).toBe(429);
    expect(res.headers["Retry-After"]).toBe("60");
  });

  it("middleware pipeline chains multiple middlewares in order", async () => {
    const pipeline = new MiddlewarePipeline()
      .use(corsMiddleware)
      .use(authMiddleware);

    const req = makeRequest({ headers: { authorization: "Bearer token" } });
    const res = await pipeline.execute(req, okHandler);

    expect(res.status).toBe(200);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(req.context.get("userId")).toBe("user_123");
  });

  it("early middleware rejection stops the chain", async () => {
    const pipeline = new MiddlewarePipeline()
      .use(authMiddleware)
      .use(corsMiddleware);

    const req = makeRequest(); // no auth header
    const res = await pipeline.execute(req, okHandler);

    expect(res.status).toBe(401);
    expect(res.headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("use() returns this for fluent chaining", () => {
    const pipeline = new MiddlewarePipeline();
    const result = pipeline.use(corsMiddleware);
    expect(result).toBe(pipeline);
  });
});
