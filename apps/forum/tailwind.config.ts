import type { Config } from "tailwindcss";
import sharedConfig from "@createconomy/config/tailwind.config";

/**
 * Tailwind CSS configuration for Forum app
 * Extends shared config with app-specific content paths and premium design utilities
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
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme?.extend,
      boxShadow: {
        ...(sharedConfig.theme?.extend as Record<string, unknown>)?.['boxShadow'] as Record<string, string>,
        'glow': '0 0 20px var(--glow-color)',
        'glow-strong': '0 0 30px var(--glow-color-strong)',
        'glow-sm': '0 0 10px var(--glow-color)',
      },
      animation: {
        ...(sharedConfig.theme?.extend as Record<string, unknown>)?.['animation'] as Record<string, string>,
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        ...(sharedConfig.theme?.extend as Record<string, unknown>)?.['keyframes'] as Record<string, Record<string, Record<string, string>>>,
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-color)' },
          '50%': { boxShadow: '0 0 30px var(--glow-color-strong)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
};

export default config;
