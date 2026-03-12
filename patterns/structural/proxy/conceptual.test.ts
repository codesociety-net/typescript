import { describe, it, expect, vi } from "vitest";
import { RealSubject, ProxySubject, clientCode } from "./conceptual";

describe("Proxy (Conceptual)", () => {
  it("RealSubject.request does not throw", () => {
    const real = new RealSubject();
    expect(() => real.request()).not.toThrow();
  });

  it("ProxySubject.request delegates to RealSubject", () => {
    const real = new RealSubject();
    const spy = vi.spyOn(real, "request");
    const proxy = new ProxySubject(real);
    proxy.request();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("ProxySubject logs access check before delegating", () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((msg: string) => {
      logs.push(msg);
    });
    const proxy = new ProxySubject(new RealSubject());
    proxy.request();
    expect(logs[0]).toContain("checking access");
    spy.mockRestore();
  });

  it("ProxySubject logs time after delegating", () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((msg: string) => {
      logs.push(msg);
    });
    const proxy = new ProxySubject(new RealSubject());
    proxy.request();
    expect(logs[logs.length - 1]).toContain("logging time");
    spy.mockRestore();
  });

  it("clientCode works with RealSubject directly", () => {
    expect(() => clientCode(new RealSubject())).not.toThrow();
  });

  it("clientCode works with ProxySubject transparently", () => {
    const proxy = new ProxySubject(new RealSubject());
    expect(() => clientCode(proxy)).not.toThrow();
  });

  it("ProxySubject and RealSubject share the same interface", () => {
    const real = new RealSubject();
    const proxy = new ProxySubject(real);
    expect(typeof real.request).toBe("function");
    expect(typeof proxy.request).toBe("function");
  });
});
