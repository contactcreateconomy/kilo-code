"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

/**
 * useUserProfile — Fetches a public user profile by username from Convex.
 *
 * @param username - Username to look up (skip query if undefined)
 */
export function useUserProfile(username: string | undefined) {
  const data = useQuery(
    api.functions.forum.getUserProfile,
    username ? { username } : "skip"
  );

  return {
    profile: data ?? null,
    isLoading: data === undefined,
  };
}

/**
 * useUserThreads — Fetches a user's threads by username.
 *
 * @param username - Username
 * @param limit - Max threads (default 10)
 */
export function useUserThreads(username: string | undefined, limit = 10) {
  const data = useQuery(
    api.functions.forum.getUserThreads,
    username ? { username, limit } : "skip"
  );

  return {
    threads: data ?? [],
    isLoading: data === undefined,
  };
}
