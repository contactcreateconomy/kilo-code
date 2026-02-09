"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

/**
 * useCategoryBySlug — Fetches a forum category by its slug.
 *
 * @param slug - Category slug (skip query if undefined)
 */
export function useCategoryBySlug(slug: string | undefined) {
  const data = useQuery(
    api.functions.forum.getCategoryBySlug,
    slug ? { slug } : "skip"
  );

  return {
    category: data ?? null,
    isLoading: data === undefined,
  };
}

/**
 * useCategoryThreads — Fetches threads in a category by slug with
 * infinite scroll support via cursor-based pagination.
 *
 * @param slug - Category slug
 * @param sort - "recent" | "popular" | "unanswered" (default "recent")
 * @param limit - Max threads per page (default 20)
 */
export function useCategoryThreads(
  slug: string | undefined,
  sort: "recent" | "popular" | "unanswered" = "recent",
  limit = 20
) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [accumulated, setAccumulated] = useState<
    NonNullable<
      ReturnType<typeof useQuery<typeof api.functions.forum.listThreadsBySlug>>
    >["threads"]
  >([]);
  const [hasMore, setHasMore] = useState(false);
  const prevSlugRef = useRef(slug);
  const prevSortRef = useRef(sort);

  // Reset when slug or sort changes
  useEffect(() => {
    if (prevSlugRef.current !== slug || prevSortRef.current !== sort) {
      setCursor(undefined);
      setAccumulated([]);
      setHasMore(false);
      prevSlugRef.current = slug;
      prevSortRef.current = sort;
    }
  }, [slug, sort]);

  const data = useQuery(
    api.functions.forum.listThreadsBySlug,
    slug ? { slug, sort, limit, cursor } : "skip"
  );

  // Accumulate results
  useEffect(() => {
    if (!data) return;

    setHasMore(data.hasMore);

    if (!cursor) {
      // Initial load — replace
      setAccumulated(data.threads);
    } else {
      // Load more — append (deduplicate by _id)
      setAccumulated((prev) => {
        const existingIds = new Set(prev.map((t) => t._id));
        const newItems = data.threads.filter((t) => !existingIds.has(t._id));
        return [...prev, ...newItems];
      });
    }
  }, [data, cursor]);

  const loadMore = useCallback(async () => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [data?.nextCursor]);

  return {
    category: data?.category ?? null,
    threads: accumulated,
    hasMore,
    isLoading: data === undefined && !cursor,
    isLoadingMore: cursor !== undefined && data === undefined,
    loadMore,
  };
}
