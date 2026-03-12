// Composite Pattern – Conceptual
// Treats individual objects and compositions uniformly via a shared interface.

export interface Component {
  operation(): string;
  add?(c: Component): void;
  remove?(c: Component): void;
  isComposite(): boolean;
}

export class Leaf implements Component {
  constructor(private name: string) {}
  operation(): string { return `Leaf(${this.name})`; }
  isComposite(): boolean { return false; }
}

export class Composite implements Component {
  private children: Component[] = [];

  add(c: Component): void { this.children.push(c); }
  remove(c: Component): void {
    this.children = this.children.filter((ch) => ch !== c);
  }
  isComposite(): boolean { return true; }

  operation(): string {
    const results = this.children.map((c) => c.operation());
    return `Branch(${results.join("+")})`;
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Build tree:  Root → [Branch(Leaf1+Leaf2), Leaf3]
  const tree = new Composite();
  const branch = new Composite();
  branch.add(new Leaf("1"));
  branch.add(new Leaf("2"));
  tree.add(branch);
  tree.add(new Leaf("3"));
  
  console.log(tree.operation());
  // Branch(Branch(Leaf(1)+Leaf(2))+Leaf(3))
}
