export class Singleton {
  private static instance: Singleton;

  private constructor() {
    // Private constructor prevents direct instantiation
  }

  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  // Business methods
  doSomething(): void {
    console.log("Singleton method called");
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const a = Singleton.getInstance();
  const b = Singleton.getInstance();
  console.log(a === b); // true
}
