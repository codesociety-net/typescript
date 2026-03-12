// Composite Pattern – Production
// File-system tree where files and folders share a uniform Node interface.

export interface FsNode {
  name: string;
  size(): number;          // bytes
  print(indent?: string): void;
}

// ── Leaf: File ────────────────────────────────────────────────────────────────
export class File implements FsNode {
  constructor(
    public readonly name: string,
    private readonly bytes: number,
  ) {}

  size(): number { return this.bytes; }

  print(indent = ""): void {
    console.log(`${indent}📄 ${this.name} (${this.bytes} B)`);
  }
}

// ── Composite: Directory ──────────────────────────────────────────────────────
export class Directory implements FsNode {
  private children: FsNode[] = [];

  constructor(public readonly name: string) {}

  add(node: FsNode): this {
    this.children.push(node);
    return this;
  }

  remove(name: string): boolean {
    const before = this.children.length;
    this.children = this.children.filter((n) => n.name !== name);
    return this.children.length < before;
  }

  find(name: string): FsNode | undefined {
    for (const child of this.children) {
      if (child.name === name) return child;
      if (child instanceof Directory) {
        const found = child.find(name);
        if (found) return found;
      }
    }
    return undefined;
  }

  size(): number {
    return this.children.reduce((sum, c) => sum + c.size(), 0);
  }

  print(indent = ""): void {
    console.log(`${indent}📁 ${this.name}/ (${this.size()} B)`);
    for (const child of this.children) {
      child.print(indent + "  ");
    }
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Usage ──────────────────────────────────────────────────────────────────────
  const root = new Directory("project")
    .add(
      new Directory("src")
        .add(new File("index.ts", 1200))
        .add(new File("utils.ts", 800)),
    )
    .add(
      new Directory("tests")
        .add(new File("index.test.ts", 600)),
    )
    .add(new File("package.json", 300));
  
  root.print();
  console.log("Total size:", root.size(), "B");
}
