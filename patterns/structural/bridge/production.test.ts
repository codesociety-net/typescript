import { describe, it, expect, vi } from "vitest";
import {
  EmailChannel,
  SmsChannel,
  PushChannel,
  AlertNotification,
  WelcomeNotification,
} from "./production";

describe("Bridge (Production)", () => {
  describe("AlertNotification", () => {
    it("sends an alert through EmailChannel", async () => {
      const channel = new EmailChannel();
      const spy = vi.spyOn(channel, "send");
      const alert = new AlertNotification(channel);
      await alert.notify("ops@example.com", { event: "CPU spike", timestamp: "2026-01-01T00:00:00Z", details: "High CPU" });
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toBe("ops@example.com");
      expect(spy.mock.calls[0][1]).toContain("CPU spike");
    });

    it("sends an alert through SmsChannel", async () => {
      const channel = new SmsChannel();
      const spy = vi.spyOn(channel, "send");
      const alert = new AlertNotification(channel);
      await alert.notify("+14155550100", { event: "Disk full" });
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toBe("+14155550100");
    });

    it("includes event name in the subject", async () => {
      const channel = new EmailChannel();
      const spy = vi.spyOn(channel, "send");
      const alert = new AlertNotification(channel);
      await alert.notify("a@b.com", { event: "Memory leak" });
      const subject = spy.mock.calls[0][1];
      expect(subject).toContain("Memory leak");
    });

    it("falls back to 'Unknown event' when event is missing", async () => {
      const channel = new EmailChannel();
      const spy = vi.spyOn(channel, "send");
      const alert = new AlertNotification(channel);
      await alert.notify("a@b.com", {});
      const subject = spy.mock.calls[0][1];
      expect(subject).toContain("Unknown event");
    });
  });

  describe("WelcomeNotification", () => {
    it("sends a welcome through PushChannel", async () => {
      const channel = new PushChannel();
      const spy = vi.spyOn(channel, "send");
      const welcome = new WelcomeNotification(channel);
      await welcome.notify("user-1", { name: "Alice" });
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toBe("user-1");
    });

    it("welcome subject is fixed greeting", async () => {
      const channel = new EmailChannel();
      const spy = vi.spyOn(channel, "send");
      const welcome = new WelcomeNotification(channel);
      await welcome.notify("a@b.com", { name: "Bob" });
      expect(spy.mock.calls[0][1]).toBe("Welcome to the platform!");
    });

    it("welcome body contains the recipient name", async () => {
      const channel = new EmailChannel();
      const spy = vi.spyOn(channel, "send");
      const welcome = new WelcomeNotification(channel);
      await welcome.notify("a@b.com", { name: "Charlie" });
      expect(spy.mock.calls[0][2]).toContain("Charlie");
    });

    it("falls back to 'there' when name is missing", async () => {
      const channel = new EmailChannel();
      const spy = vi.spyOn(channel, "send");
      const welcome = new WelcomeNotification(channel);
      await welcome.notify("a@b.com", {});
      expect(spy.mock.calls[0][2]).toContain("there");
    });
  });

  describe("Channel independence", () => {
    it("same notification type works with any channel", async () => {
      const email = new EmailChannel();
      const sms = new SmsChannel();
      const push = new PushChannel();

      const spyE = vi.spyOn(email, "send");
      const spyS = vi.spyOn(sms, "send");
      const spyP = vi.spyOn(push, "send");

      await new AlertNotification(email).notify("a@b.com", { event: "X" });
      await new AlertNotification(sms).notify("+1", { event: "X" });
      await new AlertNotification(push).notify("u1", { event: "X" });

      expect(spyE).toHaveBeenCalledOnce();
      expect(spyS).toHaveBeenCalledOnce();
      expect(spyP).toHaveBeenCalledOnce();
    });
  });
});
