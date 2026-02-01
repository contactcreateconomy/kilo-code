import { ConvexReactClient } from "convex/react";

// Create a singleton Convex client
let convexClient: ConvexReactClient | null = null;

export function getConvexClient(): ConvexReactClient {
  if (!convexClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    }
    convexClient = new ConvexReactClient(convexUrl);
  }
  return convexClient;
}

// Re-export the api from the shared convex package
export { api } from "@createconomy/convex";
