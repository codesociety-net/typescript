export interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
}

export interface Iterable<T> {
  createIterator(): Iterator<T>;
}

export class NumberRange implements Iterable<number> {
  constructor(
    private readonly start: number,
    private readonly end: number,
    private readonly step: number = 1
  ) {}

  createIterator(): Iterator<number> {
    return new RangeIterator(this.start, this.end, this.step);
  }
}

export class RangeIterator implements Iterator<number> {
  private current: number;

  constructor(
    private start: number,
    private end: number,
    private step: number
  ) {
    this.current = start;
  }

  hasNext(): boolean {
    return this.current <= this.end;
  }

  next(): number {
    if (!this.hasNext()) throw new Error("No more elements");
    const value = this.current;
    this.current += this.step;
    return value;
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage — also supports for...of via Symbol.iterator
  const range = new NumberRange(1, 10, 2);
  const iter = range.createIterator();
  
  while (iter.hasNext()) {
    console.log(iter.next()); // 1, 3, 5, 7, 9
  }
}
