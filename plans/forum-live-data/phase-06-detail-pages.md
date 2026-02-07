# Phase 06 — Detail Pages (Thread, Category, User Profile)

**Files to modify**:
- [`apps/forum/src/app/t/[id]/page.tsx`](../../apps/forum/src/app/t/%5Bid%5D/page.tsx)
- [`apps/forum/src/app/c/[slug]/page.tsx`](../../apps/forum/src/app/c/%5Bslug%5D/page.tsx)
- [`apps/forum/src/app/u/[username]/page.tsx`](../../apps/forum/src/app/u/%5Busername%5D/page.tsx)
- [`apps/forum/src/components/forum/thread-list.tsx`](../../apps/forum/src/components/forum/thread-list.tsx)
- [`apps/forum/src/components/forum/reply-form.tsx`](../../apps/forum/src/components/forum/reply-form.tsx)
- [`apps/forum/src/components/navbar/notifications-dropdown.tsx`](../../apps/forum/src/components/navbar/notifications-dropdown.tsx)

## Changes

### 1. Thread Detail Page — `t/[id]/page.tsx`

**Current**: Server Component with mock `getThread()` and `getThreadPosts()` functions containing hardcoded data (lines 29-136).

**Target**: Convert to Client Component that uses `useThread(threadId)` and `useForum()` hooks from `use-forum.ts`.

Key changes:
- Add `"use client"` directive
- Remove the mock `getThread()` and `getThreadPosts()` functions entirely
- Use `useThread(id)` hook which returns thread + posts + author + category
- Use `useForum().viewThread(id)` to increment view count on mount
- Remove `generateMetadata` (client components cannot have it — add a `<title>` via `useEffect` or accept this tradeoff)
- The `PostList` component receives real posts from the `useThread` hook
- The `ReplyForm` wires to `useForum().createPost()`

```typescript
"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useThread, useForum } from "@/hooks/use-forum";
import { PostList } from "@/components/forum/post-list";
import { ReplyForm } from "@/components/forum/reply-form";
import { UserBadge } from "@/components/forum/user-badge";
import { Button, Skeleton } from "@createconomy/ui";
import { useAuth } from "@/hooks/use-auth";

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { thread, isLoading } = useThread(id);
  const { viewThread } = useForum();
  const { isAuthenticated } = useAuth();

  // Track view on mount
  useEffect(() => {
    if (id) viewThread(id);
  }, [id, viewThread]);

  if (isLoading) return <ThreadSkeleton />;
  if (!thread) return notFound();

  // Map posts from thread data
  const posts = thread.posts?.map((post) => ({
    id: post._id,
    content: post.content,
    author: {
      id: post.author?.id ?? "unknown",
      username: post.author?.displayName ?? post.author?.name ?? "Anonymous",
      avatar: post.author?.avatarUrl ?? undefined,
      role: post.author?.role ?? "Member",
    },
    createdAt: new Date(post.createdAt),
    likeCount: post.likeCount ?? 0,
  })) ?? [];

  // ... render using real data
}
```

### 2. Category Page — `c/[slug]/page.tsx`

**Current**: Server Component with mock `getCategory()` function (lines 11-56).

**Target**: Convert to Client Component using `useCategoryThreads(slug)` hook.

Key changes:
- Add `"use client"` directive
- Remove mock `getCategory()` function
- Use `useCategoryThreads(slug, sort)` hook
- The `ThreadList` receives real threads from the hook
- Category header shows real data from the hook result

```typescript
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useCategoryThreads } from "@/hooks/use-category-threads";
import { SearchBar } from "@/components/forum/search-bar";
import { Button, Skeleton } from "@createconomy/ui";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [sort, setSort] = useState<"recent" | "popular" | "unanswered">("recent");
  const { category, threads, hasMore, isLoading } = useCategoryThreads(slug, sort);

  if (isLoading) return <CategorySkeleton />;
  if (!category) return notFound();

  // ... render with real data
}
```

The `ThreadList` component can receive the threads directly:

```typescript
<ThreadList
  threads={threads.map((t) => ({
    id: t._id,
    title: t.title,
    excerpt: t.aiSummary ?? undefined,
    author: t.author ? {
      id: t.author.id,
      username: t.author.username,
      avatar: t.author.avatarUrl ?? undefined,
    } : { id: "unknown", username: "Anonymous" },
    category: { name: category.name, slug: category.slug, icon: category.icon },
    createdAt: new Date(t.createdAt),
    replyCount: t.postCount - 1,
    viewCount: t.viewCount,
    isPinned: t.isPinned,
    isLocked: t.isLocked,
  }))}
  emptyMessage={`No threads in ${category.name} yet`}
/>
```

### 3. User Profile Page — `u/[username]/page.tsx`

**Current**: Server Component with mock `getUser()` function (lines 10-49).

**Target**: Convert to Client Component using `useUserProfile(username)` and `getUserThreads(username)`.

Key changes:
- Add `"use client"` directive
- Remove mock `getUser()` function
- Use `useUserProfile(username)` hook for profile data
- Use `useQuery(api.functions.forum.getUserThreads, { username })` for activity
- Handle loading and not-found states

```typescript
"use client";

import { use } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { profile, isLoading } = useUserProfile(username);
  const threads = useQuery(
    api.functions.forum.getUserThreads,
    username ? { username, limit: 10 } : "skip"
  );

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return notFound();

  // ... render with real data
}
```

### 4. `thread-list.tsx` — Already mostly data-driven

**Current**: Accepts `threads` prop, has a TODO comment about fetching from Convex.

**Target**: No major changes needed — this component already renders from props. It will receive real data from parent pages.

### 5. `reply-form.tsx` — Wire to Convex mutation

**Current**: Likely uses local state for form, may simulate submission.

**Target**: Call `useForum().createPost({ threadId, content })` on submit.

### 6. `notifications-dropdown.tsx` — Remove mock notifications

**Current**: Has hardcoded `mockNotifications` array (lines 9-13).

**Target**: For now, since there is no notifications table in the schema, we have two options:
- **Option A**: Remove the notification content and show "No notifications yet" empty state
- **Option B**: Derive notifications from recent reactions/replies (complex)

**Recommendation**: Option A for this migration. Replace mock data with empty state:

```diff
- const mockNotifications: Notification[] = [
-   { id: '1', title: 'New reply', ... },
-   { id: '2', title: 'Upvote', ... },
-   { id: '3', title: 'Mention', ... },
- ];
+ // TODO: Add notifications table and query
+ const notifications: Notification[] = [];

  export function NotificationsDropdown() {
-   const unreadCount = mockNotifications.filter(n => !n.read).length;
+   const unreadCount = 0;
    ...
-   mockNotifications.map(...)
+   {notifications.length === 0 ? (
+     <div className="p-8 text-center text-muted-foreground">
+       <p>No notifications yet</p>
+     </div>
+   ) : (
+     notifications.map(...)
+   )}
```

## Server Component → Client Component Tradeoffs

Converting detail pages to client components means:
1. **No `generateMetadata`** — SEO metadata won't be generated server-side. Mitigation: use `useEffect` to set document.title, or consider a hybrid approach with a thin Server Component wrapper.
2. **Initial loading state** — Users see a skeleton before data loads. This is acceptable for an SPA-like forum.
3. **Real-time updates** — Convex queries are reactive, so upvotes/new posts appear instantly.

Alternative approach: Keep pages as Server Components but fetch data via Convex HTTP client (not reactive). This preserves SEO but loses reactivity. Given the forum's interactive nature, client components are the better fit.
