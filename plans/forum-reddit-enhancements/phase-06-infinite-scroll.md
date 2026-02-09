# Phase 06 — Infinite Scroll

> **Priority:** 🟡 Medium  
> **Depends on:** None (can run independently)  
> **Enables:** Better mobile experience, reduced navigation friction

## Problem

The current implementation uses page-based pagination with Previous/Next links. This requires users to explicitly click to load more content, interrupting the browsing flow. The `useInfiniteScroll` hook already exists at `apps/forum/src/hooks/use-infinite-scroll.ts` but isn't wired up.

## Goal

Replace page-based pagination with infinite scroll using cursor-based pagination and intersection observers.

---

## Backend Changes

### Update `listDiscussions` query

Add cursor-based pagination:

```typescript
export const listDiscussions = query({
  args: {
    sortBy: v.optional(v.union(
      v.literal("top"),
      v.literal("hot"),
      v.literal("new"),
      v.literal("controversial")
    )),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),  // Thread ID for pagination
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    let query = ctx.db
      .query("forumThreads")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc");
    
    // If cursor provided, start after that document
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as Id<"forumThreads">);
      if (cursorDoc) {
        query = query.filter((q) => 
          q.lt(q.field("createdAt"), cursorDoc.createdAt)
        );
      }
    }
    
    const threads = await query.take(limit + 1);
    const hasMore = threads.length > limit;
    const items = hasMore ? threads.slice(0, limit) : threads;
    
    // Sort in-memory based on sortBy (for non-"new" sorts)
    // ... sorting logic from existing implementation
    
    return {
      discussions: enriched,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?._id : null,
    };
  },
});
```

### Update `listThreadsBySlug` query

Same pattern for category pages:

```typescript
export const listThreadsBySlug = query({
  args: {
    slug: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    sort: v.optional(v.union(
      v.literal("recent"),
      v.literal("popular"),
      v.literal("unanswered")
    )),
  },
  handler: async (ctx, args) => {
    // Similar cursor-based implementation
  },
});
```

---

## Frontend Changes

### 1. Update `apps/forum/src/hooks/use-discussion-feed.ts`

Add cursor support and load-more capability:

```typescript
export function useDiscussionFeed(activeTab: FeedTabType = "hot", limit = 20) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [allDiscussions, setAllDiscussions] = useState<Discussion[]>([]);
  
  const result = useQuery(api.functions.forum.listDiscussions, {
    sortBy: tabToSort(activeTab),
    limit,
    cursor: cursor ?? undefined,
  });
  
  // Append new discussions when result changes
  useEffect(() => {
    if (result?.discussions) {
      if (cursor === null) {
        // Initial load or tab change - replace
        setAllDiscussions(result.discussions.map(mapDiscussion));
      } else {
        // Load more - append
        setAllDiscussions(prev => [
          ...prev,
          ...result.discussions.map(mapDiscussion),
        ]);
      }
    }
  }, [result, cursor]);
  
  // Reset when tab changes
  useEffect(() => {
    setCursor(null);
    setAllDiscussions([]);
  }, [activeTab]);
  
  const loadMore = useCallback(() => {
    if (result?.nextCursor) {
      setCursor(result.nextCursor);
    }
  }, [result?.nextCursor]);
  
  return {
    discussions: allDiscussions,
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
    isLoadingMore: cursor !== null && result === undefined,
    loadMore,
  };
}
```

### 2. Update `apps/forum/src/components/feed/discussion-feed.tsx`

Integrate with `useInfiniteScroll`:

