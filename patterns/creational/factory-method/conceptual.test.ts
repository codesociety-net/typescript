import { describe, it, expect } from "vitest";
import {
  Truck,
  Ship,
  RoadLogistics,
  SeaLogistics,
} from "./conceptual";

describe("Factory Method (Conceptual)", () => {
  describe("RoadLogistics", () => {
    it("createTransport returns a Truck", () => {
      const logistics = new RoadLogistics();
      const transport = logistics.createTransport();
      expect(transport).toBeInstanceOf(Truck);
    });

    it("planDelivery returns road delivery string", () => {
      const logistics = new RoadLogistics();
      const result = logistics.planDelivery("Electronics");
      expect(result).toBe('Delivering "Electronics" by road in a truck');
    });

    it("Truck.deliver includes cargo name", () => {
      const truck = new Truck();
      expect(truck.deliver("Furniture")).toContain("Furniture");
      expect(truck.deliver("Furniture")).toContain("truck");
    });
  });

  describe("SeaLogistics", () => {
    it("createTransport returns a Ship", () => {
      const logistics = new SeaLogistics();
      const transport = logistics.createTransport();
      expect(transport).toBeInstanceOf(Ship);
    });

    it("planDelivery returns sea delivery string", () => {
      const logistics = new SeaLogistics();
      const result = logistics.planDelivery("Grain");
      expect(result).toBe('Delivering "Grain" by sea in a ship');
    });

    it("Ship.deliver includes cargo name", () => {
      const ship = new Ship();
      expect(ship.deliver("Oil")).toContain("Oil");
      expect(ship.deliver("Oil")).toContain("ship");
    });
  });

  it("different creators produce different transport types", () => {
    const road = new RoadLogistics().createTransport();
    const sea = new SeaLogistics().createTransport();
    expect(road).toBeInstanceOf(Truck);
    expect(sea).toBeInstanceOf(Ship);
    expect(road).not.toBeInstanceOf(Ship);
    expect(sea).not.toBeInstanceOf(Truck);
  });
});
