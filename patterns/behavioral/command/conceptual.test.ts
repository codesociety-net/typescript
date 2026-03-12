import { describe, it, expect } from "vitest";
import { Counter, IncrementCommand, ResetCommand, CommandHistory } from "./conceptual";

describe("Command (Conceptual)", () => {
  it("IncrementCommand increases the counter value", () => {
    const counter = new Counter();
    const cmd = new IncrementCommand(counter, 10);
    cmd.execute();
    expect(counter.value).toBe(10);
  });

  it("IncrementCommand undo decreases the counter value", () => {
    const counter = new Counter();
    const cmd = new IncrementCommand(counter, 10);
    cmd.execute();
    cmd.undo();
    expect(counter.value).toBe(0);
  });

  it("ResetCommand sets value to zero", () => {
    const counter = new Counter();
    counter.value = 42;
    const cmd = new ResetCommand(counter);
    cmd.execute();
    expect(counter.value).toBe(0);
  });

  it("ResetCommand undo restores the previous value", () => {
    const counter = new Counter();
    counter.value = 42;
    const cmd = new ResetCommand(counter);
    cmd.execute();
    cmd.undo();
    expect(counter.value).toBe(42);
  });

  it("CommandHistory executes and tracks commands", () => {
    const counter = new Counter();
    const history = new CommandHistory();

    history.execute(new IncrementCommand(counter, 10));
    expect(counter.value).toBe(10);

    history.execute(new IncrementCommand(counter, 5));
    expect(counter.value).toBe(15);
  });

  it("CommandHistory undo reverses the last command", () => {
    const counter = new Counter();
    const history = new CommandHistory();

    history.execute(new IncrementCommand(counter, 10));
    history.execute(new IncrementCommand(counter, 5));
    history.undo();
    expect(counter.value).toBe(10);
  });

  it("CommandHistory supports multiple undos in sequence", () => {
    const counter = new Counter();
    const history = new CommandHistory();

    history.execute(new IncrementCommand(counter, 10));
    history.execute(new IncrementCommand(counter, 5));
    history.execute(new ResetCommand(counter));

    expect(counter.value).toBe(0);
    history.undo(); // undo reset
    expect(counter.value).toBe(15);
    history.undo(); // undo +5
    expect(counter.value).toBe(10);
    history.undo(); // undo +10
    expect(counter.value).toBe(0);
  });

  it("undo on empty history does nothing", () => {
    const history = new CommandHistory();
    expect(() => history.undo()).not.toThrow();
  });

  it("Counter starts at zero", () => {
    expect(new Counter().value).toBe(0);
  });
});
