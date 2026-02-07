"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Discussion, FeedTabType } from "@/types/forum";

/**
 * Maps a Convex listDiscussions result item to the frontend Discussion type.
 */
function mapDiscussion(
  item: NonNullable<
    ReturnType<typeof useQuery<typeof api.functions.forum.listDiscussions>>
  >["discussions"][number]
): Discussion {
  return {
    id: item._id,
    title: item.title,
    aiSummary: item.aiSummary ?? "",
    author: {
      id: item.author?.id ?? "",
      name: item.author?.name ?? "Anonymous",
      username: item.author?.username ?? "anonymous",
      avatarUrl: item.author?.avatarUrl ?? "",
    },
    category: {
      id: item.category?.id ?? "",
      name: item.category?.name ?? "General",
      slug: item.category?.slug ?? "general",
      icon: item.category?.icon ?? "💬",
      color: item.category?.color ?? "bg-gray-500",
      count: 0,
    },
    upvotes: item.upvoteCount,
    comments: item.postCount,
    createdAt: new Date(item.createdAt),
    imageUrl: item.imageUrl ?? undefined,
    isPinned: item.isPinned,
  };
}

/**
 * Maps FeedTabType to backend sortBy. "fav" falls back to "top".
 */
function tabToSort(tab: FeedTabType): "top" | "hot" | "new" {
  if (tab === "fav") return "top";
  return tab;
}

/**
 * useDiscussionFeed — Fetches homepage discussion feed from Convex.
 *
 * Sorting is done server-side via listDiscussions.
 * Returns typed Discussion[] compatible with existing UI components.
 *
 * @param activeTab - Current feed tab ("top" | "hot" | "new" | "fav")
 * @param limit - Max discussions to fetch (default 20)
 */
export function useDiscussionFeed(
  activeTab: FeedTabType = "top",
  limit = 20
) {
  const result = useQuery(api.functions.forum.listDiscussions, {
    sortBy: tabToSort(activeTab),
    limit,
  });

  const discussions: Discussion[] = result
    ? result.discussions.map(mapDiscussion)
    : [];

  return {
    discussions,
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
  };
}
