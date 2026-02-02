import { defineApp } from "convex/server";

/**
 * Convex application configuration for Createconomy
 *
 * This configuration sets up the Convex backend.
 * Authentication is configured separately via @convex-dev/auth in auth.ts
 *
 * Note: @convex-dev/auth v0.0.80 uses a different configuration approach
 * where auth is set up directly in the auth.ts file using convexAuth()
 * rather than as a component in convex.config.ts
 */
const app = defineApp();

export default app;
