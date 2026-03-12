export type Listener<T> = (event: T) => void;

export class EventEmitter<T> {
  private listeners: Listener<T>[] = [];

  subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: Listener<T>): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  emit(event: T): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

// Usage
export interface StockUpdate {
  symbol: string;
  price: number;
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const stockFeed = new EventEmitter<StockUpdate>();
  
  const unsubscribe = stockFeed.subscribe(update => {
    console.log(`${update.symbol}: $${update.price}`);
  });
  
  stockFeed.emit({ symbol: "AAPL", price: 182.5 });
  stockFeed.emit({ symbol: "GOOG", price: 141.3 });
  
  unsubscribe();
  
  stockFeed.emit({ symbol: "AAPL", price: 183.0 }); // not received
}
