import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@createconomy/config/vitest";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      setupFiles: ["./src/test-setup.ts"],
      environment: "jsdom",
      globals: true,
      css: true,
    },
  })
);