```typescript
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

export function DiscussionFeed({ showFeaturedSlider = true }: DiscussionFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTabType>('hot');
  const { discussions, isLoading, hasMore, loadMore, isLoadingMore } = useDiscussionFeed(activeTab, 20);
  
  const { ref: loadMoreRef } = useInfiniteScroll(loadMore, {
    enabled: hasMore && !isLoadingMore,
    threshold: 0.1,
    rootMargin: '200px',
  });
  
  return (
    <div className="flex flex-col gap-4">
      {/* Featured Slider */}
      {showFeaturedSlider && /* ... */}
      
      {/* Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Discussion Cards */}
      <div className="flex flex-col gap-4">
        {isLoading && discussions.length === 0 ? (
          <LoadingSkeleton count={5} />
        ) : discussions.length === 0 ? (
          <EmptyState message="No discussions yet" />
        ) : (
          <>
            {discussions.map((discussion, index) => (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                index={index}
              />
            ))}
            
            {/* Load more trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Scroll for more
                  </span>
                )}
              </div>
            )}
            
            {!hasMore && discussions.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                You've reached the end!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

### 3. Update `apps/forum/src/app/c/[slug]/page.tsx`

Remove page-based pagination, add infinite scroll:

```typescript
function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const sort = (searchParams.get('sort') ?? 'recent') as 'recent' | 'popular' | 'unanswered';
  
  const { category, threads, isLoading, hasMore, loadMore, isLoadingMore } = useCategoryThreads(slug, sort);
  
  const { ref: loadMoreRef } = useInfiniteScroll(loadMore, {
    enabled: hasMore && !isLoadingMore,
  });
  
  return (
    <div>
      {/* Category header */}
      
      {/* Thread list with infinite scroll */}
      <div className="space-y-4">
        {threads.map(thread => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
        
        {hasMore && (
          <div ref={loadMoreRef} className="py-4">
            {isLoadingMore && <Loader2 className="animate-spin mx-auto" />}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. New hook: `apps/forum/src/hooks/use-category-threads.ts` (update)

```typescript
export function useCategoryThreads(slug: string, sort: 'recent' | 'popular' | 'unanswered') {
  const [cursor, setCursor] = useState<string | null>(null);
  const [allThreads, setAllThreads] = useState<Thread[]>([]);
  
  const result = useQuery(api.functions.forum.listThreadsBySlug, {
    slug,
    sort,
    limit: 20,
    cursor: cursor ?? undefined,
  });
  
  // Reset on slug or sort change
  useEffect(() => {
    setCursor(null);
    setAllThreads([]);
  }, [slug, sort]);
  
  // Append results
  useEffect(() => {
    if (result?.threads) {
      if (cursor === null) {
        setAllThreads(result.threads);
      } else {
        setAllThreads(prev => [...prev, ...result.threads]);
      }
    }
  }, [result, cursor]);
  
  const loadMore = useCallback(() => {
    if (result?.nextCursor) {
      setCursor(result.nextCursor);
    }
  }, [result?.nextCursor]);
  
  return {
    category: result?.category ?? null,
    threads: allThreads,
    isLoading: result === undefined && cursor === null,
    isLoadingMore: cursor !== null && result === undefined,
    hasMore: result?.hasMore ?? false,
    loadMore,
  };
}
```

### 5. Comment infinite scroll (for Phase 02)

Apply same pattern to comment loading:

```typescript
// apps/forum/src/hooks/use-comments.ts
export function useComments(threadId: string, parentId?: string, sortBy = 'best') {
  const [cursor, setCursor] = useState<string | null>(null);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  
  const result = useQuery(api.functions.forum.getComments, {
    threadId,
    parentId,
    sortBy,
    cursor: cursor ?? undefined,
    limit: 20,
  });
  
  // ... same append/reset pattern
  
  return {
    comments: allComments,
    hasMore: result?.hasMore ?? false,
    loadMore,
    isLoading: result === undefined && cursor === null,
  };
}
```

---

## UX Considerations

### Loading States

- **Initial load**: Show skeleton cards
- **Load more**: Show subtle spinner at bottom
- **Tab change**: Reset and show skeleton

### Scroll Position

Maintain scroll position when:
- Navigating back from thread detail
- Switching browser tabs

```typescript
// Use sessionStorage to persist scroll position
useEffect(() => {
  const savedPosition = sessionStorage.getItem(`scroll-${pathname}`);
  if (savedPosition) {
    window.scrollTo(0, parseInt(savedPosition));
  }
  
  return () => {
    sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString());
  };
}, [pathname]);
```

### Error Handling

```typescript
const { ref } = useInfiniteScroll(async () => {
  try {
    await loadMore();
  } catch (error) {
    toast.error('Failed to load more. Tap to retry.');
  }
}, { enabled: hasMore && !isLoadingMore && !hasError });
```

---

## Implementation Checklist

- [ ] Add `cursor` arg to `listDiscussions` query
- [ ] Add `nextCursor` to query return type
- [ ] Update `listThreadsBySlug` with cursor pagination
- [ ] Update `useDiscussionFeed` hook with cursor support
- [ ] Update `useCategoryThreads` hook with cursor support
- [ ] Create `useComments` hook with cursor support
- [ ] Wire up `useInfiniteScroll` in `DiscussionFeed`
- [ ] Wire up infinite scroll in category pages
- [ ] Remove Previous/Next pagination buttons
- [ ] Add loading spinner for load-more state
- [ ] Add "You've reached the end" message
- [ ] Add scroll position persistence
- [ ] Handle errors gracefully with retry option
- [ ] Test on mobile devices
- [ ] Test with slow network (throttling)
