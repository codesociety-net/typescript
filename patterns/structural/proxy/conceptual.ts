// Proxy Pattern – Conceptual
// Controls access to a real subject; adds pre/post logic transparently.

export interface Subject {
  request(): void;
}

export class RealSubject implements Subject {
  request(): void {
    console.log("RealSubject: handling request.");
  }
}

export class ProxySubject implements Subject {
  private realSubject: RealSubject;

  constructor(realSubject: RealSubject) {
    this.realSubject = realSubject;
  }

  private checkAccess(): boolean {
    console.log("Proxy: checking access before forwarding request.");
    return true; // simplified – could consult auth service
  }

  private logAccess(): void {
    console.log("Proxy: logging time of request.");
  }

  request(): void {
    if (this.checkAccess()) {
      this.realSubject.request();
      this.logAccess();
    }
  }
}

export function clientCode(subject: Subject): void {
  subject.request();
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const real = new RealSubject();
  clientCode(real);
  
  console.log("---");
  
  const proxy = new ProxySubject(real);
  clientCode(proxy);
}
