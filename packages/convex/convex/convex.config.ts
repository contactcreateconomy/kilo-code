import { defineApp } from "convex/server";
import auth from "@convex-dev/auth/convex.config";

/**
 * Convex application configuration for Createconomy
 *
 * This configuration sets up the Convex backend with:
 * - Authentication via @convex-dev/auth
 *
 * Additional components can be added here as the application grows.
 */
const app = defineApp();

// Install the auth component for authentication
app.use(auth);

export default app;
