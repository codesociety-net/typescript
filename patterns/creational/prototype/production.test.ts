import { describe, it, expect } from "vitest";
import {
  FontStyle,
  Margin,
  Section,
  Document,
  TemplateRegistry,
} from "./production";

describe("Document Template System (Production Prototype)", () => {
  describe("FontStyle", () => {
    it("clones with identical properties", () => {
      const font = new FontStyle("Arial", 14, 700, "#000");
      const cloned = font.clone();
      expect(cloned).not.toBe(font);
      expect(cloned.family).toBe("Arial");
      expect(cloned.size).toBe(14);
      expect(cloned.weight).toBe(700);
      expect(cloned.color).toBe("#000");
    });

    it("cloned font is independent", () => {
      const font = new FontStyle("Arial", 14, 700, "#000");
      const cloned = font.clone();
      cloned.size = 20;
      expect(font.size).toBe(14);
    });
  });

  describe("Margin", () => {
    it("clones with identical values", () => {
      const margin = new Margin(10, 20, 30, 40);
      const cloned = margin.clone();
      expect(cloned).not.toBe(margin);
      expect(cloned.top).toBe(10);
      expect(cloned.right).toBe(20);
      expect(cloned.bottom).toBe(30);
      expect(cloned.left).toBe(40);
    });

    it("cloned margin is independent", () => {
      const margin = new Margin(72, 72, 72, 72);
      const cloned = margin.clone();
      cloned.top = 0;
      expect(margin.top).toBe(72);
    });
  });

  describe("Section", () => {
    it("deep clones font and margin", () => {
      const font = new FontStyle("Georgia", 12, 400, "#333");
      const margin = new Margin(10, 10, 10, 10);
      const section = new Section("Intro", "Content here", font, margin);
      const cloned = section.clone();

      expect(cloned).not.toBe(section);
      expect(cloned.font).not.toBe(font);
      expect(cloned.margin).not.toBe(margin);
      expect(cloned.heading).toBe("Intro");
    });

    it("deep clones subsections", () => {
      const font = new FontStyle("Georgia", 12, 400, "#333");
      const margin = new Margin(10, 10, 10, 10);
      const sub = new Section("Sub", "sub content", font.clone(), margin.clone());
      const section = new Section("Parent", "parent", font, margin, [sub]);
      const cloned = section.clone();

      expect(cloned.subsections.length).toBe(1);
      expect(cloned.subsections[0]).not.toBe(sub);
      cloned.subsections[0].heading = "Changed";
      expect(sub.heading).toBe("Sub");
    });
  });

  describe("Document", () => {
    const makeDoc = () =>
      new Document(
        "Report",
        "Alice",
        ["report", "q4"],
        [
          new Section(
            "Summary",
            "text",
            new FontStyle("Georgia", 12, 400, "#333"),
            new Margin(72, 72, 72, 72)
          ),
        ],
        new FontStyle("Georgia", 24, 700, "#111"),
        new FontStyle("Georgia", 12, 400, "#333"),
        new Margin(72, 72, 72, 72)
      );

    it("clone produces a new Document with a different id", () => {
      const doc = makeDoc();
      const cloned = doc.clone();
      expect(cloned).not.toBe(doc);
      expect(cloned.getId()).not.toBe(doc.getId());
    });

    it("clone copies title and author", () => {
      const doc = makeDoc();
      const cloned = doc.clone();
      expect(cloned.title).toBe("Report");
      expect(cloned.author).toBe("Alice");
    });

    it("clone deep-copies tags array", () => {
      const doc = makeDoc();
      const cloned = doc.clone();
      cloned.tags.push("extra");
      expect(doc.tags).toEqual(["report", "q4"]);
    });

    it("clone deep-copies sections", () => {
      const doc = makeDoc();
      const cloned = doc.clone();
      cloned.sections[0].heading = "Modified";
      expect(doc.sections[0].heading).toBe("Summary");
    });

    it("clone deep-copies fonts", () => {
      const doc = makeDoc();
      const cloned = doc.clone();
      cloned.headerFont.size = 48;
      expect(doc.headerFont.size).toBe(24);
    });

    it("clone deep-copies page margin", () => {
      const doc = makeDoc();
      const cloned = doc.clone();
      cloned.pageMargin.top = 0;
      expect(doc.pageMargin.top).toBe(72);
    });
  });

  describe("TemplateRegistry", () => {
    it("creates documents from registered templates", () => {
      const registry = new TemplateRegistry();
      const doc = new Document(
        "Template",
        "",
        ["template"],
        [],
        new FontStyle("Arial", 24, 700, "#000"),
        new FontStyle("Arial", 12, 400, "#333"),
        new Margin(72, 72, 72, 72)
      );
      registry.register("basic", doc);
      const created = registry.create("basic");
      expect(created.title).toBe("Template");
      expect(created).not.toBe(doc);
    });

    it("lists registered template names", () => {
      const registry = new TemplateRegistry();
      const font = new FontStyle("Arial", 12, 400, "#000");
      const margin = new Margin(72, 72, 72, 72);
      registry.register("a", new Document("A", "", [], [], font.clone(), font.clone(), margin.clone()));
      registry.register("b", new Document("B", "", [], [], font.clone(), font.clone(), margin.clone()));
      expect(registry.list()).toEqual(["a", "b"]);
    });

    it("throws for unknown template name", () => {
      const registry = new TemplateRegistry();
      expect(() => registry.create("missing")).toThrow('Template "missing" not found');
    });

    it("each create call returns an independent clone", () => {
      const registry = new TemplateRegistry();
      const font = new FontStyle("Arial", 12, 400, "#000");
      const margin = new Margin(72, 72, 72, 72);
      registry.register("t", new Document("T", "", ["tag"], [], font.clone(), font.clone(), margin.clone()));

      const d1 = registry.create("t");
      const d2 = registry.create("t");
      d1.title = "Changed";
      expect(d2.title).toBe("T");
    });
  });
});
