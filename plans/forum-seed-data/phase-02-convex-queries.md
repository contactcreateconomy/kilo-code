# Phase 2 — New Convex Query Functions

## Goal
Add missing Convex query functions to [`packages/convex/convex/functions/forum.ts`](packages/convex/convex/functions/forum.ts) that provide the data currently hardcoded in the frontend. These queries power the leaderboard, community stats, trending topics, campaign widget, homepage feed, user profiles, and category lookups.

## New Functions to Add

### 1. `getLeaderboard` — Query
Returns top N users ranked by total points.

**File**: [`packages/convex/convex/functions/forum.ts`](packages/convex/convex/functions/forum.ts)

```typescript
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    // Get top users by total points
    const userPointsEntries = await ctx.db
      .query("userPoints")
      .withIndex("by_total_points")
      .order("desc")
      .take(limit);
    
    // Enrich with user profile data
    const leaderboard = await Promise.all(
      userPointsEntries.map(async (entry, index) => {
        const user = await ctx.db.get(entry.userId);
        const profile = user ? await ctx.db
          .query("userProfiles")
          .withIndex("by_user", q => q.eq("userId", user._id))
          .first() : null;
        
        return {
          rank: index + 1,
          user: {
            id: entry.userId,
            name: user?.name ?? "Unknown",
            username: profile?.username ?? "unknown",
            avatarUrl: profile?.avatarUrl ?? "",
          },
          points: entry.totalPoints,
          badge: index < 3 ? "gold" : index < 6 ? "silver" : "bronze",
        };
      })
    );
    
    return leaderboard;
  },
});
```

**Replaces**: [`mockLeaderboard`](apps/forum/src/data/mock-data.ts:50) in [`LeaderboardWidget`](apps/forum/src/components/widgets/leaderboard.tsx:19)

---

### 2. `getCommunityStats` — Query
Returns aggregate counts for members, discussions, and comments.

```typescript
export const getCommunityStats = query({
  args: {},
  handler: async (ctx) => {
    // Count users with profiles
    const profiles = await ctx.db.query("userProfiles").collect();
    const memberCount = profiles.length;
    
    // Count non-deleted threads
    const threads = await ctx.db
      .query("forumThreads")
      .filter(q => q.eq(q.field("isDeleted"), false))
      .collect();
    const threadCount = threads.length;
    
    // Count non-deleted posts (excluding first posts to get reply count)
    const posts = await ctx.db
      .query("forumPosts")
      .filter(q => q.and(
        q.eq(q.field("isDeleted"), false),
        q.eq(q.field("isFirstPost"), false)
      ))
      .collect();
    
    // Count non-deleted comments
    const comments = await ctx.db
      .query("forumComments")
      .filter(q => q.eq(q.field("isDeleted"), false))
      .collect();
    
    const totalComments = posts.length + comments.length;
    
    return {
      members: formatCount(memberCount),
      discussions: formatCount(threadCount),
      comments: formatCount(totalComments),
    };
  },
});

// Helper to format numbers like "24.5K"
function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
```

**Replaces**: [`mockCommunityStats`](apps/forum/src/data/mock-data.ts:64) in [`CommunityStatsWidget`](apps/forum/src/components/widgets/community-stats.tsx:21)

---

### 3. `getTrendingTopics` — Query
Returns top-engagement threads from the past week, ordered by a combination of upvotes + post count.

```typescript
export const getTrendingTopics = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // Get recent threads
    const threads = await ctx.db
      .query("forumThreads")
      .filter(q => q.and(
        q.eq(q.field("isDeleted"), false),
        q.gte(q.field("createdAt"), oneWeekAgo)
      ))
      .collect();
    
    // Score by engagement: upvotes + postCount * 2
    const scored = threads.map(t => ({
      ...t,
      score: (t.upvoteCount ?? 0) + t.postCount * 2,
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    const top = scored.slice(0, limit);
    
    // Enrich with category data
    return Promise.all(
      top.map(async (thread) => {
        const category = await ctx.db.get(thread.categoryId);
        return {
          id: thread._id,
          title: thread.title,
          category: category?.name ?? "Unknown",
          posts: thread.postCount,
          trend: thread.score > 50 ? "hot" : "rising",
        };
      })
    );
  },
});
```

**Replaces**: hardcoded [`trendingTopics`](apps/forum/src/components/widgets/whats-vibing.tsx:8) in [`WhatsVibingWidget`](apps/forum/src/components/widgets/whats-vibing.tsx:54)

---

### 4. `getActiveCampaign` — Query
Returns the currently active campaign from `forumCampaigns`.

```typescript
export const getActiveCampaign = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const campaign = await ctx.db
      .query("forumCampaigns")
      .withIndex("by_active", q => q.eq("isActive", true))
      .filter(q => q.gte(q.field("endDate"), now))
      .first();
    
    if (!campaign) return null;
    
    return {
      id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      prize: campaign.prize,
      endDate: new Date(campaign.endDate),
      progress: campaign.currentProgress,
      targetPoints: campaign.targetPoints,
      participantCount: campaign.participantCount,
    };
  },
});
```

**Replaces**: [`mockCampaign`](apps/forum/src/data/mock-data.ts:38) in [`CampaignWidget`](apps/forum/src/components/widgets/campaign-widget.tsx:16) and [`ActiveCampaignWidget`](apps/forum/src/components/widgets/active-campaign.tsx:17)

---

### 5. `listDiscussions` — Query
Returns threads for the homepage feed with author and category data, formatted to match the `Discussion` type.

