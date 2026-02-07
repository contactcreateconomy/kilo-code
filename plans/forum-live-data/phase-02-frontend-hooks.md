# Phase 02 — Frontend Hooks

**Files**: `apps/forum/src/hooks/`

## Context

The existing [`use-forum.ts`](../../apps/forum/src/hooks/use-forum.ts) already has hooks for:
- `useForum()` — mutations (create/update/delete threads and posts)
- `useCategories()` — list forum categories
- `useCategory(id)` — single category by ID
- `useThreads(categoryId)` — threads in a category
- `useThread(threadId)` — single thread with posts
- `usePostComments(postId)` — comments for a post
- `useSearchThreads(query)` — search results

We need new hooks that call the new backend functions from Phase 01.

## New Hooks to Create

### 1. `use-discussion-feed.ts` — Homepage feed

```typescript
// apps/forum/src/hooks/use-discussion-feed.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { FeedTabType } from "@/types/forum";

/**
 * Hook for the homepage discussion feed.
 * Fetches threads across all categories with sorting.
 */
export function useDiscussionFeed(sortBy: FeedTabType = "top", limit = 20) {
  const result = useQuery(api.functions.forum.listDiscussions, {
    sortBy: sortBy === "fav" ? undefined : sortBy, // "fav" is client-side filtered
    limit,
  });

  return {
    discussions: result?.discussions ?? [],
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
  };
}
```

### 2. `use-leaderboard.ts` — Leaderboard widget

```typescript
// apps/forum/src/hooks/use-leaderboard.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export function useLeaderboard(
  period: "weekly" | "monthly" | "allTime" = "weekly",
  limit = 10
) {
  const entries = useQuery(api.functions.forum.getLeaderboard, { period, limit });

  return {
    entries: entries ?? [],
    isLoading: entries === undefined,
  };
}
```

### 3. `use-community-stats.ts` — Community stats widget

```typescript
// apps/forum/src/hooks/use-community-stats.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export function useCommunityStats() {
  const stats = useQuery(api.functions.forum.getCommunityStats, {});

  return {
    stats: stats ?? { members: "0", discussions: "0", comments: "0" },
    isLoading: stats === undefined,
  };
}
```

### 4. `use-trending.ts` — What's Vibing widget

```typescript
// apps/forum/src/hooks/use-trending.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export function useTrending(limit = 5) {
  const topics = useQuery(api.functions.forum.getTrendingTopics, { limit });

  return {
    topics: topics ?? [],
    isLoading: topics === undefined,
  };
}
```

### 5. `use-campaign.ts` — Active campaign widget

```typescript
// apps/forum/src/hooks/use-campaign.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export function useActiveCampaign() {
  const campaign = useQuery(api.functions.forum.getActiveCampaign, {});

  return {
    campaign: campaign ?? null,
    isLoading: campaign === undefined,
  };
}
```

### 6. `use-reactions.ts` — Upvote/bookmark state + toggle

```typescript
// apps/forum/src/hooks/use-reactions.ts
"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { useAuth } from "./use-auth";

export function useReactions(
  targetType: "thread" | "post" | "comment",
  targetIds: string[]
) {
  const { isAuthenticated } = useAuth();

  const reactions = useQuery(
    api.functions.forum.getUserReactions,
    isAuthenticated && targetIds.length > 0
      ? { targetType, targetIds }
      : "skip"
  );

  const toggleReaction = useMutation(api.functions.forum.toggleReaction);

  const toggle = useCallback(
    async (targetId: string, reactionType: "upvote" | "bookmark") => {
      return toggleReaction({ targetType, targetId, reactionType });
    },
    [toggleReaction, targetType]
  );

  return {
    reactions: reactions ?? {},
    toggle,
    isLoading: reactions === undefined,
  };
}
```

### 7. `use-user-profile.ts` — Public user profile

```typescript
// apps/forum/src/hooks/use-user-profile.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export function useUserProfile(username: string | undefined) {
  const profile = useQuery(
    api.functions.forum.getUserProfile,
    username ? { username } : "skip"
  );

  return {
    profile: profile ?? null,
    isLoading: profile === undefined,
  };
}
```

### 8. `use-category-threads.ts` — Category page threads by slug

```typescript
// apps/forum/src/hooks/use-category-threads.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export function useCategoryThreads(
  slug: string | undefined,
  sort: "recent" | "popular" | "unanswered" = "recent",
  limit = 20
) {
  const result = useQuery(
    api.functions.forum.listThreadsBySlug,
    slug ? { slug, sort, limit } : "skip"
  );

  return {
    category: result?.category ?? null,
    threads: result?.threads ?? [],
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
  };
}
```

## Update `hooks/index.ts` Barrel Export

Add all new hooks to the barrel export:

```typescript
export { useForum, useCategories, useCategory, useThreads, useThread, usePostComments, useSearchThreads } from "./use-forum";
export { useAuth } from "./use-auth";
export { useFeedFilter } from "./use-feed-filter";
export { useDiscussionFeed } from "./use-discussion-feed";
export { useLeaderboard } from "./use-leaderboard";
export { useCommunityStats } from "./use-community-stats";
export { useTrending } from "./use-trending";
export { useActiveCampaign } from "./use-campaign";
export { useReactions } from "./use-reactions";
export { useUserProfile } from "./use-user-profile";
export { useCategoryThreads } from "./use-category-threads";
```
