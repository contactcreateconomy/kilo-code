# Phase 07 — Cleanup & Verification

**Files to modify/delete**:
- `apps/forum/src/data/mock-data.ts` — **DELETE**
- `apps/forum/src/types/forum.ts` — Update types
- `apps/forum/src/types/index.ts` — Review exports
- `apps/forum/src/hooks/index.ts` — Update barrel exports
- All files confirmed clean of mock imports

## Step 1: Delete Mock Data File

```bash
rm apps/forum/src/data/mock-data.ts
```

Also delete the `data/` directory if it becomes empty:

```bash
rmdir apps/forum/src/data
```

## Step 2: Update Types

### `types/forum.ts`

The `Discussion`, `User`, `Category`, `LeaderboardEntry`, `Campaign`, `CommunityStats` types should be updated to reflect the Convex return shapes, or kept as UI-layer types with mapping functions.

**Recommended approach**: Keep existing types as UI-layer types but mark unused ones for removal. Add a `DiscussionFromDB` type alias:

```typescript
/**
 * Raw discussion shape from Convex listDiscussions query
 */
export interface DiscussionFromDB {
  _id: string;
  title: string;
  slug: string;
  aiSummary: string | null;
  imageUrl: string | null;
  isPinned: boolean;
  upvoteCount: number;
  postCount: number;
  viewCount: number;
  createdAt: number;
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

The `Discussion` type can remain as-is or be refactored to match. The adapter pattern from Phase 03 bridges the gap.

### Types to potentially remove

- `Campaign` type — keep, but note `endDate` is `number` (epoch ms) from DB not `Date`
- `CommunityStats` — unchanged, same shape
- `LeaderboardEntry` — the Convex version returns same shape
- `TrendingTopic` — update to match Convex output

## Step 3: Update Hook Barrel Exports

[`apps/forum/src/hooks/index.ts`](../../apps/forum/src/hooks/index.ts) should export all new hooks:

```typescript
// Existing
export { useForum, useCategories, useCategory, useThreads, useThread, usePostComments, useSearchThreads } from "./use-forum";
export { useAuth } from "./use-auth";
export { useFeedFilter } from "./use-feed-filter";

// New
export { useDiscussionFeed } from "./use-discussion-feed";
export { useLeaderboard } from "./use-leaderboard";
export { useCommunityStats } from "./use-community-stats";
export { useTrending } from "./use-trending";
export { useActiveCampaign } from "./use-campaign";
export { useReactions } from "./use-reactions";
export { useUserProfile } from "./use-user-profile";
export { useCategoryThreads } from "./use-category-threads";
```

## Step 4: Verify No Mock References Remain

Run a grep to confirm:

```bash
cd apps/forum && grep -r "mock-data\|mockDiscussions\|mockCategories\|mockUsers\|mockLeaderboard\|mockCommunityStats\|mockCampaign\|mockFeaturedDiscussions\|mockPremiumCategories\|mockParticipants\|mockNotifications\|mockPosts\|getThread\|getThreadPosts\|getCategory\|getUser" src/ --include="*.tsx" --include="*.ts" -l
```

Expected: No files should match (except potentially `use-feed-filter.ts` which references the `Discussion` type but not mock data).

## Step 5: Verify Build Compiles

```bash
pnpm --filter @createconomy/forum typecheck
pnpm --filter @createconomy/forum build
```

Fix any type errors from the migration.

## Step 6: Visual Verification

Launch the forum app and verify:

1. **Homepage** — Feed loads real discussions from DB (or shows empty state if DB is empty)
2. **Left sidebar** — Categories populated from DB (or show "No categories" if empty)
3. **Right sidebar** — Leaderboard, stats, trending, campaign all show real data or graceful empty states
4. **Create discussion** — Form submits to Convex, thread appears in feed
5. **Thread detail** — Real thread content renders with posts and replies
6. **Category page** — Real threads for the category
7. **User profile** — Real user data from Convex
8. **Notifications** — Shows empty state (no notification system yet)
9. **No console errors** from missing data or incorrect types
10. **Styling preserved** — Layout, colors, animations unchanged

## Step 7: Seed Data (Optional)

If the database is empty, the forum will show all empty states. To make it useful, consider seeding initial data via the `packages/convex/convex/functions/seed.ts` file:

- A few forum categories (News, Review, Help, etc.)
- One active campaign
- Initial user points for test users

This is separate from the mock data removal — seeding creates real DB records rather than frontend fakes.

## Comprehensive Mock Data Inventory — Final Checklist

| Source | File | Status |
|--------|------|--------|
| `mockUsers` | `data/mock-data.ts` | Deleted with file |
| `mockCategories` | `data/mock-data.ts` | Deleted with file |
| `mockPremiumCategories` | `data/mock-data.ts` | Deleted with file |
| `mockCampaign` | `data/mock-data.ts` | Deleted with file |
| `mockLeaderboard` | `data/mock-data.ts` | Deleted with file |
| `mockCommunityStats` | `data/mock-data.ts` | Deleted with file |
| `mockDiscussions` | `data/mock-data.ts` | Deleted with file |
| `mockFeaturedDiscussions` | `data/mock-data.ts` | Deleted with file |
| `trendingTopics` inline | `widgets/whats-vibing.tsx` | Replaced with hook |
| `mockParticipants` inline | `feed/discussion-card.tsx` | Removed |
| `mockNotifications` inline | `navbar/notifications-dropdown.tsx` | Replaced with empty |
| `getThread()` mock fn | `t/[id]/page.tsx` | Replaced with hook |
| `getThreadPosts()` mock fn | `t/[id]/page.tsx` | Replaced with hook |
| `getCategory()` mock fn | `c/[slug]/page.tsx` | Replaced with hook |
| `getUser()` mock fn | `u/[username]/page.tsx` | Replaced with hook |
| `defaultCategories` | `layout/sidebar.tsx` | Replaced with hook |
| `communityItems` hardcoded | `discussion/community-dropdown.tsx` | Replaced with props from DB |
| Campaign hardcoded text | `layout/left-sidebar.tsx` | Replaced with hook |
| Simulated form submit | `discussion/discussion-form.tsx` | Wired to Convex mutation |
| Simulated infinite scroll | `feed/discussion-feed.tsx` | Wired to Convex query |
