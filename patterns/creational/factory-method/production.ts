// ── Notification Factory ──────────────────────────────────────────

export interface NotificationResult {
  success: boolean;
  messageId: string;
  timestamp: number;
}

export interface Notification {
  readonly channel: string;
  send(to: string, subject: string, body: string): Promise<NotificationResult>;
  validate(to: string): boolean;
}

export class EmailNotification implements Notification {
  readonly channel = "email";

  validate(to: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
  }

  async send(to: string, subject: string, body: string): Promise<NotificationResult> {
    if (!this.validate(to)) throw new Error(`Invalid email: ${to}`);
    return { success: true, messageId: `email_${Date.now()}`, timestamp: Date.now() };
  }
}

export class SmsNotification implements Notification {
  readonly channel = "sms";

  validate(to: string): boolean {
    return /^\+[1-9]\d{6,14}$/.test(to);
  }

  async send(to: string, subject: string, body: string): Promise<NotificationResult> {
    if (!this.validate(to)) throw new Error(`Invalid phone: ${to}`);
    return { success: true, messageId: `sms_${Date.now()}`, timestamp: Date.now() };
  }
}

// Creator
export abstract class NotificationService {
  protected abstract createNotification(): Notification;

  async notify(to: string, subject: string, body: string): Promise<NotificationResult> {
    const notification = this.createNotification();
    if (!notification.validate(to)) {
      throw new Error(`Validation failed for ${notification.channel}: ${to}`);
    }
    return notification.send(to, subject, body);
  }
}

export class EmailService extends NotificationService {
  protected createNotification(): Notification {
    return new EmailNotification();
  }
}

export class SmsService extends NotificationService {
  protected createNotification(): Notification {
    return new SmsNotification();
  }
}

// Registry for runtime selection
export const serviceRegistry: Record<string, () => NotificationService> = {
  email: () => new EmailService(),
  sms: () => new SmsService(),
};

export function getNotificationService(channel: string): NotificationService {
  const factory = serviceRegistry[channel];
  if (!factory) {
    throw new Error(`Unknown channel "${channel}". Available: ${Object.keys(serviceRegistry).join(", ")}`);
  }
  return factory();
}

