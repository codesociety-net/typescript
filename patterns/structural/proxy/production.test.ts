import { describe, it, expect, vi } from "vitest";
import {
  CachingProxy,
  WeatherApiClient,
  type DataSource,
  type WeatherData,
} from "./production";

describe("Proxy (Production)", () => {
  describe("WeatherApiClient", () => {
    it("returns weather data for a city", async () => {
      const client = new WeatherApiClient();
      const data = await client.fetch("London");
      expect(data).toEqual({ temp: 22, condition: "sunny" });
    });
  });

  describe("CachingProxy", () => {
    it("delegates to origin on first fetch", async () => {
      const origin: DataSource<WeatherData> = {
        fetch: vi.fn().mockResolvedValue({ temp: 20, condition: "cloudy" }),
      };
      const proxy = new CachingProxy(origin, 60_000);
      const result = await proxy.fetch("Paris");
      expect(result).toEqual({ temp: 20, condition: "cloudy" });
      expect(origin.fetch).toHaveBeenCalledWith("Paris");
    });

    it("serves from cache on second fetch (origin called once)", async () => {
      const origin: DataSource<WeatherData> = {
        fetch: vi.fn().mockResolvedValue({ temp: 18, condition: "rainy" }),
      };
      const proxy = new CachingProxy(origin, 60_000);
      await proxy.fetch("Berlin");
      await proxy.fetch("Berlin");
      expect(origin.fetch).toHaveBeenCalledTimes(1);
    });

    it("different keys trigger separate origin calls", async () => {
      const origin: DataSource<WeatherData> = {
        fetch: vi.fn().mockResolvedValue({ temp: 25, condition: "sunny" }),
      };
      const proxy = new CachingProxy(origin, 60_000);
      await proxy.fetch("A");
      await proxy.fetch("B");
      expect(origin.fetch).toHaveBeenCalledTimes(2);
    });

    it("invalidate clears a specific key so next fetch hits origin", async () => {
      const origin: DataSource<WeatherData> = {
        fetch: vi.fn().mockResolvedValue({ temp: 15, condition: "windy" }),
      };
      const proxy = new CachingProxy(origin, 60_000);
      await proxy.fetch("Tokyo");
      proxy.invalidate("Tokyo");
      await proxy.fetch("Tokyo");
      expect(origin.fetch).toHaveBeenCalledTimes(2);
    });

    it("invalidateAll clears all keys", async () => {
      const origin: DataSource<WeatherData> = {
        fetch: vi.fn().mockResolvedValue({ temp: 30, condition: "hot" }),
      };
      const proxy = new CachingProxy(origin, 60_000);
      await proxy.fetch("A");
      await proxy.fetch("B");
      proxy.invalidateAll();
      await proxy.fetch("A");
      await proxy.fetch("B");
      expect(origin.fetch).toHaveBeenCalledTimes(4);
    });

    it("expired cache entries trigger a new origin fetch", async () => {
      const origin: DataSource<WeatherData> = {
        fetch: vi.fn().mockResolvedValue({ temp: 10, condition: "cold" }),
      };
      const proxy = new CachingProxy(origin, 1); // 1ms TTL
      await proxy.fetch("NYC");
      // Wait for TTL to expire
      await new Promise((r) => setTimeout(r, 10));
      await proxy.fetch("NYC");
      expect(origin.fetch).toHaveBeenCalledTimes(2);
    });

    it("cached value matches what origin returned", async () => {
      const origin: DataSource<WeatherData> = {
        fetch: vi.fn().mockResolvedValue({ temp: 22, condition: "sunny" }),
      };
      const proxy = new CachingProxy(origin, 60_000);
      const first = await proxy.fetch("X");
      const second = await proxy.fetch("X");
      expect(first).toEqual(second);
    });
  });
});
