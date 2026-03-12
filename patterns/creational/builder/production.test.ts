import { describe, it, expect } from "vitest";
import { RequestBuilder } from "./production";

describe("RequestBuilder (Production)", () => {
  describe("fluent API and defaults", () => {
    it("creates a builder via static create()", () => {
      const builder = RequestBuilder.create();
      expect(builder).toBeInstanceOf(RequestBuilder);
    });

    it("defaults to GET method", () => {
      const config = RequestBuilder.create().url("https://api.example.com").build();
      expect(config.method).toBe("GET");
    });

    it("defaults timeout to 30000ms", () => {
      const config = RequestBuilder.create().url("https://api.example.com").build();
      expect(config.timeoutMs).toBe(30_000);
    });

    it("defaults retry maxRetries to 0", () => {
      const config = RequestBuilder.create().url("https://api.example.com").build();
      expect(config.retry.maxRetries).toBe(0);
    });
  });

  describe("building requests", () => {
    it("sets method and url", () => {
      const config = RequestBuilder.create()
        .method("POST")
        .url("https://api.example.com/data")
        .build();
      expect(config.method).toBe("POST");
      expect(config.url).toBe("https://api.example.com/data");
    });

    it("sets custom headers", () => {
      const config = RequestBuilder.create()
        .url("https://api.example.com")
        .header("X-Custom", "value")
        .build();
      expect(config.headers["X-Custom"]).toBe("value");
    });

    it("sets bearer token in Authorization header", () => {
      const config = RequestBuilder.create()
        .url("https://api.example.com")
        .bearerToken("my-token")
        .build();
      expect(config.headers["Authorization"]).toBe("Bearer my-token");
    });

    it("json() sets body and Content-Type header", () => {
      const data = { name: "test" };
      const config = RequestBuilder.create()
        .method("POST")
        .url("https://api.example.com")
        .json(data)
        .build();
      expect(config.body).toEqual(data);
      expect(config.headers["Content-Type"]).toBe("application/json");
    });

    it("sets custom timeout", () => {
      const config = RequestBuilder.create()
        .url("https://api.example.com")
        .timeout(5000)
        .build();
      expect(config.timeoutMs).toBe(5000);
    });

    it("sets retry policy", () => {
      const config = RequestBuilder.create()
        .url("https://api.example.com")
        .retries(3, 500)
        .build();
      expect(config.retry.maxRetries).toBe(3);
      expect(config.retry.baseDelayMs).toBe(500);
    });
  });

  describe("validation", () => {
    it("throws when URL is missing", () => {
      expect(() => RequestBuilder.create().build()).toThrow("URL is required");
    });

    it("throws when GET has a body", () => {
      expect(() =>
        RequestBuilder.create()
          .method("GET")
          .url("https://api.example.com")
          .json({ a: 1 })
          .build()
      ).toThrow("GET requests should not have a body");
    });

    it("throws when DELETE has a body", () => {
      expect(() =>
        RequestBuilder.create()
          .method("DELETE")
          .url("https://api.example.com")
          .json({ a: 1 })
          .build()
      ).toThrow("DELETE requests should not have a body");
    });

    it("throws for non-positive timeout", () => {
      expect(() =>
        RequestBuilder.create().url("https://api.example.com").timeout(0)
      ).toThrow("Timeout must be positive");
    });

    it("throws for negative timeout", () => {
      expect(() =>
        RequestBuilder.create().url("https://api.example.com").timeout(-100)
      ).toThrow("Timeout must be positive");
    });
  });

  describe("immutability of built config", () => {
    it("returns a frozen config object", () => {
      const config = RequestBuilder.create()
        .method("POST")
        .url("https://api.example.com")
        .json({ data: true })
        .build();
      expect(Object.isFrozen(config)).toBe(true);
      expect(Object.isFrozen(config.headers)).toBe(true);
    });
  });
});
