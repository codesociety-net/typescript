import { describe, it, expect, vi } from "vitest";
import {
  RealUserService,
  LoggingUserService,
  CachingUserService,
  type UserService,
} from "./production";

describe("Decorator (Production)", () => {
  describe("RealUserService", () => {
    it("returns a user with the given id", async () => {
      const service = new RealUserService();
      const user = await service.getUser("abc");
      expect(user).toEqual({ id: "abc", name: "User abc" });
    });
  });

  describe("LoggingUserService", () => {
    it("delegates to the inner service and returns same result", async () => {
      const inner = new RealUserService();
      const logging = new LoggingUserService(inner);
      const user = await logging.getUser("x1");
      expect(user).toEqual({ id: "x1", name: "User x1" });
    });

    it("calls inner.getUser when invoked", async () => {
      const inner: UserService = { getUser: vi.fn().mockResolvedValue({ id: "1", name: "Test" }) };
      const logging = new LoggingUserService(inner);
      await logging.getUser("1");
      expect(inner.getUser).toHaveBeenCalledWith("1");
    });

    it("rethrows errors from inner service", async () => {
      const inner: UserService = { getUser: vi.fn().mockRejectedValue(new Error("fail")) };
      const logging = new LoggingUserService(inner);
      await expect(logging.getUser("1")).rejects.toThrow("fail");
    });
  });

  describe("CachingUserService", () => {
    it("returns the same result as inner on first call", async () => {
      const inner = new RealUserService();
      const caching = new CachingUserService(inner);
      const user = await caching.getUser("u1");
      expect(user).toEqual({ id: "u1", name: "User u1" });
    });

    it("serves from cache on second call (inner called only once)", async () => {
      const inner: UserService = {
        getUser: vi.fn().mockResolvedValue({ id: "u1", name: "Test" }),
      };
      const caching = new CachingUserService(inner, 60_000);
      await caching.getUser("u1");
      await caching.getUser("u1");
      expect(inner.getUser).toHaveBeenCalledTimes(1);
    });

    it("different keys are cached independently", async () => {
      const inner: UserService = {
        getUser: vi.fn().mockImplementation(async (id: string) => ({ id, name: `User ${id}` })),
      };
      const caching = new CachingUserService(inner, 60_000);
      await caching.getUser("a");
      await caching.getUser("b");
      await caching.getUser("a");
      expect(inner.getUser).toHaveBeenCalledTimes(2);
    });
  });

  describe("Stacked decorators", () => {
    it("Logging + Caching + Real returns correct result", async () => {
      const service: UserService = new LoggingUserService(
        new CachingUserService(new RealUserService(), 60_000),
      );
      const user = await service.getUser("z9");
      expect(user).toEqual({ id: "z9", name: "User z9" });
    });

    it("stacked decorators still cache (inner called once for same key)", async () => {
      const inner: UserService = {
        getUser: vi.fn().mockResolvedValue({ id: "k", name: "K" }),
      };
      const service = new LoggingUserService(new CachingUserService(inner, 60_000));
      await service.getUser("k");
      await service.getUser("k");
      expect(inner.getUser).toHaveBeenCalledTimes(1);
    });
  });
});
