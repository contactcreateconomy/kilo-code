# Phase 01 — Backend: New Convex Query Functions

**File**: `packages/convex/convex/functions/forum.ts`

## Context

The existing [`forum.ts`](../../packages/convex/convex/functions/forum.ts) has these functions:
- `listForumCategories` — lists categories with tree structure
- `getForumCategory` — single category + recent threads
- `listThreads` — threads in a category with author info
- `getThread` — thread detail with posts and authors
- `searchThreads` — full-text search on thread titles
- `getPostComments` — comments tree for a post
- `createThread`, `updateThread`, `deleteThread` — thread mutations
- `createPost`, `updatePost`, `deletePost` — post mutations
- `createComment`, `deleteComment` — comment mutations
- `incrementThreadViewCount` — view counter

**Missing**: Feed listing across all categories, leaderboard, community stats, trending topics, active campaign, reaction toggling, and user profile queries.

## New Functions to Add

### 1. `listDiscussions` — Homepage feed query

Purpose: Powers the main homepage feed. Fetches threads across ALL categories with author + category info.

```typescript
export const listDiscussions = query({
  args: {
    sortBy: v.optional(v.union(v.literal("top"), v.literal("hot"), v.literal("new"))),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const sortBy = args.sortBy ?? "new";

    // Fetch threads — ordered by creation time desc (default index order)
    // For "top" and "hot", we fetch recent threads and sort in memory
    // This avoids full table scans since we cap at a small limit
    const threads = await ctx.db
      .query("forumThreads")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit * 2); // Fetch extra to allow in-memory sorting

    // Sort based on sortBy
    let sorted = [...threads];
    if (sortBy === "top") {
      sorted.sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0));
    } else if (sortBy === "hot") {
      sorted.sort((a, b) => {
        const scoreA = (a.upvoteCount ?? 0) + a.postCount * 2;
        const scoreB = (b.upvoteCount ?? 0) + b.postCount * 2;
        const ageA = (Date.now() - a.createdAt) / 3600000;
        const ageB = (Date.now() - b.createdAt) / 3600000;
        return (scoreB * Math.pow(0.95, ageB / 24)) - (scoreA * Math.pow(0.95, ageA / 24));
      });
    }
    // "new" is already sorted desc by creation time

    const result = sorted.slice(0, limit);

    // Enrich with author + category
    const enriched = await Promise.all(
      result.map(async (thread) => {
        const author = await ctx.db.get(thread.authorId);
        const authorProfile = author
          ? await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", author._id)).first()
          : null;
        const category = await ctx.db.get(thread.categoryId);

        return {
          _id: thread._id,
          title: thread.title,
          slug: thread.slug,
          aiSummary: thread.aiSummary ?? null,
          imageUrl: thread.imageUrl ?? null,
          isPinned: thread.isPinned,
          upvoteCount: thread.upvoteCount ?? 0,
          postCount: thread.postCount,
          viewCount: thread.viewCount,
          createdAt: thread.createdAt,
          author: author ? {
            id: author._id,
            name: authorProfile?.displayName ?? author.name ?? "Anonymous",
            username: authorProfile?.username ?? author._id,
            avatarUrl: authorProfile?.avatarUrl ?? null,
          } : null,
          category: category ? {
            id: category._id,
            name: category.name,
            slug: category.slug,
            icon: category.icon ?? null,
            color: category.color ?? null,
          } : null,
        };
      })
    );

    return {
      discussions: enriched,
      hasMore: threads.length > limit,
    };
  },
});
```

**DB efficiency**: Uses default desc order on `_creationTime`, caps at `limit * 2` (max ~40 docs). Author/profile lookups are O(1) by ID + indexed query.

### 2. `getLeaderboard` — Top users by points

```typescript
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    period: v.optional(v.union(v.literal("weekly"), v.literal("monthly"), v.literal("allTime"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const period = args.period ?? "weekly";

    // Use the appropriate index based on period
    let entries;
    if (period === "weekly") {
      entries = await ctx.db
        .query("userPoints")
        .withIndex("by_weekly_points")
        .order("desc")
        .take(limit);
    } else if (period === "allTime") {
      entries = await ctx.db
        .query("userPoints")
        .withIndex("by_total_points")
        .order("desc")
        .take(limit);
    } else {
      // monthly — no dedicated index, fallback to collecting limited set
      entries = await ctx.db
        .query("userPoints")
        .order("desc")
        .take(limit * 3); // over-fetch then sort
      entries.sort((a, b) => b.monthlyPoints - a.monthlyPoints);
      entries = entries.slice(0, limit);
    }

    // Enrich with user data
    const leaderboard = await Promise.all(
      entries.map(async (entry, index) => {
        const user = await ctx.db.get(entry.userId);
        const profile = user
          ? await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", user._id)).first()
          : null;

        const rank = index + 1;
        const badge: "gold" | "silver" | "bronze" = rank <= 3 ? "gold" : rank <= 6 ? "silver" : "bronze";
        const points = period === "weekly" ? entry.weeklyPoints : period === "monthly" ? entry.monthlyPoints : entry.totalPoints;

        return {
          rank,
          badge,
          points,
          user: user ? {
            id: user._id,
            name: profile?.displayName ?? user.name ?? "Anonymous",
            username: profile?.username ?? user._id,
            avatarUrl: profile?.avatarUrl ?? null,
          } : null,
        };
      })
    );

    return leaderboard.filter((e) => e.user !== null);
  },
});
```

