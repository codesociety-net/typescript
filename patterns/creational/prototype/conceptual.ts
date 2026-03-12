export interface Prototype<T> {
  clone(): T;
}

export class Shape implements Prototype<Shape> {
  constructor(
    public type: string,
    public x: number,
    public y: number,
    public color: string
  ) {}

  clone(): Shape {
    return new Shape(this.type, this.x, this.y, this.color);
  }

  toString(): string {
    return `${this.color} ${this.type} at (${this.x}, ${this.y})`;
  }
}

export class GroupShape implements Prototype<GroupShape> {
  constructor(public name: string, public shapes: Shape[]) {}

  clone(): GroupShape {
    return new GroupShape(this.name, this.shapes.map(s => s.clone()));
  }
}

// Prototype registry
export class ShapeRegistry {
  private templates = new Map<string, Shape>();

  register(key: string, shape: Shape): void {
    this.templates.set(key, shape);
  }

  create(key: string): Shape {
    const template = this.templates.get(key);
    if (!template) throw new Error(`No template: "${key}"`);
    return template.clone();
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const registry = new ShapeRegistry();
  registry.register("red-circle", new Shape("circle", 0, 0, "red"));
  
  const c1 = registry.create("red-circle");
  const c2 = registry.create("red-circle");
  c2.x = 50;
  c2.y = 100;
  
  console.log(c1.toString()); // "red circle at (0, 0)"
  console.log(c2.toString()); // "red circle at (50, 100)"
  console.log(c1 === c2);     // false
}
