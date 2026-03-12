export class House {
  walls = 0;
  doors = 0;
  windows = 0;
  hasGarage = false;
  hasPool = false;

  describe(): string {
    const features = [
      `${this.walls} walls`, `${this.doors} doors`, `${this.windows} windows`,
      this.hasGarage ? "garage" : null,
      this.hasPool ? "pool" : null,
    ].filter(Boolean);
    return `House with ${features.join(", ")}`;
  }
}

// Builder with fluent API
export class HouseBuilder {
  private house = new House();

  reset(): this { this.house = new House(); return this; }
  setWalls(n: number): this { this.house.walls = n; return this; }
  setDoors(n: number): this { this.house.doors = n; return this; }
  setWindows(n: number): this { this.house.windows = n; return this; }
  setGarage(v: boolean): this { this.house.hasGarage = v; return this; }
  setPool(v: boolean): this { this.house.hasPool = v; return this; }

  build(): House {
    const result = this.house;
    this.reset();
    return result;
  }
}

// Director orchestrates common configurations
export class Director {
  buildMinimal(b: HouseBuilder): House {
    return b.reset().setWalls(4).setDoors(1).setWindows(2).build();
  }

  buildLuxury(b: HouseBuilder): House {
    return b.reset().setWalls(8).setDoors(4).setWindows(12)
      .setGarage(true).setPool(true).build();
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const builder = new HouseBuilder();
  const director = new Director();
  
  console.log(director.buildMinimal(builder).describe());
  console.log(director.buildLuxury(builder).describe());
  
  // Or build manually
  const custom = builder.setWalls(6).setDoors(2).setWindows(8).setPool(true).build();
  console.log(custom.describe());
}
