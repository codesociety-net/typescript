import { describe, it, expect } from "vitest";
import { StripeStrategy, PayPalStrategy, PaymentProcessor } from "./production";

describe("Strategy — Payment Processing", () => {
  const validPayment = { amount: 100, currency: "USD", description: "Test" };

  describe("StripeStrategy", () => {
    const stripe = new StripeStrategy("sk_test_123");

    it("validates positive amount", () => {
      const errors = stripe.validate({ amount: -5, currency: "USD", description: "x" });
      expect(errors).toContain("Amount must be positive");
    });

    it("validates supported currency", () => {
      const errors = stripe.validate({ amount: 10, currency: "JPY", description: "x" });
      expect(errors).toContain("Currency JPY not supported by Stripe");
    });

    it("returns no errors for valid payment", () => {
      expect(stripe.validate(validPayment)).toEqual([]);
    });

    it("processes valid payment successfully", async () => {
      const result = await stripe.process(validPayment);
      expect(result.success).toBe(true);
      expect(result.provider).toBe("stripe");
      expect(result.transactionId).toMatch(/^stripe_/);
    });
  });

  describe("PayPalStrategy", () => {
    const paypal = new PayPalStrategy();

    it("validates minimum amount", () => {
      const errors = paypal.validate({ amount: 0.5, currency: "USD", description: "x" });
      expect(errors).toContain("PayPal minimum is $1.00");
    });

    it("returns no errors for valid payment", () => {
      expect(paypal.validate(validPayment)).toEqual([]);
    });

    it("processes valid payment successfully", async () => {
      const result = await paypal.process(validPayment);
      expect(result.success).toBe(true);
      expect(result.provider).toBe("paypal");
      expect(result.transactionId).toMatch(/^pp_/);
    });
  });

  describe("PaymentProcessor", () => {
    it("charges successfully with valid payment", async () => {
      const processor = new PaymentProcessor(new StripeStrategy("key"));
      const result = await processor.charge(validPayment);
      expect(result.success).toBe(true);
    });

    it("returns failure when validation fails", async () => {
      const processor = new PaymentProcessor(new StripeStrategy("key"));
      const result = await processor.charge({ amount: -1, currency: "USD", description: "x" });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain("Amount must be positive");
    });

    it("setStrategy swaps the payment provider", async () => {
      const processor = new PaymentProcessor(new StripeStrategy("key"));
      const stripeResult = await processor.charge(validPayment);
      expect(stripeResult.provider).toBe("stripe");

      processor.setStrategy(new PayPalStrategy());
      const paypalResult = await processor.charge(validPayment);
      expect(paypalResult.provider).toBe("paypal");
    });

    it("joins multiple validation errors", async () => {
      const processor = new PaymentProcessor(new StripeStrategy("key"));
      const result = await processor.charge({ amount: -1, currency: "JPY", description: "x" });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain("Amount must be positive");
      expect(result.errorMessage).toContain("JPY not supported");
    });
  });
});
