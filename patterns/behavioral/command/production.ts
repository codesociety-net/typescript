// ── Text Editor with Command History ─────────────────────────────

export interface EditorCommand {
  readonly description: string;
  execute(state: EditorState): EditorState;
  undo(state: EditorState): EditorState;
}

export interface EditorState {
  content: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
}

// ── Commands ──────────────────────────────────────────────────────

export class InsertTextCommand implements EditorCommand {
  readonly description: string;

  constructor(private text: string, private position: number) {
    this.description = `Insert "${text}" at ${position}`;
  }

  execute(state: EditorState): EditorState {
    const content =
      state.content.slice(0, this.position) +
      this.text +
      state.content.slice(this.position);
    return { ...state, content, cursorPosition: this.position + this.text.length };
  }

  undo(state: EditorState): EditorState {
    const content =
      state.content.slice(0, this.position) +
      state.content.slice(this.position + this.text.length);
    return { ...state, content, cursorPosition: this.position };
  }
}

export class DeleteTextCommand implements EditorCommand {
  readonly description: string;
  private deletedText = "";

  constructor(private start: number, private end: number) {
    this.description = `Delete range [${start}, ${end}]`;
  }

  execute(state: EditorState): EditorState {
    this.deletedText = state.content.slice(this.start, this.end);
    const content = state.content.slice(0, this.start) + state.content.slice(this.end);
    return { ...state, content, cursorPosition: this.start };
  }

  undo(state: EditorState): EditorState {
    const content =
      state.content.slice(0, this.start) +
      this.deletedText +
      state.content.slice(this.start);
    return { ...state, content, cursorPosition: this.end };
  }
}

// ── Editor (Invoker) ──────────────────────────────────────────────

export class TextEditor {
  private state: EditorState = { content: "", cursorPosition: 0, selectionStart: 0, selectionEnd: 0 };
  private undoStack: EditorCommand[] = [];
  private redoStack: EditorCommand[] = [];

  execute(command: EditorCommand): void {
    this.state = command.execute(this.state);
    this.undoStack.push(command);
    this.redoStack = [];
  }

  undo(): string | null {
    const command = this.undoStack.pop();
    if (!command) return null;
    this.state = command.undo(this.state);
    this.redoStack.push(command);
    return command.description;
  }

  redo(): string | null {
    const command = this.redoStack.pop();
    if (!command) return null;
    this.state = command.execute(this.state);
    this.undoStack.push(command);
    return command.description;
  }

  getContent(): string { return this.state.content; }
  getHistory(): string[] { return this.undoStack.map(c => c.description); }
}

