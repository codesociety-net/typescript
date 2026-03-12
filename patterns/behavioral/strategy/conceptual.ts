export interface SortStrategy<T> {
  sort(data: T[]): T[];
}

export class BubbleSort<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    const arr = [...data];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }
}

export class QuickSort<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    if (data.length <= 1) return data;
    const pivot = data[Math.floor(data.length / 2)];
    const left = data.filter(x => x < pivot);
    const mid = data.filter(x => x === pivot);
    const right = data.filter(x => x > pivot);
    return [...this.sort(left), ...mid, ...this.sort(right)];
  }
}

export class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(data: T[]): T[] {
    return this.strategy.sort(data);
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const sorter = new Sorter(new BubbleSort<number>());
  console.log(sorter.sort([5, 3, 1, 4, 2])); // [1, 2, 3, 4, 5]
  
  sorter.setStrategy(new QuickSort<number>());
  console.log(sorter.sort([5, 3, 1, 4, 2])); // [1, 2, 3, 4, 5]
}
