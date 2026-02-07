import { ConvexHttpClient } from "convex/browser";

// Create a Convex HTTP client for server-side operations
export const convexClient = new ConvexHttpClient(
  process.env["NEXT_PUBLIC_CONVEX_URL"] ?? "https://placeholder.convex.cloud"
);

// Re-export the API for convenience
export { api } from "@createconomy/convex";
