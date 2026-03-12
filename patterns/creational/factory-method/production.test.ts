import { describe, it, expect } from "vitest";
import {
  EmailNotification,
  SmsNotification,
  EmailService,
  SmsService,
  getNotificationService,
} from "./production";

describe("Notification Factory (Production)", () => {
  describe("EmailNotification", () => {
    const email = new EmailNotification();

    it("has channel 'email'", () => {
      expect(email.channel).toBe("email");
    });

    it("validates correct email addresses", () => {
      expect(email.validate("user@example.com")).toBe(true);
    });

    it("rejects invalid email addresses", () => {
      expect(email.validate("not-an-email")).toBe(false);
      expect(email.validate("@missing.com")).toBe(false);
    });

    it("send returns a successful result", async () => {
      const result = await email.send("user@example.com", "Hello", "Body");
      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^email_/);
      expect(typeof result.timestamp).toBe("number");
    });

    it("send throws for invalid email", async () => {
      await expect(email.send("bad", "Hi", "Body")).rejects.toThrow("Invalid email");
    });
  });

  describe("SmsNotification", () => {
    const sms = new SmsNotification();

    it("has channel 'sms'", () => {
      expect(sms.channel).toBe("sms");
    });

    it("validates correct phone numbers", () => {
      expect(sms.validate("+1234567890")).toBe(true);
    });

    it("rejects invalid phone numbers", () => {
      expect(sms.validate("1234567890")).toBe(false);
      expect(sms.validate("+0000")).toBe(false);
    });

    it("send returns a successful result", async () => {
      const result = await sms.send("+1234567890", "Alert", "Body");
      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^sms_/);
    });

    it("send throws for invalid phone", async () => {
      await expect(sms.send("bad", "Hi", "Body")).rejects.toThrow("Invalid phone");
    });
  });

  describe("NotificationService (EmailService / SmsService)", () => {
    it("EmailService.notify succeeds for valid email", async () => {
      const service = new EmailService();
      const result = await service.notify("a@b.com", "Subj", "Body");
      expect(result.success).toBe(true);
    });

    it("SmsService.notify succeeds for valid phone", async () => {
      const service = new SmsService();
      const result = await service.notify("+1234567890", "Subj", "Body");
      expect(result.success).toBe(true);
    });

    it("EmailService.notify throws for invalid address", async () => {
      const service = new EmailService();
      await expect(service.notify("bad", "S", "B")).rejects.toThrow();
    });
  });

  describe("getNotificationService registry", () => {
    it("returns EmailService for 'email'", () => {
      const service = getNotificationService("email");
      expect(service).toBeInstanceOf(EmailService);
    });

    it("returns SmsService for 'sms'", () => {
      const service = getNotificationService("sms");
      expect(service).toBeInstanceOf(SmsService);
    });

    it("throws for unknown channel", () => {
      expect(() => getNotificationService("pigeon")).toThrow('Unknown channel "pigeon"');
    });
  });
});
