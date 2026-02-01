import type { Config } from "tailwindcss";
import sharedConfig from "@createconomy/config/tailwind.config";

/**
 * Tailwind CSS configuration for Marketplace app
 * Extends shared config with app-specific content paths
 */
const config: Config = {
  ...sharedConfig,
  content: [
    // App-specific content paths
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // Include shared UI package
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
