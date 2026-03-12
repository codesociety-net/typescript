import { describe, it, expect } from "vitest";
import { ConfigMemento, SnapshotHistory, AppConfigManager, AppConfig } from "./production";

const defaultConfig: AppConfig = {
  theme: "light",
  language: "en",
  features: { darkMode: true, beta: false },
  rateLimits: { requestsPerMinute: 60, burstSize: 10 },
};

describe("Memento — Configuration Snapshots", () => {
  describe("ConfigMemento", () => {
    it("creates a snapshot with label and tags", () => {
      const memento = new ConfigMemento(defaultConfig, "initial", ["release"]);
      const snap = memento.getSnapshot();
      expect(snap.label).toBe("initial");
      expect(snap.tags).toEqual(["release"]);
      expect(snap.state.theme).toBe("light");
    });

    it("snapshot state is frozen", () => {
      const memento = new ConfigMemento(defaultConfig, "test");
      const snap = memento.getSnapshot();
      expect(Object.isFrozen(snap.state)).toBe(true);
    });

    it("has a unique id and createdAt timestamp", () => {
      const memento = new ConfigMemento(defaultConfig, "test");
      expect(typeof memento.id).toBe("string");
      expect(memento.id.length).toBeGreaterThan(0);
      expect(typeof memento.createdAt).toBe("number");
    });
  });

  describe("SnapshotHistory", () => {
    it("save and retrieve latest", () => {
      const history = new SnapshotHistory<AppConfig>();
      const m1 = new ConfigMemento(defaultConfig, "first");
      const m2 = new ConfigMemento({ ...defaultConfig, theme: "dark" }, "second");
      history.save(m1);
      history.save(m2);
      expect(history.latest()).toBe(m2);
    });

    it("getById finds the correct snapshot", () => {
      const history = new SnapshotHistory<AppConfig>();
      const m = new ConfigMemento(defaultConfig, "findme");
      history.save(m);
      expect(history.getById(m.id)).toBe(m);
    });

    it("getById returns undefined for unknown id", () => {
      const history = new SnapshotHistory<AppConfig>();
      expect(history.getById("nonexistent")).toBeUndefined();
    });

    it("getByTag filters by tag", () => {
      const history = new SnapshotHistory<AppConfig>();
      history.save(new ConfigMemento(defaultConfig, "a", ["release"]));
      history.save(new ConfigMemento(defaultConfig, "b", ["dev"]));
      history.save(new ConfigMemento(defaultConfig, "c", ["release"]));

      const releases = history.getByTag("release");
      expect(releases).toHaveLength(2);
    });

    it("enforces maxSize by evicting oldest", () => {
      const history = new SnapshotHistory<AppConfig>(2);
      const m1 = new ConfigMemento(defaultConfig, "1");
      const m2 = new ConfigMemento(defaultConfig, "2");
      const m3 = new ConfigMemento(defaultConfig, "3");
      history.save(m1);
      history.save(m2);
      history.save(m3);

      expect(history.getById(m1.id)).toBeUndefined();
      expect(history.getById(m2.id)).toBe(m2);
      expect(history.getById(m3.id)).toBe(m3);
    });

    it("list returns snapshots in order", () => {
      const history = new SnapshotHistory<AppConfig>();
      history.save(new ConfigMemento(defaultConfig, "first"));
      history.save(new ConfigMemento(defaultConfig, "second"));
      const listed = history.list();
      expect(listed[0].label).toBe("first");
      expect(listed[1].label).toBe("second");
    });
  });

  describe("AppConfigManager", () => {
    it("getConfig returns the current configuration", () => {
      const mgr = new AppConfigManager(defaultConfig);
      expect(mgr.getConfig().theme).toBe("light");
    });

    it("update changes config and saves snapshot of previous state", () => {
      const mgr = new AppConfigManager(defaultConfig);
      mgr.update({ theme: "dark" }, "dark mode");
      expect(mgr.getConfig().theme).toBe("dark");
      expect(mgr.getHistory()).toHaveLength(1);
      expect(mgr.getHistory()[0].label).toBe("dark mode");
    });

    it("rollback restores the most recent previous config", () => {
      const mgr = new AppConfigManager(defaultConfig);
      mgr.update({ theme: "dark" }, "switch dark");
      mgr.rollback();
      expect(mgr.getConfig().theme).toBe("light");
    });

    it("rollback by specific id restores that snapshot", () => {
      const mgr = new AppConfigManager(defaultConfig);
      mgr.update({ theme: "dark" }, "to dark");
      const snapId = mgr.getHistory()[0].id;
      mgr.update({ language: "fr" }, "to french");
      mgr.rollback(snapId);
      expect(mgr.getConfig().theme).toBe("light");
    });

    it("rollback returns null when no history exists", () => {
      const mgr = new AppConfigManager(defaultConfig);
      expect(mgr.rollback()).toBeNull();
    });

    it("getSnapshotsByTag returns tagged snapshots", () => {
      const mgr = new AppConfigManager(defaultConfig);
      mgr.update({ theme: "dark" }, "dark", ["ui"]);
      mgr.update({ language: "fr" }, "french", ["i18n"]);

      expect(mgr.getSnapshotsByTag("ui")).toHaveLength(1);
      expect(mgr.getSnapshotsByTag("i18n")).toHaveLength(1);
      expect(mgr.getSnapshotsByTag("other")).toHaveLength(0);
    });
  });
});
