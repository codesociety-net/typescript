export interface Request {
  type: string;
  payload: unknown;
}

export abstract class Handler {
  private next: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.next = handler;
    return handler;
  }

  handle(request: Request): string | null {
    if (this.next) {
      return this.next.handle(request);
    }
    return null;
  }
}

export class AuthHandler extends Handler {
  handle(request: Request): string | null {
    if (request.type === "auth") {
      return "Handled by AuthHandler";
    }
    return super.handle(request);
  }
}

export class ValidationHandler extends Handler {
  handle(request: Request): string | null {
    if (request.type === "validate") {
      return "Handled by ValidationHandler";
    }
    return super.handle(request);
  }
}

export class LoggingHandler extends Handler {
  handle(request: Request): string | null {
    console.log(`Logging: ${request.type}`);
    return super.handle(request);
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Build the chain
  const auth = new AuthHandler();
  const validation = new ValidationHandler();
  const logging = new LoggingHandler();
  
  logging.setNext(auth).setNext(validation);
  
  // Process requests
  logging.handle({ type: "auth", payload: {} });
  logging.handle({ type: "validate", payload: {} });
}
