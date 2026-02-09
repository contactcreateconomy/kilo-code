# Phase 05 — Downvoting & Net Score

> **Priority:** 🔴 Critical  
> **Depends on:** None (can run in parallel with Phase 01)  
> **Enables:** Phase 02 (Comment sorting by score)

## Problem

The `toggleReaction` mutation already accepts `"downvote"` as a valid `reactionType`, but:
- The UI only shows upvote buttons
- `downvoteCount` is not tracked on threads/comments
- The feed only sorts by `upvoteCount`, not net score
- There's no "controversial" sort option

Reddit shows net score (upvotes − downvotes) and supports controversial sorting for content with high engagement but polarized opinions.

## Goal

Add downvote buttons, track net score, and enable controversial sorting.

---

## Schema Changes

### Update `forumThreads` table

```typescript
// Add to forumThreads
downvoteCount: v.optional(v.number()),  // Default 0
score: v.optional(v.number()),           // upvoteCount - downvoteCount
```

### Update `comments` table (from Phase 02)

Already includes `upvoteCount`, `downvoteCount`, and `score` in the Phase 02 schema.

### Add new index for sorting

```typescript
// Add to forumThreads
.index("by_score", ["score"])
.index("by_controversial", ["tenantId", "createdAt"]) // We'll compute controversy score at query time
```

---

## Backend Changes

### File: `packages/convex/convex/functions/forum.ts`

#### Update `toggleReaction` mutation

Modify to update both `upvoteCount` and `downvoteCount` + recalculate `score`:

```typescript
export const toggleReaction = mutation({
  args: {
    targetType: v.union(v.literal("thread"), v.literal("comment")),
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

    let deltaUp = 0;
    let deltaDown = 0;

    if (existing) {
      // Remove existing reaction
      await ctx.db.delete(existing._id);
      if (existing.reactionType === "upvote") deltaUp = -1;
      if (existing.reactionType === "downvote") deltaDown = -1;

      // If clicking same reaction type, we're done (toggle off)
      if (existing.reactionType === args.reactionType) {
        await updateTargetCounts(ctx, args, deltaUp, deltaDown);
        return { action: "removed" };
      }
    }

    // Add new reaction (unless it's just a removal)
    if (args.reactionType !== "bookmark") {
      await ctx.db.insert("forumReactions", {
        userId,
        targetType: args.targetType,
        targetId: args.targetId,
        reactionType: args.reactionType,
        createdAt: Date.now(),
      });
      if (args.reactionType === "upvote") deltaUp = 1;
      if (args.reactionType === "downvote") deltaDown = 1;
    }

    await updateTargetCounts(ctx, args, deltaUp, deltaDown);
    return { action: "added" };
  },
});

async function updateTargetCounts(
  ctx: MutationCtx,
  args: { targetType: string; targetId: string },
  deltaUp: number,
  deltaDown: number
) {
  if (args.targetType === "thread") {
    const thread = await ctx.db.get(args.targetId as Id<"forumThreads">);
    if (thread) {
      const newUp = (thread.upvoteCount ?? 0) + deltaUp;
      const newDown = (thread.downvoteCount ?? 0) + deltaDown;
      await ctx.db.patch(args.targetId as Id<"forumThreads">, {
        upvoteCount: Math.max(0, newUp),
        downvoteCount: Math.max(0, newDown),
        score: newUp - newDown,
      });
    }
  } else if (args.targetType === "comment") {
    const comment = await ctx.db.get(args.targetId as Id<"comments">);
    if (comment) {
      const newUp = (comment.upvoteCount ?? 0) + deltaUp;
      const newDown = (comment.downvoteCount ?? 0) + deltaDown;
      await ctx.db.patch(args.targetId as Id<"comments">, {
        upvoteCount: Math.max(0, newUp),
        downvoteCount: Math.max(0, newDown),
        score: newUp - newDown,
      });
    }
  }
}
```

#### Update `listDiscussions` query

Add "controversial" sort option:

