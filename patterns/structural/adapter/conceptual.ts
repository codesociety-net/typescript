// Adapter Pattern – Conceptual
// Wraps an incompatible interface so it conforms to the target interface.

export interface Target {
  request(): string;
}

export class Adaptee {
  specificRequest(): string {
    return "Adaptee: specific behaviour";
  }
}

export class Adapter implements Target {
  private adaptee: Adaptee;

  constructor(adaptee: Adaptee) {
    this.adaptee = adaptee;
  }

  request(): string {
    const result = this.adaptee.specificRequest().split("").reverse().join("");
    return `Adapter: (translated) ${result}`;
  }
}

export function clientCode(target: Target): void {
  console.log(target.request());
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const adaptee = new Adaptee();
  console.log("Adaptee: " + adaptee.specificRequest());
  
  const adapter = new Adapter(adaptee);
  clientCode(adapter);
  // Output:
  // Adaptee: Adaptee: specific behaviour
  // Adapter: (translated) ruoivaheb cificeps :eetpadA
}
