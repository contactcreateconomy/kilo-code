"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Discussion, FeedTabType, PostType } from "@/types/forum";

type ListDiscussionsResult = NonNullable<
  ReturnType<typeof useQuery<typeof api.functions.forum.listDiscussions>>
>;

type DiscussionItem = ListDiscussionsResult["discussions"][number];

type BookmarkedItem = NonNullable<
  NonNullable<ReturnType<typeof useQuery<typeof api.functions.forum.getBookmarkedThreads>>>[number]
>;

function mapDiscussion(item: DiscussionItem): Discussion {
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
    postType: (item.postType ?? "text") as PostType,
    linkUrl: item.linkUrl,
    linkDomain: item.linkDomain,
    linkTitle: item.linkTitle,
    linkDescription: item.linkDescription,
    linkImage: item.linkImage,
    images: item.images,
    pollOptions: item.pollOptions,
    pollEndsAt: item.pollEndsAt,
    tags: item.tags ?? undefined,
    flair: item.flair ?? undefined,
  };
}

function mapBookmarkedDiscussion(item: BookmarkedItem): Discussion {
  return {
    id: item.thread.id,
    title: item.thread.title,
    aiSummary: "",
    author: {
      id: item.thread.author?.id ?? "",
      name: item.thread.author?.name ?? "Anonymous",
      username: item.thread.author?.username ?? "anonymous",
      avatarUrl: item.thread.author?.avatarUrl ?? "",
    },
    category: {
      id: "",
      name: item.thread.category?.name ?? "General",
      slug: item.thread.category?.slug ?? "general",
      icon: item.thread.category?.icon ?? "💬",
      color: "bg-gray-500",
      count: 0,
    },
    upvotes: item.thread.upvoteCount,
    downvotes: 0,
    score: item.thread.upvoteCount,
    comments: item.thread.postCount,
    createdAt: new Date(item.thread.createdAt),
    isPinned: item.thread.isPinned,
    postType: "text",
  };
}

function tabToSort(
  tab: FeedTabType
): "top" | "hot" | "new" | "controversial" {
  if (tab === "fav" || tab === "following") return "top";
  return tab;
}

export function useDiscussionFeed(activeTab: FeedTabType = "top", limit = 20) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [accumulated, setAccumulated] = useState<Discussion[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const prevTabRef = useRef(activeTab);

  const isFollowing = activeTab === "following";
  const isFavorites = activeTab === "fav";

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      setCursor(undefined);
      setAccumulated([]);
      setHasMore(false);
      prevTabRef.current = activeTab;
    }
  }, [activeTab]);

  const standardResult = useQuery(
    api.functions.forum.listDiscussions,
    !isFollowing && !isFavorites
      ? {
          sortBy: tabToSort(activeTab),
          limit,
          cursor,
        }
      : "skip"
  );

  const followingResult = useQuery(
    api.functions.social.getFollowingFeed,
    isFollowing
      ? {
          limit,
          cursor,
        }
      : "skip"
  );

  const favoritesResult = useQuery(
    api.functions.forum.getBookmarkedThreads,
    isFavorites
      ? {
          limit,
        }
      : "skip"
  );

  const result = isFollowing ? followingResult : standardResult;

  useEffect(() => {
    if (!result || isFavorites) return;

    const mapped = (result.discussions as DiscussionItem[]).map(mapDiscussion);
    setHasMore(result.hasMore);

    if (!cursor) {
      setAccumulated(mapped);
    } else {
      setAccumulated((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const newItems = mapped.filter((d) => !existingIds.has(d.id));
        return [...prev, ...newItems];
      });
    }
  }, [result, cursor, isFavorites]);

  useEffect(() => {
    if (!isFavorites || favoritesResult === undefined) return;

    const mapped = favoritesResult
      .filter((item): item is BookmarkedItem => Boolean(item))
      .map(mapBookmarkedDiscussion);
    setAccumulated(mapped);
    setHasMore(false);
  }, [favoritesResult, isFavorites]);

  const loadMore = useCallback(async () => {
    if (isFavorites) return;
    if (result?.nextCursor) {
      setCursor(result.nextCursor);
    }
  }, [result?.nextCursor, isFavorites]);

  const isInitialLoading = isFavorites
    ? favoritesResult === undefined
    : result === undefined && !cursor;

  return {
    discussions: accumulated,
    hasMore,
    isLoading: isInitialLoading,
    isLoadingMore: !isFavorites && cursor !== undefined && result === undefined,
    loadMore,
  };
}
