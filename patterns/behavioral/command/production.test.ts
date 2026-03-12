import { describe, it, expect } from "vitest";
import { InsertTextCommand, DeleteTextCommand, TextEditor } from "./production";

describe("Command — Text Editor", () => {
  it("InsertTextCommand inserts text at the given position", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Hello", 0));
    expect(editor.getContent()).toBe("Hello");
  });

  it("multiple inserts build up content", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Hello", 0));
    editor.execute(new InsertTextCommand(", World", 5));
    expect(editor.getContent()).toBe("Hello, World");
  });

  it("DeleteTextCommand removes a range of text", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Hello, World", 0));
    editor.execute(new DeleteTextCommand(5, 7)); // remove ", "
    expect(editor.getContent()).toBe("HelloWorld");
  });

  it("undo reverses the last command", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Hello", 0));
    editor.undo();
    expect(editor.getContent()).toBe("");
  });

  it("undo on empty history returns null", () => {
    const editor = new TextEditor();
    expect(editor.undo()).toBeNull();
  });

  it("redo re-applies an undone command", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Hello", 0));
    editor.undo();
    editor.redo();
    expect(editor.getContent()).toBe("Hello");
  });

  it("redo on empty redo stack returns null", () => {
    const editor = new TextEditor();
    expect(editor.redo()).toBeNull();
  });

  it("executing a new command clears redo stack", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Hello", 0));
    editor.undo();
    editor.execute(new InsertTextCommand("Hi", 0));
    expect(editor.redo()).toBeNull();
    expect(editor.getContent()).toBe("Hi");
  });

  it("undo of DeleteTextCommand restores deleted text", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("ABCDEF", 0));
    editor.execute(new DeleteTextCommand(2, 4)); // remove "CD"
    expect(editor.getContent()).toBe("ABEF");
    editor.undo();
    expect(editor.getContent()).toBe("ABCDEF");
  });

  it("getHistory returns descriptions of executed commands", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Hi", 0));
    editor.execute(new DeleteTextCommand(0, 1));
    const history = editor.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toContain("Insert");
    expect(history[1]).toContain("Delete");
  });

  it("undo returns the description of the undone command", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Test", 0));
    const desc = editor.undo();
    expect(desc).toContain("Insert");
  });

  it("redo returns the description of the redone command", () => {
    const editor = new TextEditor();
    editor.execute(new InsertTextCommand("Test", 0));
    editor.undo();
    const desc = editor.redo();
    expect(desc).toContain("Insert");
  });
});
