"use client";

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
 * useCategoryThreads — Fetches threads in a category by slug.
 *
 * @param slug - Category slug
 * @param sort - "recent" | "popular" | "unanswered" (default "recent")
 * @param limit - Max threads (default 20)
 */
export function useCategoryThreads(
  slug: string | undefined,
  sort: "recent" | "popular" | "unanswered" = "recent",
  limit = 20
) {
  const data = useQuery(
    api.functions.forum.listThreadsBySlug,
    slug ? { slug, sort, limit } : "skip"
  );

  return {
    category: data?.category ?? null,
    threads: data?.threads ?? [],
    hasMore: data?.hasMore ?? false,
    isLoading: data === undefined,
  };
}
