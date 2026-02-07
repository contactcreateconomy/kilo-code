"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { CommunityStats } from "@/types/forum";

/**
 * useCommunityStats — Fetches aggregate community statistics from Convex.
 *
 * Returns formatted member/discussion/comment counts.
 */
export function useCommunityStats() {
  const data = useQuery(api.functions.forum.getCommunityStats, {});

  const stats: CommunityStats | null = data
    ? {
        members: data.members,
        discussions: data.discussions,
        comments: data.comments,
      }
    : null;

  return {
    stats,
    isLoading: data === undefined,
  };
}
