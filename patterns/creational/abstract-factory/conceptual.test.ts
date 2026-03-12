import { describe, it, expect } from "vitest";
import {
  DarkButton,
  DarkTextInput,
  DarkThemeFactory,
  LightButton,
  LightTextInput,
  LightThemeFactory,
  buildForm,
} from "./conceptual";

describe("Abstract Factory (Conceptual)", () => {
  describe("DarkThemeFactory", () => {
    const factory = new DarkThemeFactory();

    it("createButton returns a DarkButton", () => {
      expect(factory.createButton()).toBeInstanceOf(DarkButton);
    });

    it("createTextInput returns a DarkTextInput", () => {
      expect(factory.createTextInput()).toBeInstanceOf(DarkTextInput);
    });

    it("DarkButton renders with dark-btn class", () => {
      const btn = factory.createButton();
      expect(btn.render()).toContain("dark-btn");
    });

    it("DarkTextInput renders with dark-input class", () => {
      const input = factory.createTextInput();
      expect(input.render()).toContain("dark-input");
    });
  });

  describe("LightThemeFactory", () => {
    const factory = new LightThemeFactory();

    it("createButton returns a LightButton", () => {
      expect(factory.createButton()).toBeInstanceOf(LightButton);
    });

    it("createTextInput returns a LightTextInput", () => {
      expect(factory.createTextInput()).toBeInstanceOf(LightTextInput);
    });

    it("LightButton renders with light-btn class", () => {
      const btn = factory.createButton();
      expect(btn.render()).toContain("light-btn");
    });

    it("LightTextInput renders with light-input class", () => {
      const input = factory.createTextInput();
      expect(input.render()).toContain("light-input");
    });
  });

  describe("buildForm", () => {
    it("builds a form string with dark theme components", () => {
      const form = buildForm(new DarkThemeFactory());
      expect(form).toContain("dark-btn");
      expect(form).toContain("dark-input");
      expect(form).toMatch(/^Form:/);
    });

    it("builds a form string with light theme components", () => {
      const form = buildForm(new LightThemeFactory());
      expect(form).toContain("light-btn");
      expect(form).toContain("light-input");
    });

    it("dark and light forms produce different output", () => {
      const dark = buildForm(new DarkThemeFactory());
      const light = buildForm(new LightThemeFactory());
      expect(dark).not.toBe(light);
    });
  });
});
