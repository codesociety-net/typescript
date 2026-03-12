import { describe, it, expect } from "vitest";
import { AuthHandler, ValidationHandler, LoggingHandler, Request } from "./conceptual";

describe("Chain of Responsibility (Conceptual)", () => {
  it("AuthHandler handles auth requests", () => {
    const handler = new AuthHandler();
    const result = handler.handle({ type: "auth", payload: {} });
    expect(result).toBe("Handled by AuthHandler");
  });

  it("ValidationHandler handles validate requests", () => {
    const handler = new ValidationHandler();
    const result = handler.handle({ type: "validate", payload: {} });
    expect(result).toBe("Handled by ValidationHandler");
  });

  it("handler returns null when no handler in chain can process the request", () => {
    const handler = new AuthHandler();
    const result = handler.handle({ type: "unknown", payload: {} });
    expect(result).toBeNull();
  });

  it("request passes through chain to the correct handler", () => {
    const auth = new AuthHandler();
    const validation = new ValidationHandler();
    auth.setNext(validation);

    const result = auth.handle({ type: "validate", payload: {} });
    expect(result).toBe("Handled by ValidationHandler");
  });

  it("first matching handler in chain handles the request", () => {
    const auth = new AuthHandler();
    const validation = new ValidationHandler();
    auth.setNext(validation);

    const result = auth.handle({ type: "auth", payload: {} });
    expect(result).toBe("Handled by AuthHandler");
  });

  it("setNext returns the next handler for chaining", () => {
    const auth = new AuthHandler();
    const validation = new ValidationHandler();
    const returned = auth.setNext(validation);
    expect(returned).toBe(validation);
  });

  it("LoggingHandler passes request to next handler in chain", () => {
    const logging = new LoggingHandler();
    const auth = new AuthHandler();
    logging.setNext(auth);

    const result = logging.handle({ type: "auth", payload: {} });
    expect(result).toBe("Handled by AuthHandler");
  });

  it("three-handler chain processes requests correctly", () => {
    const logging = new LoggingHandler();
    const auth = new AuthHandler();
    const validation = new ValidationHandler();
    logging.setNext(auth).setNext(validation);

    expect(logging.handle({ type: "auth", payload: {} })).toBe("Handled by AuthHandler");
    expect(logging.handle({ type: "validate", payload: {} })).toBe("Handled by ValidationHandler");
    expect(logging.handle({ type: "other", payload: {} })).toBeNull();
  });

  it("LoggingHandler alone returns null for unhandled requests", () => {
    const logging = new LoggingHandler();
    const result = logging.handle({ type: "something", payload: {} });
    expect(result).toBeNull();
  });
});
