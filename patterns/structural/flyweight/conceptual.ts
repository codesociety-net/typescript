// Flyweight Pattern – Conceptual
// Shares intrinsic (immutable) character state; extrinsic state is passed in.

export interface CharacterStyle {
  font: string;
  size: number;
  bold: boolean;
}

// Flyweight: holds shared intrinsic state
export class Character {
  constructor(
    public readonly char: string,
    public readonly style: CharacterStyle,
  ) {}

  render(x: number, y: number): void {
    console.log(
      `"${this.char}" [${this.style.font} ${this.style.size}px${this.style.bold ? " bold" : ""}] @ (${x},${y})`,
    );
  }
}

// Factory / pool
export class CharacterFactory {
  private pool = new Map<string, Character>();

  get(char: string, style: CharacterStyle): Character {
    const key = `${char}|${style.font}|${style.size}|${style.bold}`;
    if (!this.pool.has(key)) {
      this.pool.set(key, new Character(char, style));
      console.log(`[Factory] created flyweight for key "${key}"`);
    }
    return this.pool.get(key)!;
  }

  get poolSize(): number { return this.pool.size; }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const factory = new CharacterFactory();
  const style: CharacterStyle = { font: "Arial", size: 12, bold: false };
  
  // Rendering "ABBA" – "A" and "B" flyweights are reused
  const text = ["A", "B", "B", "A"];
  text.forEach((ch, i) => factory.get(ch, style).render(i * 10, 0));
  
  console.log("Flyweights in pool:", factory.poolSize); // 2, not 4
}
