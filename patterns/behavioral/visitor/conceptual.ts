export interface ShapeVisitor {
  visitCircle(shape: Circle): number;
  visitRectangle(shape: Rectangle): number;
  visitTriangle(shape: Triangle): number;
}

export interface Shape {
  accept<T>(visitor: { visitCircle(s: Circle): T; visitRectangle(s: Rectangle): T; visitTriangle(s: Triangle): T }): T;
}

export class Circle implements Shape {
  constructor(public radius: number) {}
  accept<T>(visitor: { visitCircle(s: Circle): T; visitRectangle(s: Rectangle): T; visitTriangle(s: Triangle): T }): T {
    return visitor.visitCircle(this);
  }
}

export class Rectangle implements Shape {
  constructor(public width: number, public height: number) {}
  accept<T>(visitor: { visitCircle(s: Circle): T; visitRectangle(s: Rectangle): T; visitTriangle(s: Triangle): T }): T {
    return visitor.visitRectangle(this);
  }
}

export class Triangle implements Shape {
  constructor(public base: number, public height: number, public sideA: number, public sideB: number) {}
  accept<T>(visitor: { visitCircle(s: Circle): T; visitRectangle(s: Rectangle): T; visitTriangle(s: Triangle): T }): T {
    return visitor.visitTriangle(this);
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const areaVisitor: ShapeVisitor = {
    visitCircle:    s => Math.PI * s.radius ** 2,
    visitRectangle: s => s.width * s.height,
    visitTriangle:  s => 0.5 * s.base * s.height,
  };
  
  const perimeterVisitor: ShapeVisitor = {
    visitCircle:    s => 2 * Math.PI * s.radius,
    visitRectangle: s => 2 * (s.width + s.height),
    visitTriangle:  s => s.base + s.sideA + s.sideB,
  };
  
  const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6), new Triangle(3, 4, 3, 5)];
  
  console.log("Areas:",     shapes.map(s => s.accept(areaVisitor)));
  console.log("Perimeters:", shapes.map(s => s.accept(perimeterVisitor)));
}
