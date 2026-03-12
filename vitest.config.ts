import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["patterns/**/*.test.ts"],
    globals: true,
  },
});
