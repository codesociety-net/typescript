// ── HTTP Middleware Chain (Express-style) ─────────────────────────

export interface HttpRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
  context: Map<string, unknown>;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export type NextFunction = () => Promise<HttpResponse>;
export type Middleware = (
  req: HttpRequest,
  next: NextFunction
) => Promise<HttpResponse>;

// ── Middleware Implementations ────────────────────────────────────

export const corsMiddleware: Middleware = async (req, next) => {
  const response = await next();
  return {
    ...response,
    headers: {
      ...response.headers,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    },
  };
};

export const authMiddleware: Middleware = async (req, next) => {
  const token = req.headers["authorization"];

  if (!token?.startsWith("Bearer ")) {
    return {
      status: 401,
      headers: {},
      body: { error: "Unauthorized" },
    };
  }

  // Validate token and attach user to context
  req.context.set("userId", "user_123");
  return next();
};

export const rateLimitMiddleware: Middleware = async (req, next) => {
  const clientIp = req.headers["x-forwarded-for"] ?? "unknown";
  const key = `rate:${clientIp}`;

  // Check rate limit (simplified)
  const requests = (req.context.get(key) as number) ?? 0;
  if (requests > 100) {
    return {
      status: 429,
      headers: { "Retry-After": "60" },
      body: { error: "Too many requests" },
    };
  }

  req.context.set(key, requests + 1);
  return next();
};

// ── Pipeline Builder ─────────────────────────────────────────────

export class MiddlewarePipeline {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(
    req: HttpRequest,
    handler: (req: HttpRequest) => Promise<HttpResponse>
  ): Promise<HttpResponse> {
    let index = 0;

    const next: NextFunction = async () => {
      if (index < this.middlewares.length) {
        const mw = this.middlewares[index++];
        return mw(req, next);
      }
      return handler(req);
    };

    return next();
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Usage ────────────────────────────────────────────────────────
  
  const pipeline = new MiddlewarePipeline()
    .use(corsMiddleware)
    .use(rateLimitMiddleware)
    .use(authMiddleware);
}