```typescript
export const listDiscussions = query({
  args: {
    sortBy: v.optional(
      v.union(
        v.literal("top"),
        v.literal("hot"),
        v.literal("new"),
        v.literal("controversial")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const sortBy = args.sortBy ?? "hot";

    // Fetch threads
    const threads = await ctx.db
      .query("forumThreads")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit * 2);

    // Sort based on sortBy
    let sorted = [...threads];
    
    switch (sortBy) {
      case "top":
        sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        break;
        
      case "hot":
        sorted.sort((a, b) => {
          const scoreA = (a.score ?? 0) + a.commentCount * 2;
          const scoreB = (b.score ?? 0) + b.commentCount * 2;
          const ageA = (Date.now() - a.createdAt) / 3600000;
          const ageB = (Date.now() - b.createdAt) / 3600000;
          return scoreB * Math.pow(0.95, ageB / 24) - scoreA * Math.pow(0.95, ageA / 24);
        });
        break;
        
      case "controversial":
        // High engagement but polarized votes
        sorted.sort((a, b) => {
          const controversyA = calculateControversy(a);
          const controversyB = calculateControversy(b);
          return controversyB - controversyA;
        });
        break;
        
      // "new" is already sorted by creation time
    }

    return { discussions: sorted.slice(0, limit), hasMore: threads.length > limit };
  },
});

function calculateControversy(thread: { upvoteCount?: number; downvoteCount?: number }): number {
  const up = thread.upvoteCount ?? 0;
  const down = thread.downvoteCount ?? 0;
  const total = up + down;
  
  if (total < 5) return 0; // Need minimum engagement
  
  // Controversy = engagement * balance
  // Balance is highest (1) when up ≈ down, lowest (0) when one dominates
  const balance = 1 - Math.abs(up - down) / total;
  return total * balance;
}
```

#### Update `getUserReactions` query

Return both upvote and downvote status:

```typescript
export const getUserReactions = query({
  args: {
    targetType: v.union(v.literal("thread"), v.literal("comment")),
    targetIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    const reactions: Record<string, { type: string }> = {};
    for (const targetId of args.targetIds) {
      const reaction = await ctx.db
        .query("forumReactions")
        .withIndex("by_user_target", (q) =>
          q.eq("userId", userId).eq("targetType", args.targetType).eq("targetId", targetId)
        )
        .first();
      if (reaction) {
        reactions[targetId] = { type: reaction.reactionType };
      }
    }
    return reactions;
  },
});
```

---

## Frontend Changes

### 1. Update `apps/forum/src/hooks/use-reactions.ts`

Add downvote support:

```typescript
export function useReactions(targetType: TargetType, targetIds: string[]) {
  const reactions = useQuery(api.functions.forum.getUserReactions, 
    targetIds.length > 0 ? { targetType, targetIds } : "skip"
  );
  const toggleMutation = useMutation(api.functions.forum.toggleReaction);

  const toggle = useCallback(
    async (targetId: string, reactionType: "upvote" | "downvote" | "bookmark") => {
      return await toggleMutation({ targetType, targetId, reactionType });
    },
    [toggleMutation, targetType]
  );

  const hasUpvote = useCallback(
    (targetId: string) => reactions?.[targetId]?.type === "upvote",
    [reactions]
  );

  const hasDownvote = useCallback(
    (targetId: string) => reactions?.[targetId]?.type === "downvote",
    [reactions]
  );

  return { toggle, hasUpvote, hasDownvote, isLoading: reactions === undefined };
}
```

### 2. Update `apps/forum/src/components/feed/discussion-card.tsx`

Add downvote button and show net score:

