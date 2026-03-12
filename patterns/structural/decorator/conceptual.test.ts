import { describe, it, expect } from "vitest";
import {
  ConcreteComponent,
  BaseDecorator,
  ConcreteDecoratorA,
  ConcreteDecoratorB,
} from "./conceptual";

describe("Decorator (Conceptual)", () => {
  it("ConcreteComponent.operation returns base string", () => {
    const component = new ConcreteComponent();
    expect(component.operation()).toBe("ConcreteComponent");
  });

  it("BaseDecorator delegates to wrapped component", () => {
    const component = new ConcreteComponent();
    const decorator = new BaseDecorator(component);
    expect(decorator.operation()).toBe("ConcreteComponent");
  });

  it("ConcreteDecoratorA wraps output with DecoratorA()", () => {
    const component = new ConcreteComponent();
    const decorated = new ConcreteDecoratorA(component);
    expect(decorated.operation()).toBe("DecoratorA(ConcreteComponent)");
  });

  it("ConcreteDecoratorB wraps output with DecoratorB()", () => {
    const component = new ConcreteComponent();
    const decorated = new ConcreteDecoratorB(component);
    expect(decorated.operation()).toBe("DecoratorB(ConcreteComponent)");
  });

  it("decorators can be stacked: B(A(Component))", () => {
    const component = new ConcreteComponent();
    const decorated = new ConcreteDecoratorB(new ConcreteDecoratorA(component));
    expect(decorated.operation()).toBe("DecoratorB(DecoratorA(ConcreteComponent))");
  });

  it("decorators can be stacked: A(B(Component))", () => {
    const component = new ConcreteComponent();
    const decorated = new ConcreteDecoratorA(new ConcreteDecoratorB(component));
    expect(decorated.operation()).toBe("DecoratorA(DecoratorB(ConcreteComponent))");
  });

  it("double wrapping with same decorator works", () => {
    const component = new ConcreteComponent();
    const decorated = new ConcreteDecoratorA(new ConcreteDecoratorA(component));
    expect(decorated.operation()).toBe("DecoratorA(DecoratorA(ConcreteComponent))");
  });
});
