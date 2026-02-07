# Phase 03 — Homepage & Discussion Feed

**Files to modify**:
- [`apps/forum/src/app/page.tsx`](../../apps/forum/src/app/page.tsx)
- [`apps/forum/src/components/feed/discussion-feed.tsx`](../../apps/forum/src/components/feed/discussion-feed.tsx)
- [`apps/forum/src/components/feed/discussion-card.tsx`](../../apps/forum/src/components/feed/discussion-card.tsx)
- [`apps/forum/src/components/feed/featured-slider.tsx`](../../apps/forum/src/components/feed/featured-slider.tsx)

## Changes

### 1. `page.tsx` — Remove mock import, use hook

**Current**: Imports `mockDiscussions` from `@/data/mock-data` and passes as `initialDiscussions` prop.

**Target**: Remove the mock import entirely. The `DiscussionFeed` component will fetch its own data internally using `useDiscussionFeed`.

```diff
- import { mockDiscussions } from '@/data/mock-data';
...
-             <DiscussionFeed initialDiscussions={mockDiscussions} />
+             <DiscussionFeed />
```

### 2. `discussion-feed.tsx` — Full rewrite to use Convex

**Current**: Accepts `initialDiscussions` prop, manages state internally, simulates infinite scroll by duplicating mock data.

**Target**: Calls `useDiscussionFeed(sortBy)` hook. Tab changes update the sortBy parameter. Infinite scroll is handled by increasing the limit parameter. Featured discussions are filtered from the results.

Key changes:
- Remove `initialDiscussions` prop
- Remove `useState` for discussions — data comes from `useQuery` reactively
- Remove the fake `loadMore` that duplicates mock data
- Keep the `IntersectionObserver` pattern but use it to request more data via increasing limit
- Show skeleton/loading states while `isLoading` is true
- `FeaturedSlider` receives live featured discussions (pinned or high engagement)

The `DiscussionFeed` component interface changes:

```typescript
interface DiscussionFeedProps {
  className?: string;
  showFeaturedSlider?: boolean;
}
```

Internal implementation:
- `activeTab` state controls which sort to pass to `useDiscussionFeed`
- The hook returns `discussions`, `hasMore`, `isLoading`
- Map each discussion to a `DiscussionCard`
- Featured = discussions where `isPinned || upvoteCount > 100`

### 3. `discussion-card.tsx` — Remove mock participants, add real reactions

**Current**:
- Has hardcoded `mockParticipants` array with unsplash avatar URLs at line 37-43
- Manages upvote/bookmark state locally with `useState` (not persisted)

**Target**:
- Remove `mockParticipants` constant entirely
- For the avatar stack, either:
  - Remove it (simplest — participants aren't tracked per-thread in schema)
  - Or show nothing if no participant data available
- Wire upvote/bookmark to the `useReactions` hook for persistence
- Accept a slightly different `discussion` prop shape matching Convex output:
  - `_id` instead of `id`
  - `upvoteCount` instead of `upvotes`
  - `postCount` instead of `comments`
  - `author.avatarUrl` instead of `author.avatarUrl` (nullable)
  - `category.icon` and `category.color` from DB

**Type mapping** from Convex `listDiscussions` output:

```typescript
interface DiscussionFromDB {
  _id: string;
  title: string;
  slug: string;
  aiSummary: string | null;
  imageUrl: string | null;
  isPinned: boolean;
  upvoteCount: number;
  postCount: number;
  viewCount: number;
  createdAt: number; // epoch ms, not Date
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  } | null;
}
```

The `DiscussionCard` should be adapted to accept this shape or a mapped version.

### 4. `featured-slider.tsx` — Accept Convex discussion shape

**Current**: Uses `Discussion` type with `author.avatarUrl` (always present), `category.icon` as Lucide icon name.

**Target**: Handle nullable `author.avatarUrl` (fallback to initials/dicebear), nullable `category.icon` (show default emoji). The `a href` should use `_id` or `slug` for the link.

### 5. Update `types/forum.ts`

The `Discussion` interface should be updated or a new `DiscussionFromDB` interface added alongside. The cleanest approach is to update `Discussion` to match what Convex returns and add a mapping layer if needed.

New approach: Keep `Discussion` as the UI type but add an adapter function:

```typescript
export function mapDiscussionFromDB(d: DiscussionFromDB): Discussion {
  return {
    id: d._id,
    title: d.title,
    aiSummary: d.aiSummary ?? "",
    author: d.author ? {
      id: d.author.id,
      name: d.author.name,
      username: d.author.username,
      avatarUrl: d.author.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.author.username}`,
    } : { id: "unknown", name: "Anonymous", username: "anonymous", avatarUrl: "" },
    category: d.category ? {
      id: d.category.id,
      name: d.category.name,
      slug: d.category.slug,
      icon: d.category.icon ?? "MessageSquare",
      color: d.category.color ?? "bg-gray-500",
      count: 0,
    } : { id: "unknown", name: "General", slug: "general", icon: "MessageSquare", color: "bg-gray-500", count: 0 },
    upvotes: d.upvoteCount,
    comments: d.postCount,
    createdAt: new Date(d.createdAt),
    imageUrl: d.imageUrl ?? undefined,
    isPinned: d.isPinned,
    isUpvoted: false, // Will be set by useReactions
    isBookmarked: false, // Will be set by useReactions
  };
}
```

This adapter lets existing UI components work with minimal changes while we transition.
