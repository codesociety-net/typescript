import { describe, it, expect } from "vitest";
import { House, HouseBuilder, Director } from "./conceptual";

describe("Builder (Conceptual)", () => {
  describe("HouseBuilder fluent API", () => {
    it("builds a house with specified properties", () => {
      const builder = new HouseBuilder();
      const house = builder.setWalls(6).setDoors(2).setWindows(8).build();
      expect(house.walls).toBe(6);
      expect(house.doors).toBe(2);
      expect(house.windows).toBe(8);
    });

    it("supports garage and pool options", () => {
      const builder = new HouseBuilder();
      const house = builder.setGarage(true).setPool(true).build();
      expect(house.hasGarage).toBe(true);
      expect(house.hasPool).toBe(true);
    });

    it("defaults to no garage and no pool", () => {
      const builder = new HouseBuilder();
      const house = builder.setWalls(4).build();
      expect(house.hasGarage).toBe(false);
      expect(house.hasPool).toBe(false);
    });

    it("returns a House instance", () => {
      const builder = new HouseBuilder();
      const house = builder.build();
      expect(house).toBeInstanceOf(House);
    });

    it("resets after build, producing independent houses", () => {
      const builder = new HouseBuilder();
      const h1 = builder.setWalls(10).setPool(true).build();
      const h2 = builder.setWalls(4).build();
      expect(h1.walls).toBe(10);
      expect(h1.hasPool).toBe(true);
      expect(h2.walls).toBe(4);
      expect(h2.hasPool).toBe(false);
    });

    it("fluent methods return the builder for chaining", () => {
      const builder = new HouseBuilder();
      const result = builder.setWalls(4);
      expect(result).toBe(builder);
    });
  });

  describe("House.describe()", () => {
    it("lists all features", () => {
      const builder = new HouseBuilder();
      const house = builder.setWalls(4).setDoors(1).setWindows(2).setGarage(true).build();
      const desc = house.describe();
      expect(desc).toContain("4 walls");
      expect(desc).toContain("1 doors");
      expect(desc).toContain("2 windows");
      expect(desc).toContain("garage");
    });

    it("omits garage and pool when not set", () => {
      const builder = new HouseBuilder();
      const house = builder.setWalls(4).setDoors(1).setWindows(2).build();
      const desc = house.describe();
      expect(desc).not.toContain("garage");
      expect(desc).not.toContain("pool");
    });
  });

  describe("Director", () => {
    const director = new Director();
    const builder = new HouseBuilder();

    it("buildMinimal creates a basic house", () => {
      const house = director.buildMinimal(builder);
      expect(house.walls).toBe(4);
      expect(house.doors).toBe(1);
      expect(house.windows).toBe(2);
      expect(house.hasGarage).toBe(false);
      expect(house.hasPool).toBe(false);
    });

    it("buildLuxury creates a fully-featured house", () => {
      const house = director.buildLuxury(builder);
      expect(house.walls).toBe(8);
      expect(house.doors).toBe(4);
      expect(house.windows).toBe(12);
      expect(house.hasGarage).toBe(true);
      expect(house.hasPool).toBe(true);
    });
  });
});
