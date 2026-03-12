import { describe, it, expect } from "vitest";
import { EditorMemento, Editor, History } from "./conceptual";

describe("Memento (Conceptual)", () => {
  it("editor starts empty", () => {
    const editor = new Editor();
    expect(editor.toString()).toBe('"" (cursor: 0)');
  });

  it("type adds text at cursor position", () => {
    const editor = new Editor();
    editor.type("Hello");
    expect(editor.toString()).toBe('"Hello" (cursor: 5)');
  });

  it("multiple types append text", () => {
    const editor = new Editor();
    editor.type("Hello");
    editor.type(", World");
    expect(editor.toString()).toBe('"Hello, World" (cursor: 12)');
  });

  it("save creates a memento capturing current state", () => {
    const editor = new Editor();
    editor.type("Test");
    const memento = editor.save();
    expect(memento.getContent()).toBe("Test");
    expect(memento.getCursor()).toBe(4);
  });

  it("restore brings back a previous state", () => {
    const editor = new Editor();
    editor.type("Hello");
    const snapshot = editor.save();
    editor.type(", World");
    editor.restore(snapshot);
    expect(editor.toString()).toBe('"Hello" (cursor: 5)');
  });

  it("History push and pop work correctly", () => {
    const history = new History();
    const m1 = new EditorMemento("a", 1);
    const m2 = new EditorMemento("b", 2);

    history.push(m1);
    history.push(m2);

    expect(history.pop()).toBe(m2);
    expect(history.pop()).toBe(m1);
  });

  it("History pop returns undefined when empty", () => {
    const history = new History();
    expect(history.pop()).toBeUndefined();
  });

  it("full save/restore workflow with history", () => {
    const editor = new Editor();
    const history = new History();

    history.push(editor.save());
    editor.type("Hello");
    history.push(editor.save());
    editor.type(", World");

    expect(editor.toString()).toBe('"Hello, World" (cursor: 12)');

    editor.restore(history.pop()!);
    expect(editor.toString()).toBe('"Hello" (cursor: 5)');

    editor.restore(history.pop()!);
    expect(editor.toString()).toBe('"" (cursor: 0)');
  });

  it("EditorMemento preserves content and cursor", () => {
    const memento = new EditorMemento("test content", 7);
    expect(memento.getContent()).toBe("test content");
    expect(memento.getCursor()).toBe(7);
  });

  it("restoring does not affect other editors", () => {
    const editor1 = new Editor();
    const editor2 = new Editor();

    editor1.type("Editor1");
    const snap = editor1.save();
    editor2.type("Editor2");
    editor2.restore(snap);

    expect(editor2.toString()).toBe('"Editor1" (cursor: 7)');
    expect(editor1.toString()).toBe('"Editor1" (cursor: 7)');
  });
});
