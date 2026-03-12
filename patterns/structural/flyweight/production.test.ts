import { describe, it, expect } from "vitest";
import {
  GameEntity,
  EntityFactory,
  type EntityType,
  type EntityState,
} from "./production";

describe("Flyweight (Production)", () => {
  const orcType: EntityType = {
    kind: "orc",
    textureUrl: "/textures/orc.png",
    meshData: new Float32Array(16),
    baseStats: { attack: 15, defense: 8, speed: 3 },
  };

  const elfType: EntityType = {
    kind: "elf",
    textureUrl: "/textures/elf.png",
    meshData: new Float32Array(16),
    baseStats: { attack: 12, defense: 6, speed: 7 },
  };

  describe("GameEntity", () => {
    it("stores the entity type as shared state", () => {
      const entity = new GameEntity(orcType);
      expect(entity.type).toBe(orcType);
      expect(entity.type.kind).toBe("orc");
    });

    it("render does not throw", () => {
      const entity = new GameEntity(orcType);
      const state: EntityState = { x: 0, y: 0, health: 100 };
      expect(() => entity.render(state)).not.toThrow();
    });

    it("update moves x position based on speed and delta", () => {
      const entity = new GameEntity(orcType);
      const state: EntityState = { x: 0, y: 0, health: 100 };
      const updated = entity.update(state, 1000);
      expect(updated.x).toBe(3); // speed=3, delta=1s
      expect(updated.y).toBe(0);
      expect(updated.health).toBe(100);
    });

    it("update does not mutate the original state", () => {
      const entity = new GameEntity(elfType);
      const state: EntityState = { x: 10, y: 5, health: 80 };
      const updated = entity.update(state, 500);
      expect(state.x).toBe(10); // unchanged
      expect(updated.x).toBe(10 + 7 * 0.5); // speed=7, 0.5s
    });
  });

  describe("EntityFactory", () => {
    it("register adds a flyweight", () => {
      const factory = new EntityFactory();
      factory.register(orcType);
      expect(factory.flyweightCount).toBe(1);
    });

    it("registering the same kind twice does not create a duplicate", () => {
      const factory = new EntityFactory();
      factory.register(orcType);
      factory.register(orcType);
      expect(factory.flyweightCount).toBe(1);
    });

    it("get returns the registered flyweight", () => {
      const factory = new EntityFactory();
      factory.register(orcType);
      const entity = factory.get("orc");
      expect(entity.type.kind).toBe("orc");
    });

    it("get throws for unknown kind", () => {
      const factory = new EntityFactory();
      expect(() => factory.get("dragon")).toThrow('Unknown entity kind: "dragon"');
    });

    it("multiple registrations share distinct flyweights", () => {
      const factory = new EntityFactory();
      factory.register(orcType);
      factory.register(elfType);
      expect(factory.flyweightCount).toBe(2);
      expect(factory.get("orc")).not.toBe(factory.get("elf"));
    });

    it("1000 entities share just 2 flyweights", () => {
      const factory = new EntityFactory();
      factory.register(orcType);
      factory.register(elfType);
      const entities: GameEntity[] = [];
      for (let i = 0; i < 1000; i++) {
        entities.push(factory.get(i % 2 === 0 ? "orc" : "elf"));
      }
      expect(factory.flyweightCount).toBe(2);
      expect(entities[0]).toBe(entities[2]); // same orc flyweight
      expect(entities[1]).toBe(entities[3]); // same elf flyweight
    });
  });
});