**DB efficiency**: Uses `by_weekly_points` and `by_total_points` indexes with `.take(limit)` — very efficient.

### 3. `getCommunityStats` — Aggregate counts

```typescript
export const getCommunityStats = query({
  args: {},
  handler: async (ctx) => {
    // Count users (use a bounded query — just count profiles)
    const profiles = await ctx.db.query("userProfiles").take(100000);
    const memberCount = profiles.length;

    // Count threads (non-deleted)
    const threads = await ctx.db
      .query("forumThreads")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(100000);
    const threadCount = threads.length;

    // Sum post counts from categories (denormalized) to avoid scanning forumPosts
    const categories = await ctx.db.query("forumCategories").collect();
    const postCount = categories.reduce((sum, cat) => sum + cat.postCount, 0);

    return {
      members: formatCount(memberCount),
      discussions: formatCount(threadCount),
      comments: formatCount(postCount),
    };
  },
});

// Helper - format numbers like "24.5K", "1.2M"
function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
```

**Note**: For large-scale production, you would want a denormalized stats record. For now, the category `postCount` aggregation and capped `.take()` are acceptable.

### 4. `getTrendingTopics` — Most active recent threads

```typescript
export const getTrendingTopics = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    // Get recent threads with high engagement
    const recentThreads = await ctx.db
      .query("forumThreads")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(50); // Scan recent 50 threads

    // Score by engagement
    const scored = recentThreads.map((thread) => {
      const upvotes = thread.upvoteCount ?? 0;
      const posts = thread.postCount;
      const views = thread.viewCount;
      const ageHours = (Date.now() - thread.createdAt) / 3600000;
      const score = (upvotes * 3 + posts * 2 + views * 0.1) * Math.pow(0.95, ageHours / 24);
      return { thread, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topThreads = scored.slice(0, limit);

    // Enrich with category info
    const trending = await Promise.all(
      topThreads.map(async ({ thread, score }) => {
        const category = await ctx.db.get(thread.categoryId);
        return {
          id: thread._id,
          title: thread.title,
          category: category?.name ?? "General",
          posts: thread.postCount,
          trend: score > 50 ? "hot" as const : "rising" as const,
        };
      })
    );

    return trending;
  },
});
```

**DB efficiency**: Scans only 50 recent threads (by default desc order), sorts in memory. O(50) reads + O(5) category lookups.

### 5. `getActiveCampaign` — Current active campaign

```typescript
export const getActiveCampaign = query({
  args: {},
  handler: async (ctx) => {
    const campaign = await ctx.db
      .query("forumCampaigns")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (!campaign) return null;

    return {
      id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      prize: campaign.prize,
      endDate: campaign.endDate,
      progress: campaign.currentProgress,
      targetPoints: campaign.targetPoints,
      participantCount: campaign.participantCount,
    };
  },
});
```

**DB efficiency**: Indexed query, returns single document. O(1).

### 6. `toggleReaction` — Upvote/bookmark toggle

```typescript
export const toggleReaction = mutation({
  args: {
    targetType: v.union(v.literal("thread"), v.literal("post"), v.literal("comment")),
    targetId: v.string(),
    reactionType: v.union(v.literal("upvote"), v.literal("downvote"), v.literal("bookmark")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Check existing reaction
    const existing = await ctx.db
      .query("forumReactions")
      .withIndex("by_user_target", (q) =>
        q.eq("userId", userId).eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .first();

    if (existing && existing.reactionType === args.reactionType) {
      // Remove reaction (toggle off)
      await ctx.db.delete(existing._id);

      // Update denormalized count
      if (args.targetType === "thread" && args.reactionType === "upvote") {
        const thread = await ctx.db.get(args.targetId as any);
        if (thread) {
          await ctx.db.patch(thread._id, {
            upvoteCount: Math.max(0, (thread.upvoteCount ?? 0) - 1),
          });
        }
      }

      return { action: "removed" };
    }

    // If different reaction type exists, remove it first
    if (existing) {
      await ctx.db.delete(existing._id);
      // Decrement old count if needed
      if (args.targetType === "thread" && existing.reactionType === "upvote") {
        const thread = await ctx.db.get(args.targetId as any);
        if (thread) {
          await ctx.db.patch(thread._id, {
            upvoteCount: Math.max(0, (thread.upvoteCount ?? 0) - 1),
          });
        }
      }
    }

    // Add new reaction
    await ctx.db.insert("forumReactions", {
      userId,
      targetType: args.targetType,
      targetId: args.targetId,
      reactionType: args.reactionType,
      createdAt: Date.now(),
    });

    // Update denormalized count
    if (args.targetType === "thread" && args.reactionType === "upvote") {
      const thread = await ctx.db.get(args.targetId as any);
      if (thread) {
        await ctx.db.patch(thread._id, {
          upvoteCount: (thread.upvoteCount ?? 0) + 1,
        });
      }
    }

    return { action: "added" };
  },
});
```

