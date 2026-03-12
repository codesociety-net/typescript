// Bridge Pattern – Conceptual
// Decouples an abstraction (Shape) from its implementation (Renderer)
// so both can vary independently.

export interface Renderer {
  renderCircle(radius: number): void;
  renderSquare(side: number): void;
}

export class VectorRenderer implements Renderer {
  renderCircle(r: number): void { console.log(`Drawing circle (r=${r}) as vector`); }
  renderSquare(s: number): void { console.log(`Drawing square (s=${s}) as vector`); }
}

export class RasterRenderer implements Renderer {
  renderCircle(r: number): void { console.log(`Drawing circle (r=${r}) as pixels`); }
  renderSquare(s: number): void { console.log(`Drawing square (s=${s}) as pixels`); }
}

export abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): void;
  abstract resize(factor: number): void;
}

export class Circle extends Shape {
  constructor(renderer: Renderer, private radius: number) { super(renderer); }
  draw(): void { this.renderer.renderCircle(this.radius); }
  resize(factor: number): void { this.radius *= factor; }
}

export class Square extends Shape {
  constructor(renderer: Renderer, private side: number) { super(renderer); }
  draw(): void { this.renderer.renderSquare(this.side); }
  resize(factor: number): void { this.side *= factor; }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const vector = new VectorRenderer();
  const raster = new RasterRenderer();
  
  new Circle(vector, 5).draw();   // Drawing circle (r=5) as vector
  new Square(raster, 10).draw();  // Drawing square (s=10) as pixels
}
