export class EditorMemento {
  constructor(
    private readonly content: string,
    private readonly cursor: number
  ) {}

  getContent(): string { return this.content; }
  getCursor(): number { return this.cursor; }
}

export class Editor {
  private content = "";
  private cursor = 0;

  type(text: string): void {
    this.content =
      this.content.slice(0, this.cursor) +
      text +
      this.content.slice(this.cursor);
    this.cursor += text.length;
  }

  save(): EditorMemento {
    return new EditorMemento(this.content, this.cursor);
  }

  restore(memento: EditorMemento): void {
    this.content = memento.getContent();
    this.cursor = memento.getCursor();
  }

  toString(): string {
    return `"${this.content}" (cursor: ${this.cursor})`;
  }
}

export class History {
  private mementos: EditorMemento[] = [];

  push(memento: EditorMemento): void {
    this.mementos.push(memento);
  }

  pop(): EditorMemento | undefined {
    return this.mementos.pop();
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const editor = new Editor();
  const history = new History();
  
  history.push(editor.save());
  editor.type("Hello");
  history.push(editor.save());
  editor.type(", World");
  
  console.log(editor.toString()); // "Hello, World" (cursor: 12)
  
  editor.restore(history.pop()!);
  console.log(editor.toString()); // "Hello" (cursor: 5)
  
  editor.restore(history.pop()!);
  console.log(editor.toString()); // "" (cursor: 0)
}
