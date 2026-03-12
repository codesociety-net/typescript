// ── Order Lifecycle State Machine ─────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderContext {
  orderId: string;
  items: Array<{ sku: string; quantity: number; price: number }>;
  total: number;
  statusHistory: Array<{ status: OrderStatus; at: number; note?: string }>;
}

export interface OrderState {
  readonly status: OrderStatus;
  confirm(order: Order): void;
  process(order: Order): void;
  ship(order: Order, trackingCode: string): void;
  deliver(order: Order): void;
  cancel(order: Order, reason: string): void;
  refund(order: Order): void;
}

export class InvalidTransitionError extends Error {
  constructor(from: OrderStatus, to: string) {
    super(`Cannot transition from "${from}" to "${to}"`);
  }
}

export abstract class BaseOrderState implements OrderState {
  abstract readonly status: OrderStatus;

  confirm(_order: Order): void { throw new InvalidTransitionError(this.status, "confirmed"); }
  process(_order: Order): void { throw new InvalidTransitionError(this.status, "processing"); }
  ship(_order: Order, _code: string): void { throw new InvalidTransitionError(this.status, "shipped"); }
  deliver(_order: Order): void { throw new InvalidTransitionError(this.status, "delivered"); }
  cancel(_order: Order, _reason: string): void { throw new InvalidTransitionError(this.status, "cancelled"); }
  refund(_order: Order): void { throw new InvalidTransitionError(this.status, "refunded"); }
}

export class PendingState extends BaseOrderState {
  readonly status = "pending" as const;
  confirm(order: Order): void { order.transitionTo(new ConfirmedState()); }
  cancel(order: Order, reason: string): void { order.transitionTo(new CancelledState(reason)); }
}

export class ConfirmedState extends BaseOrderState {
  readonly status = "confirmed" as const;
  process(order: Order): void { order.transitionTo(new ProcessingState()); }
  cancel(order: Order, reason: string): void { order.transitionTo(new CancelledState(reason)); }
}

export class ProcessingState extends BaseOrderState {
  readonly status = "processing" as const;
  ship(order: Order, trackingCode: string): void { order.transitionTo(new ShippedState(trackingCode)); }
}

export class ShippedState extends BaseOrderState {
  readonly status = "shipped" as const;
  constructor(public readonly trackingCode: string) { super(); }
  deliver(order: Order): void { order.transitionTo(new DeliveredState()); }
}

export class DeliveredState extends BaseOrderState {
  readonly status = "delivered" as const;
  refund(order: Order): void { order.transitionTo(new RefundedState()); }
}

export class CancelledState extends BaseOrderState {
  readonly status = "cancelled" as const;
  constructor(public readonly reason: string) { super(); }
}

export class RefundedState extends BaseOrderState {
  readonly status = "refunded" as const;
}

// ── Order (Context) ───────────────────────────────────────────────

export class Order {
  private state: OrderState = new PendingState();
  readonly context: OrderContext;

  constructor(orderId: string, items: OrderContext["items"]) {
    this.context = {
      orderId,
      items,
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      statusHistory: [{ status: "pending", at: Date.now() }],
    };
  }

  transitionTo(state: OrderState, note?: string): void {
    this.state = state;
    this.context.statusHistory.push({ status: state.status, at: Date.now(), note });
  }

  get status(): OrderStatus { return this.state.status; }
  confirm(): void { this.state.confirm(this); }
  process(): void { this.state.process(this); }
  ship(trackingCode: string): void { this.state.ship(this, trackingCode); }
  deliver(): void { this.state.deliver(this); }
  cancel(reason: string): void { this.state.cancel(this, reason); }
  refund(): void { this.state.refund(this); }
}