```typescript
export const listDiscussions = query({
  args: {
    limit: v.optional(v.number()),
    sort: v.optional(v.union(v.literal("top"), v.literal("hot"), v.literal("new"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    const threads = await ctx.db
      .query("forumThreads")
      .filter(q => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit * 2); // over-fetch to allow sorting
    
    // Enrich with author and category
    const discussions = await Promise.all(
      threads.map(async (thread) => {
        const author = await ctx.db.get(thread.authorId);
        const profile = author ? await ctx.db
          .query("userProfiles")
          .withIndex("by_user", q => q.eq("userId", author._id))
          .first() : null;
        const category = await ctx.db.get(thread.categoryId);
        
        // Get first post for content
        const firstPost = await ctx.db
          .query("forumPosts")
          .withIndex("by_thread", q => q.eq("threadId", thread._id))
          .filter(q => q.eq(q.field("isFirstPost"), true))
          .first();
        
        return {
          id: thread._id,
          title: thread.title,
          aiSummary: thread.aiSummary ?? "",
          author: {
            id: thread.authorId,
            name: author?.name ?? "Unknown",
            username: profile?.username ?? "unknown",
            avatarUrl: profile?.avatarUrl ?? "",
          },
          category: {
            id: thread.categoryId,
            name: category?.name ?? "Unknown",
            slug: category?.slug ?? "",
            icon: category?.icon ?? "",
            color: category?.color ?? "bg-gray-500",
            count: category?.threadCount ?? 0,
          },
          upvotes: thread.upvoteCount ?? 0,
          comments: thread.postCount - 1, // exclude first post
          createdAt: thread.createdAt,
          isPinned: thread.isPinned,
          isUpvoted: false, // will be set per-user in future
          isBookmarked: false, // will be set per-user in future
        };
      })
    );
    
    // Sort based on parameter
    // ...sorting logic by top/hot/new...
    
    return discussions.slice(0, limit);
  },
});
```

**Replaces**: [`mockDiscussions`](apps/forum/src/data/mock-data.ts:71) in [`page.tsx`](apps/forum/src/app/page.tsx:80)

---

### 6. `getUserByUsername` — Query
Looks up a user by their username for the profile page.

```typescript
export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", q => q.eq("username", args.username))
      .first();
    
    if (!profile) return null;
    
    const user = await ctx.db.get(profile.userId);
    
    // Get thread count
    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_author", q => q.eq("authorId", profile.userId))
      .filter(q => q.eq(q.field("isDeleted"), false))
      .collect();
    
    // Get post count
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_author", q => q.eq("authorId", profile.userId))
      .filter(q => q.eq(q.field("isDeleted"), false))
      .collect();
    
    // Get points
    const points = await ctx.db
      .query("userPoints")
      .withIndex("by_user", q => q.eq("userId", profile.userId))
      .first();
    
    return {
      username: profile.username,
      displayName: profile.displayName ?? user?.name ?? "Unknown",
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      role: profile.defaultRole,
      joinedAt: profile.createdAt,
      threadCount: threads.length,
      postCount: posts.length,
      reputation: points?.totalPoints ?? 0,
    };
  },
});
```

**Replaces**: hardcoded [`getUser()`](apps/forum/src/app/u/[username]/page.tsx:10) mock function

---

### 7. `getCategoryBySlug` — Query
Looks up a forum category by slug.

```typescript
export const getCategoryBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("forumCategories")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
    
    if (!category) return null;
    
    return {
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      threadCount: category.threadCount,
      postCount: category.postCount,
    };
  },
});
```

**Replaces**: hardcoded [`getCategory()`](apps/forum/src/app/c/[slug]/page.tsx:11) mock function

---

### 8. `getThreadByIdWithPosts` — Query
Enhanced version of existing `getThread` that also handles the thread detail page's mock data.

This is already mostly handled by the existing [`getThread`](packages/convex/convex/functions/forum.ts:200) query. The thread detail page just needs to be rewired to use it instead of its inline mock function. No new query needed — just rewire in Phase 4.

---

## Hook Updates in `apps/forum/src/hooks/use-forum.ts`

Add these new hooks to [`use-forum.ts`](apps/forum/src/hooks/use-forum.ts):

```typescript
export function useLeaderboard(limit?: number) {
  const entries = useQuery(api.functions.forum.getLeaderboard, { limit });
  return { entries: entries ?? [], isLoading: entries === undefined };
}

export function useCommunityStats() {
  const stats = useQuery(api.functions.forum.getCommunityStats, {});
  return { stats: stats ?? null, isLoading: stats === undefined };
}

export function useTrendingTopics(limit?: number) {
  const topics = useQuery(api.functions.forum.getTrendingTopics, { limit });
  return { topics: topics ?? [], isLoading: topics === undefined };
}

export function useActiveCampaign() {
  const campaign = useQuery(api.functions.forum.getActiveCampaign, {});
  return { campaign: campaign ?? null, isLoading: campaign === undefined };
}

export function useDiscussions(limit?: number, sort?: string) {
  const discussions = useQuery(api.functions.forum.listDiscussions, { limit });
  return { discussions: discussions ?? [], isLoading: discussions === undefined };
}

export function useUserProfile(username: string | undefined) {
  const user = useQuery(
    api.functions.forum.getUserByUsername,
    username ? { username } : "skip"
  );
  return { user: user ?? null, isLoading: user === undefined };
}

export function useCategoryBySlug(slug: string | undefined) {
  const category = useQuery(
    api.functions.forum.getCategoryBySlug,
    slug ? { slug } : "skip"
  );
  return { category: category ?? null, isLoading: category === undefined };
}
```
