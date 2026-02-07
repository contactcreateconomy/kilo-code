"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { LeaderboardEntry } from "@/types/forum";

/**
 * useLeaderboard — Fetches leaderboard data from Convex.
 *
 * @param period - "weekly" | "monthly" | "allTime" (default "weekly")
 * @param limit - Max entries (default 10)
 */
export function useLeaderboard(
  period: "weekly" | "monthly" | "allTime" = "weekly",
  limit = 10
) {
  const data = useQuery(api.functions.forum.getLeaderboard, {
    period,
    limit,
  });

  const entries: LeaderboardEntry[] = data
    ? data.map((entry) => ({
        rank: entry.rank,
        badge: entry.badge,
        points: entry.points,
        user: {
          id: entry.user?.id ?? "",
          name: entry.user?.name ?? "Anonymous",
          username: entry.user?.username ?? "anonymous",
          avatarUrl: entry.user?.avatarUrl ?? "",
        },
      }))
    : [];

  return {
    entries,
    isLoading: data === undefined,
  };
}
