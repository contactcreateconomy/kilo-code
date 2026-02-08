"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Discussion, FeedTabType, PostType } from "@/types/forum";

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
    body: item.body ?? undefined,
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
    downvotes: item.downvoteCount,
    score: item.score,
    comments: item.commentCount,
    createdAt: new Date(item.createdAt),
    imageUrl: item.imageUrl ?? undefined,
    isPinned: item.isPinned,
    // Phase 3: Post type fields
    postType: (item.postType ?? "text") as PostType,
    linkUrl: item.linkUrl,
    linkDomain: item.linkDomain,
    linkTitle: item.linkTitle,
    linkDescription: item.linkDescription,
    linkImage: item.linkImage,
    images: item.images,
    pollOptions: item.pollOptions,
    pollEndsAt: item.pollEndsAt,
  };
}

/**
 * Maps FeedTabType to backend sortBy. "fav" and "following" fall back to "top".
 */
function tabToSort(
  tab: FeedTabType
): "top" | "hot" | "new" | "controversial" {
  if (tab === "fav" || tab === "following") return "top";
  return tab;
}

/**
 * useDiscussionFeed — Fetches homepage discussion feed from Convex with
 * infinite scroll support via cursor-based pagination.
 *
 * When activeTab is "following", uses the getFollowingFeed query instead
 * of listDiscussions.
 *
 * Sorting is done server-side via listDiscussions.
 * Returns typed Discussion[] compatible with existing UI components.
 *
 * @param activeTab - Current feed tab ("top" | "hot" | "new" | "fav" | "controversial" | "following")
 * @param limit - Max discussions per page (default 20)
 */
export function useDiscussionFeed(
  activeTab: FeedTabType = "top",
  limit = 20
) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [accumulated, setAccumulated] = useState<Discussion[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const prevTabRef = useRef(activeTab);
  const isFollowing = activeTab === "following";

  // Reset when tab changes
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      setCursor(undefined);
      setAccumulated([]);
      setHasMore(false);
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  // Standard feed query — skip when tab is "following"
  const standardResult = useQuery(
    api.functions.forum.listDiscussions,
    !isFollowing
      ? {
          sortBy: tabToSort(activeTab),
          limit,
          cursor,
        }
      : "skip"
  );

  // Following feed query — skip when tab is NOT "following"
  const followingResult = useQuery(
    api.functions.social.getFollowingFeed,
    isFollowing
      ? {
          limit,
          cursor,
        }
      : "skip"
  );

  // Pick the active result
  const result = isFollowing ? followingResult : standardResult;

  // Accumulate results when data arrives
  useEffect(() => {
    if (!result) return;

    const mapped = result.discussions.map(mapDiscussion);
    setHasMore(result.hasMore);

    if (!cursor) {
      // Initial load — replace
      setAccumulated(mapped);
    } else {
      // Load more — append (deduplicate by id)
      setAccumulated((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const newItems = mapped.filter((d) => !existingIds.has(d.id));
        return [...prev, ...newItems];
      });
    }
  }, [result, cursor]);

  const loadMore = useCallback(async () => {
    if (result?.nextCursor) {
      setCursor(result.nextCursor);
    }
  }, [result?.nextCursor]);

  return {
    discussions: accumulated,
    hasMore,
    isLoading: result === undefined && !cursor,
    isLoadingMore: cursor !== undefined && result === undefined,
    loadMore,
  };
}
