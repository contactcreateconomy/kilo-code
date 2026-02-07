"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { TrendingTopic } from "@/types/forum";

/**
 * useTrending — Fetches trending topics from Convex.
 *
 * @param limit - Max topics (default 5)
 */
export function useTrending(limit = 5) {
  const data = useQuery(api.functions.forum.getTrendingTopics, { limit });

  const topics: TrendingTopic[] = data
    ? data.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        engagement: item.posts,
        trend: item.trend,
      }))
    : [];

  return {
    topics,
    isLoading: data === undefined,
  };
}
