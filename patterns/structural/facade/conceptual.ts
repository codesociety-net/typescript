// Facade Pattern – Conceptual
// Provides a simple interface to a group of complex subsystem classes.

export class SubsystemA {
  operationA(): string { return "SubsystemA: ready"; }
  operationA2(): string { return "SubsystemA: go!"; }
}

export class SubsystemB {
  operationB(): string { return "SubsystemB: ready"; }
  operationB2(): string { return "SubsystemB: fire!"; }
}

export class Facade {
  private a: SubsystemA;
  private b: SubsystemB;

  constructor(a?: SubsystemA, b?: SubsystemB) {
    this.a = a ?? new SubsystemA();
    this.b = b ?? new SubsystemB();
  }

  simpleOperation(): string {
    const results = [
      "Facade initialises subsystems:",
      this.a.operationA(),
      this.b.operationB(),
      "Facade triggers subsystems:",
      this.a.operationA2(),
      this.b.operationB2(),
    ];
    return results.join("\n");
  }
}

export function clientCode(facade: Facade): void {
  console.log(facade.simpleOperation());
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  clientCode(new Facade());
}
