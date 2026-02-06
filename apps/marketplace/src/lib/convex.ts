import { ConvexHttpClient } from "convex/browser";

// Create a Convex HTTP client for server-side operations
export const convexClient = new ConvexHttpClient(
  process.env["NEXT_PUBLIC_CONVEX_URL"]!
);

// Re-export the API for convenience
export { api } from "@createconomy/convex";
