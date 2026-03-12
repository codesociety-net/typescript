import { describe, it, expect } from "vitest";
import { RedLight, GreenLight, YellowLight, TrafficLight } from "./conceptual";

describe("State (Conceptual)", () => {
  it("TrafficLight starts in red state", () => {
    const light = new TrafficLight();
    expect(light.getColor()).toBe("red");
    expect(light.canGo()).toBe(false);
  });

  it("advancing from red goes to green", () => {
    const light = new TrafficLight();
    light.advance();
    expect(light.getColor()).toBe("green");
    expect(light.canGo()).toBe(true);
  });

  it("advancing from green goes to yellow", () => {
    const light = new TrafficLight();
    light.advance(); // green
    light.advance(); // yellow
    expect(light.getColor()).toBe("yellow");
    expect(light.canGo()).toBe(false);
  });

  it("advancing from yellow goes back to red", () => {
    const light = new TrafficLight();
    light.advance(); // green
    light.advance(); // yellow
    light.advance(); // red
    expect(light.getColor()).toBe("red");
    expect(light.canGo()).toBe(false);
  });

  it("full cycle returns to starting state", () => {
    const light = new TrafficLight();
    light.advance(); // green
    light.advance(); // yellow
    light.advance(); // red
    expect(light.getColor()).toBe("red");
  });

  it("RedLight.next() returns GreenLight", () => {
    const red = new RedLight();
    const next = red.next();
    expect(next.color).toBe("green");
  });

  it("GreenLight.next() returns YellowLight", () => {
    const green = new GreenLight();
    const next = green.next();
    expect(next.color).toBe("yellow");
  });

  it("YellowLight.next() returns RedLight", () => {
    const yellow = new YellowLight();
    const next = yellow.next();
    expect(next.color).toBe("red");
  });

  it("only green light allows go", () => {
    expect(new RedLight().canGo()).toBe(false);
    expect(new GreenLight().canGo()).toBe(true);
    expect(new YellowLight().canGo()).toBe(false);
  });
});
