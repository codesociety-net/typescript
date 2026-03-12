export interface Command {
  execute(): void;
  undo(): void;
}

export class Counter {
  value = 0;
}

export class IncrementCommand implements Command {
  constructor(private counter: Counter, private amount: number) {}

  execute(): void {
    this.counter.value += this.amount;
  }

  undo(): void {
    this.counter.value -= this.amount;
  }
}

export class ResetCommand implements Command {
  private previousValue = 0;

  constructor(private counter: Counter) {}

  execute(): void {
    this.previousValue = this.counter.value;
    this.counter.value = 0;
  }

  undo(): void {
    this.counter.value = this.previousValue;
  }
}

export class CommandHistory {
  private history: Command[] = [];

  execute(command: Command): void {
    command.execute();
    this.history.push(command);
  }

  undo(): void {
    const command = this.history.pop();
    command?.undo();
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const counter = new Counter();
  const history = new CommandHistory();
  
  history.execute(new IncrementCommand(counter, 10)); // value = 10
  history.execute(new IncrementCommand(counter, 5));  // value = 15
  history.execute(new ResetCommand(counter));          // value = 0
  history.undo();                                      // value = 15
  history.undo();                                      // value = 10
}
