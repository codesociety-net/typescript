// Decorator Pattern – Conceptual
// Wraps components at runtime to add behaviour without altering the class.

export interface Component {
  operation(): string;
}

export class ConcreteComponent implements Component {
  operation(): string {
    return "ConcreteComponent";
  }
}

export class BaseDecorator implements Component {
  protected wrappee: Component;
  constructor(component: Component) {
    this.wrappee = component;
  }
  operation(): string {
    return this.wrappee.operation();
  }
}

export class ConcreteDecoratorA extends BaseDecorator {
  operation(): string {
    return `DecoratorA(${super.operation()})`;
  }
}

export class ConcreteDecoratorB extends BaseDecorator {
  operation(): string {
    return `DecoratorB(${super.operation()})`;
  }
}

export function clientCode(component: Component): void {
  console.log("Result:", component.operation());
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const simple = new ConcreteComponent();
  clientCode(simple);
  // Result: ConcreteComponent
  
  const decorated = new ConcreteDecoratorB(new ConcreteDecoratorA(simple));
  clientCode(decorated);
  // Result: DecoratorB(DecoratorA(ConcreteComponent))
}
