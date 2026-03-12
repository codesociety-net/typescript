// Bridge Pattern – Production
// Notification system: the abstraction (Notification) is bridged to
// independently extensible channel implementations (Email, SMS, Push).

// ── Implementation side: channels ─────────────────────────────────────────────
export interface NotificationChannel {
  send(recipient: string, subject: string, body: string): Promise<void>;
}

export class EmailChannel implements NotificationChannel {
  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`[Email → ${to}] Subject: ${subject}\n${body}`);
  }
}

export class SmsChannel implements NotificationChannel {
  async send(to: string, _subject: string, body: string): Promise<void> {
    const truncated = body.length > 160 ? body.slice(0, 157) + "..." : body;
    console.log(`[SMS → ${to}] ${truncated}`);
  }
}

export class PushChannel implements NotificationChannel {
  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`[Push → ${to}] ${subject}: ${body.slice(0, 80)}`);
  }
}

// ── Abstraction side: notification types ──────────────────────────────────────
export abstract class Notification {
  constructor(protected channel: NotificationChannel) {}
  abstract notify(recipient: string, data: Record<string, string>): Promise<void>;
}

export class AlertNotification extends Notification {
  async notify(recipient: string, data: Record<string, string>): Promise<void> {
    const subject = `⚠️ Alert: ${data.event ?? "Unknown event"}`;
    const body = `An alert was triggered at ${data.timestamp ?? new Date().toISOString()}.\nDetails: ${data.details ?? "n/a"}`;
    await this.channel.send(recipient, subject, body);
  }
}

export class WelcomeNotification extends Notification {
  async notify(recipient: string, data: Record<string, string>): Promise<void> {
    const subject = "Welcome to the platform!";
    const body = `Hi ${data.name ?? "there"}, your account is ready. Enjoy!`;
    await this.channel.send(recipient, subject, body);
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Usage ─────────────────────────────────────────────────────────────────────
  (async () => {
    // Same alert, different channels – zero code duplication
    const emailAlert = new AlertNotification(new EmailChannel());
    const smsAlert   = new AlertNotification(new SmsChannel());
    const pushWelcome = new WelcomeNotification(new PushChannel());
  
    await emailAlert.notify("ops@example.com", {
      event: "CPU spike",
      timestamp: "2026-03-11T14:00:00Z",
      details: "CPU usage exceeded 95% for 5 minutes",
    });
    await smsAlert.notify("+14155550100", {
      event: "CPU spike",
      timestamp: "2026-03-11T14:00:00Z",
      details: "CPU usage exceeded 95% for 5 minutes",
    });
    await pushWelcome.notify("user-987", { name: "Alice" });
  })();
}
