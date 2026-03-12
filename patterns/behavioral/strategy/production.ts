// ── Payment Processing with Strategy Pattern ──────────────────────

export interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  timestamp: number;
  provider: string;
  errorMessage?: string;
}

export interface PaymentStrategy {
  readonly name: string;
  validate(details: PaymentDetails): string[];
  process(details: PaymentDetails): Promise<PaymentResult>;
}

// ── Concrete Strategies ───────────────────────────────────────────

export class StripeStrategy implements PaymentStrategy {
  readonly name = "stripe";

  constructor(private apiKey: string) {}

  validate(details: PaymentDetails): string[] {
    const errors: string[] = [];
    if (details.amount <= 0) errors.push("Amount must be positive");
    if (!["USD", "EUR", "GBP"].includes(details.currency)) {
      errors.push(`Currency ${details.currency} not supported by Stripe`);
    }
    return errors;
  }

  async process(details: PaymentDetails): Promise<PaymentResult> {
    // Simulate Stripe API call
    return {
      success: true,
      transactionId: `stripe_${crypto.randomUUID()}`,
      timestamp: Date.now(),
      provider: this.name,
    };
  }
}

export class PayPalStrategy implements PaymentStrategy {
  readonly name = "paypal";

  validate(details: PaymentDetails): string[] {
    const errors: string[] = [];
    if (details.amount < 1) errors.push("PayPal minimum is $1.00");
    return errors;
  }

  async process(details: PaymentDetails): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `pp_${crypto.randomUUID()}`,
      timestamp: Date.now(),
      provider: this.name,
    };
  }
}

// ── Payment Processor (Context) ───────────────────────────────────

export class PaymentProcessor {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  async charge(details: PaymentDetails): Promise<PaymentResult> {
    const errors = this.strategy.validate(details);
    if (errors.length > 0) {
      return {
        success: false,
        transactionId: "",
        timestamp: Date.now(),
        provider: this.strategy.name,
        errorMessage: errors.join("; "),
      };
    }
    return this.strategy.process(details);
  }
}

