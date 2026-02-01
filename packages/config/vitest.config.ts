import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Shared Vitest configuration for the Createconomy monorepo.
 * Import and extend this config in individual packages.
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Test environment
    environment: "jsdom",

    // Global test setup
    globals: true,

    // Setup files run before each test file
    setupFiles: ["./src/test-setup.ts"],

    // Include patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Exclude patterns
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
    ],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "src/test-setup.ts",
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "**/__mocks__/**",
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },

    // Reporter configuration
    reporters: ["default", "html"],

    // Timeout for tests
    testTimeout: 10000,

    // Pool configuration for parallel execution
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // Watch mode configuration
    watch: false,

    // Retry failed tests
    retry: process.env.CI ? 2 : 0,

    // Bail on first failure in CI
    bail: process.env.CI ? 1 : 0,
  },
});