**DB efficiency**: Uses compound index `by_user_target` for O(1) lookup. Single document insert + denormalized patch.

### 7. `getUserReactions` — Get current user's reactions for a set of targets

```typescript
export const getUserReactions = query({
  args: {
    targetType: v.union(v.literal("thread"), v.literal("post"), v.literal("comment")),
    targetIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    // Batch lookup reactions for the current user
    const reactions: Record<string, string> = {};
    for (const targetId of args.targetIds) {
      const reaction = await ctx.db
        .query("forumReactions")
        .withIndex("by_user_target", (q) =>
          q.eq("userId", userId).eq("targetType", args.targetType).eq("targetId", targetId)
        )
        .first();
      if (reaction) {
        reactions[targetId] = reaction.reactionType;
      }
    }

    return reactions;
  },
});
```

### 8. `getUserProfile` — Public user profile query

```typescript
export const getUserProfile = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!profile) return null;

    const user = await ctx.db.get(profile.userId);

    // Get user's thread count
    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_author", (q) => q.eq("authorId", profile.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(1000);

    // Get user's post count
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_author", (q) => q.eq("authorId", profile.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(1000);

    // Get points
    const points = await ctx.db
      .query("userPoints")
      .withIndex("by_user", (q) => q.eq("userId", profile.userId))
      .first();

    return {
      username: profile.username,
      displayName: profile.displayName ?? user?.name ?? "Anonymous",
      avatarUrl: profile.avatarUrl ?? null,
      bio: profile.bio ?? null,
      role: profile.defaultRole,
      joinedAt: profile.createdAt,
      threadCount: threads.length,
      postCount: posts.length,
      reputation: points?.totalPoints ?? 0,
    };
  },
});
```

### 9. `getCategoryBySlug` — Category lookup by slug

```typescript
export const getCategoryBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("forumCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!category || !category.isActive) return null;

    return {
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      icon: category.icon ?? "💬",
      color: category.color ?? null,
      threadCount: category.threadCount,
      postCount: category.postCount,
    };
  },
});
```

### 10. `listThreadsByCategory` — Threads for category page (using slug)

This wraps the existing `listThreads` but accepts a slug instead of ID:

```typescript
export const listThreadsBySlug = query({
  args: {
    slug: v.string(),
    limit: v.optional(v.number()),
    sort: v.optional(v.union(v.literal("recent"), v.literal("popular"), v.literal("unanswered"))),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("forumCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!category || !category.isActive) return null;

    const limit = args.limit ?? 20;

    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit + 1);

    const hasMore = threads.length > limit;
    const result = hasMore ? threads.slice(0, limit) : threads;

    // Sort if needed
    if (args.sort === "popular") {
      result.sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0));
    }

    // Enrich with author info
    const enriched = await Promise.all(
      result.map(async (thread) => {
        const author = await ctx.db.get(thread.authorId);
        const profile = author
          ? await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", author._id)).first()
          : null;

        return {
          ...thread,
          author: author ? {
            id: author._id,
            name: profile?.displayName ?? author.name ?? "Anonymous",
            username: profile?.username ?? author._id,
            avatarUrl: profile?.avatarUrl ?? null,
          } : null,
        };
      })
    );

    return {
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        icon: category.icon ?? "💬",
        threadCount: category.threadCount,
      },
      threads: enriched,
      hasMore,
    };
  },
});
```

### 11. `getUserThreads` — Threads by a specific user

```typescript
export const getUserThreads = query({
  args: {
    username: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!profile) return [];

    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_author", (q) => q.eq("authorId", profile.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit);

    // Enrich with category
    return Promise.all(
      threads.map(async (thread) => {
        const category = await ctx.db.get(thread.categoryId);
        return {
          id: thread._id,
          title: thread.title,
          slug: thread.slug,
          createdAt: thread.createdAt,
          postCount: thread.postCount,
          viewCount: thread.viewCount,
          upvoteCount: thread.upvoteCount ?? 0,
          isPinned: thread.isPinned,
          category: category ? { name: category.name, slug: category.slug, icon: category.icon } : null,
        };
      })
    );
  },
});
```

## Summary of New Functions

| Function | Type | Index Used | Max Docs Scanned |
|----------|------|-----------|-----------------|
| `listDiscussions` | query | default `_creationTime` | ~40 |
| `getLeaderboard` | query | `by_weekly_points` / `by_total_points` | 10-30 |
| `getCommunityStats` | query | category `collect` | categories count |
| `getTrendingTopics` | query | default `_creationTime` | 50 |
| `getActiveCampaign` | query | `by_active` | 1 |
| `toggleReaction` | mutation | `by_user_target` | 1 |
| `getUserReactions` | query | `by_user_target` | N targets |
| `getUserProfile` | query | `by_username` | 1 + counts |
| `getCategoryBySlug` | query | `by_slug` | 1 |
| `listThreadsBySlug` | query | `by_slug` + `by_category` | ~20 |
| `getUserThreads` | query | `by_username` + `by_author` | ~10 |
