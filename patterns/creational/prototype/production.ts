// ── Document Template System ──────────────────────────────────────

export interface Cloneable<T> {
  clone(): T;
}

export class FontStyle implements Cloneable<FontStyle> {
  constructor(
    public family: string,
    public size: number,
    public weight: number,
    public color: string
  ) {}

  clone(): FontStyle {
    return new FontStyle(this.family, this.size, this.weight, this.color);
  }
}

export class Margin implements Cloneable<Margin> {
  constructor(public top: number, public right: number, public bottom: number, public left: number) {}
  clone(): Margin { return new Margin(this.top, this.right, this.bottom, this.left); }
}

export class Section implements Cloneable<Section> {
  constructor(
    public heading: string,
    public content: string,
    public font: FontStyle,
    public margin: Margin,
    public subsections: Section[] = []
  ) {}

  clone(): Section {
    return new Section(
      this.heading, this.content,
      this.font.clone(), this.margin.clone(),
      this.subsections.map(s => s.clone())
    );
  }
}

export class Document implements Cloneable<Document> {
  private readonly id = crypto.randomUUID();

  constructor(
    public title: string,
    public author: string,
    public tags: string[],
    public sections: Section[],
    public headerFont: FontStyle,
    public bodyFont: FontStyle,
    public pageMargin: Margin
  ) {}

  getId(): string { return this.id; }

  clone(): Document {
    return new Document(
      this.title, this.author,
      [...this.tags],
      this.sections.map(s => s.clone()),
      this.headerFont.clone(),
      this.bodyFont.clone(),
      this.pageMargin.clone()
    );
  }
}

// Template Registry
export class TemplateRegistry {
  private templates = new Map<string, Document>();

  register(name: string, template: Document): void { this.templates.set(name, template); }

  create(name: string): Document {
    const t = this.templates.get(name);
    if (!t) throw new Error(`Template "${name}" not found. Available: ${[...this.templates.keys()].join(", ")}`);
    return t.clone();
  }

  list(): string[] { return [...this.templates.keys()]; }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Pre-built templates
  const registry = new TemplateRegistry();
  const serif = new FontStyle("Georgia", 12, 400, "#333");
  const sans = new FontStyle("Helvetica", 11, 400, "#444");
  const margin = new Margin(72, 72, 72, 72);
  
  registry.register("report", new Document(
    "Untitled Report", "", ["report"],
    [
      new Section("Executive Summary", "", serif.clone(), margin.clone()),
      new Section("Findings", "", serif.clone(), margin.clone(), [
        new Section("Data Analysis", "", serif.clone(), margin.clone()),
      ]),
      new Section("Recommendations", "", serif.clone(), margin.clone()),
    ],
    new FontStyle("Georgia", 24, 700, "#111"), serif, margin
  ));
  
  const report = registry.create("report");
  report.title = "Q4 Performance Review";
  report.author = "Alice Chen";
}