```typescript
function DiscussionCard({ discussion }) {
  const { toggle, hasUpvote, hasDownvote } = useReactions('thread', [discussion.id]);
  
  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => toggle(discussion.id, 'upvote'));
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => toggle(discussion.id, 'downvote'));
  };

  // Net score instead of just upvotes
  const score = discussion.score ?? 0;
  const isUpvoted = hasUpvote(discussion.id);
  const isDownvoted = hasDownvote(discussion.id);

  return (
    <article>
      {/* Voting column - Reddit style */}
      <div className="flex flex-col items-center mr-4">
        <button
          onClick={handleUpvote}
          className={cn(
            "p-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30",
            isUpvoted && "text-orange-500"
          )}
        >
          <ArrowBigUp className={cn("h-6 w-6", isUpvoted && "fill-current")} />
        </button>
        
        <span className={cn(
          "text-sm font-bold my-1",
          isUpvoted && "text-orange-500",
          isDownvoted && "text-blue-500"
        )}>
          {formatScore(score)}
        </span>
        
        <button
          onClick={handleDownvote}
          className={cn(
            "p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30",
            isDownvoted && "text-blue-500"
          )}
        >
          <ArrowBigDown className={cn("h-6 w-6", isDownvoted && "fill-current")} />
        </button>
      </div>
      
      {/* Rest of card content */}
    </article>
  );
}

function formatScore(score: number): string {
  if (score >= 10000) return `${(score / 1000).toFixed(0)}k`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return score.toString();
}
```

### 3. Update `apps/forum/src/components/feed/feed-tabs.tsx`

Add Controversial tab:

```typescript
const tabs: { id: FeedTabType; label: string; icon: ComponentType }[] = [
  { id: 'hot', label: 'Hot', icon: Flame },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'top', label: 'Top', icon: TrendingUp },
  { id: 'controversial', label: 'Controversial', icon: Zap },
];
```

### 4. Update types

```typescript
// apps/forum/src/types/forum.ts
export type FeedTabType = 'hot' | 'new' | 'top' | 'controversial';

export interface Discussion {
  // ...existing fields
  upvotes: number;      // Keep for backward compat
  downvotes: number;    // Add
  score: number;        // Add (upvotes - downvotes)
}
```

### 5. Create comment voting component

For Phase 02 integration:

```typescript
// apps/forum/src/components/comments/comment-vote.tsx
interface CommentVoteProps {
  commentId: string;
  score: number;
}

function CommentVote({ commentId, score }: CommentVoteProps) {
  const { toggle, hasUpvote, hasDownvote } = useReactions('comment', [commentId]);
  
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => toggle(commentId, 'upvote')}>
        <ArrowUp className={cn("h-4 w-4", hasUpvote(commentId) && "text-orange-500")} />
      </button>
      <span className="text-xs font-medium">{score}</span>
      <button onClick={() => toggle(commentId, 'downvote')}>
        <ArrowDown className={cn("h-4 w-4", hasDownvote(commentId) && "text-blue-500")} />
      </button>
    </div>
  );
}
```

---

## Score Display Rules

| Score | Display |
|-------|---------|
| Hidden | For first hour after posting (optional, anti-brigading) |
| 0 | Show "0" or "•" |
| Negative | Show actual number or "0" (Reddit shows negatives) |
| 1000+ | Format as "1.2k" |
| 10000+ | Format as "12k" |

---

## Migration

Add default values for existing threads:

```typescript
// One-time migration
const threads = await ctx.db.query("forumThreads").collect();
for (const thread of threads) {
  if (thread.downvoteCount === undefined) {
    await ctx.db.patch(thread._id, {
      downvoteCount: 0,
      score: thread.upvoteCount ?? 0,
    });
  }
}
```

---

## Implementation Checklist

- [ ] Add `downvoteCount` and `score` to `forumThreads` schema
- [ ] Add new indexes for score-based sorting
- [ ] Update `toggleReaction` to handle downvotes properly
- [ ] Update `toggleReaction` to maintain `score` field
- [ ] Add `calculateControversy` function
- [ ] Update `listDiscussions` with controversial sort
- [ ] Update `getUserReactions` return format
- [ ] Update `useReactions` hook for downvote support
- [ ] Add downvote button to `discussion-card.tsx`
- [ ] Style upvote/downvote with appropriate colors
- [ ] Show net score instead of just upvotes
- [ ] Add Controversial tab to feed tabs
- [ ] Update feed types for new sort option
- [ ] Create `CommentVote` component for Phase 02
- [ ] Add score formatting utility
- [ ] Run migration for existing threads
- [ ] Test controversial sorting algorithm
- [ ] Consider score hiding for new posts (anti-brigading)
