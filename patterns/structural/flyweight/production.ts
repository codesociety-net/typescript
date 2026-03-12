// Flyweight Pattern – Production
// Game entity system: sprites share heavy intrinsic state (texture, mesh, stats)
// while each instance only stores lightweight extrinsic state (position, health).

// ── Intrinsic (shared) state ───────────────────────────────────────────────────
export interface EntityType {
  readonly kind: string;
  readonly textureUrl: string;
  readonly meshData: Float32Array; // large; shared across all instances
  readonly baseStats: { attack: number; defense: number; speed: number };
}

// ── Extrinsic (per-instance) state ────────────────────────────────────────────
export interface EntityState {
  x: number;
  y: number;
  health: number;
}

// ── Flyweight ─────────────────────────────────────────────────────────────────
export class GameEntity {
  constructor(public readonly type: EntityType) {}

  render(state: EntityState): void {
    // In a real engine this would issue a GPU draw call using type.meshData
    console.log(
      `[${this.type.kind}] pos=(${state.x},${state.y}) hp=${state.health} tex=${this.type.textureUrl}`,
    );
  }

  update(state: EntityState, deltaMs: number): EntityState {
    // Simplified movement – real logic would use type.baseStats.speed
    return { ...state, x: state.x + this.type.baseStats.speed * (deltaMs / 1000) };
  }
}

// ── Factory / registry ────────────────────────────────────────────────────────
export class EntityFactory {
  private flyweights = new Map<string, GameEntity>();

  register(type: EntityType): void {
    if (!this.flyweights.has(type.kind)) {
      this.flyweights.set(type.kind, new GameEntity(type));
      console.log(`[EntityFactory] registered flyweight "${type.kind}"`);
    }
  }

  get(kind: string): GameEntity {
    const fw = this.flyweights.get(kind);
    if (!fw) throw new Error(`Unknown entity kind: "${kind}"`);
    return fw;
  }

  get flyweightCount(): number { return this.flyweights.size; }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Usage ──────────────────────────────────────────────────────────────────────
  const factory = new EntityFactory();
  
  factory.register({
    kind: "orc",
    textureUrl: "/textures/orc.png",
    meshData: new Float32Array(1024), // large shared buffer
    baseStats: { attack: 15, defense: 8, speed: 3 },
  });
  
  factory.register({
    kind: "elf",
    textureUrl: "/textures/elf.png",
    meshData: new Float32Array(1024),
    baseStats: { attack: 12, defense: 6, speed: 7 },
  });
  
  // Thousands of entities share just 2 flyweights
  const entities: Array<{ fw: GameEntity; state: EntityState }> = [];
  for (let i = 0; i < 1000; i++) {
    const kind = i % 2 === 0 ? "orc" : "elf";
    entities.push({ fw: factory.get(kind), state: { x: i * 2, y: 0, health: 100 } });
  }
  
  // Render first 3 to verify
  entities.slice(0, 3).forEach(({ fw, state }) => fw.render(state));
  console.log("Flyweights used:", factory.flyweightCount); // 2, not 1000
}
