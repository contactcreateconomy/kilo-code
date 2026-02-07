# Phase 3 — Component Rewiring

## Goal
Update all forum components that currently consume mock data to instead use Convex queries via the hooks defined in Phase 2. After this phase, no component should import from [`@/data/mock-data`](apps/forum/src/data/mock-data.ts).

## Changes By Component

### 1. [`LeaderboardWidget`](apps/forum/src/components/widgets/leaderboard.tsx)

**Current state**: Imports [`mockLeaderboard`](apps/forum/src/data/mock-data.ts) as default prop value.

**Changes**:
- Remove `import { mockLeaderboard } from '@/data/mock-data'`
- Remove the `entries` prop default value
- Add `import { useLeaderboard } from '@/hooks/use-forum'`
- Call `const { entries, isLoading } = useLeaderboard(maxEntries)` inside the component
- Show a skeleton/loading state when `isLoading` is true
- Remove the `entries` prop from the interface entirely (data comes from hook)

---

### 2. [`CommunityStatsWidget`](apps/forum/src/components/widgets/community-stats.tsx)

**Current state**: Imports [`mockCommunityStats`](apps/forum/src/data/mock-data.ts) as default prop value.

**Changes**:
- Remove `import { mockCommunityStats } from '@/data/mock-data'`
- Remove the `stats` prop and its default
- Add `import { useCommunityStats } from '@/hooks/use-forum'`
- Call `const { stats, isLoading } = useCommunityStats()` inside the component
- Show `--` for each stat while loading
- Remove the `stats` prop from the interface entirely

---

### 3. [`CampaignWidget`](apps/forum/src/components/widgets/campaign-widget.tsx)

**Current state**: Imports [`mockCampaign`](apps/forum/src/data/mock-data.ts) as default prop value.

**Changes**:
- Remove `import { mockCampaign } from '@/data/mock-data'`
- Remove the `campaign` prop and its default
- Add `import { useActiveCampaign } from '@/hooks/use-forum'`
- Call `const { campaign, isLoading } = useActiveCampaign()` inside the component
- Return `null` if no active campaign exists (or show a placeholder)
- Remove the `campaign` prop from the interface entirely

---

### 4. [`ActiveCampaignWidget`](apps/forum/src/components/widgets/active-campaign.tsx)

**Current state**: Imports [`mockCampaign`](apps/forum/src/data/mock-data.ts) as default prop value.

**Changes**:
- Remove `import { mockCampaign } from '@/data/mock-data'`
- Remove the `campaign` prop and its default
- Add `import { useActiveCampaign } from '@/hooks/use-forum'`
- Call `const { campaign, isLoading } = useActiveCampaign()` inside the component
- Return `null` if no active campaign exists
- Remove the `campaign` prop from the interface entirely

---

### 5. [`WhatsVibingWidget`](apps/forum/src/components/widgets/whats-vibing.tsx)

**Current state**: Has hardcoded `trendingTopics` array at the top of the file (lines 8-44).

**Changes**:
- Delete the entire `trendingTopics` constant
- Add `import { useTrendingTopics } from '@/hooks/use-forum'`
- Call `const { topics, isLoading } = useTrendingTopics(5)` inside the component
- Replace `trendingTopics.map(...)` with `topics.map(...)`
- The topic shape from the query should match: `{ id, title, category, posts, trend }`
- Show loading skeleton while `isLoading`

---

### 6. [`DiscussionCard`](apps/forum/src/components/feed/discussion-card.tsx)

**Current state**: Has hardcoded [`mockParticipants`](apps/forum/src/components/feed/discussion-card.tsx:37) array with unsplash URLs and hardcoded [`categoryColors`](apps/forum/src/components/feed/discussion-card.tsx:27) map.

**Changes**:
- **`mockParticipants`**: Remove the hardcoded avatar URLs. The avatar stack should instead use participants from the discussion data. Add a `participants` field to the `Discussion` type (populated in the `listDiscussions` query from Phase 2 by getting unique post authors). If the discussion has no participants data, hide the avatar stack section entirely.
- **`categoryColors`**: Keep this mapping but make it dynamic — use the `discussion.category.color` field from the database rather than looking up by name. The category color is already stored in the database as e.g. `"bg-blue-500"`. Replace line 91 to use `discussion.category.color` directly instead of the `categoryColors` lookup.

---

### 7. [`DiscussionFeed`](apps/forum/src/components/feed/discussion-feed.tsx)

**Current state**: Receives `initialDiscussions` prop from parent. Has simulated infinite scroll that duplicates discussions.

**Changes**:
- Remove the `initialDiscussions` prop
- Add `import { useDiscussions } from '@/hooks/use-forum'`
- Call `const { discussions, isLoading } = useDiscussions(20)` inside the component
- Remove the fake `loadMore` function that duplicates discussions
- For now, disable infinite scroll (just show the fetched discussions)
- The `sortedDiscussions` logic can remain for client-side tab sorting

---

### 8. [`LeftSidebar`](apps/forum/src/components/layout/left-sidebar.tsx)

**Current state**: Imports [`mockCategories`](apps/forum/src/data/mock-data.ts) but does not use it in rendering — uses hardcoded `discoverItems` and `premiumItems` instead. Has hardcoded campaign card (lines 181-200) with literal text.

**Changes**:
- Remove `import { mockCategories } from '@/data/mock-data'` (unused import)
- **Campaign card section** (lines 181-200): Replace hardcoded values with data from `useActiveCampaign()` hook. Calculate progress percentage from `campaign.progress / campaign.targetPoints`. If no campaign, hide the card.
- The `discoverItems` and `premiumItems` are static navigation items, not database content — they can stay as-is since they represent UI navigation structure, not forum data.

---

### 9. [`Sidebar`](apps/forum/src/components/layout/sidebar.tsx) (traditional forum sidebar)

**Current state**: Has hardcoded [`defaultCategories`](apps/forum/src/components/layout/sidebar.tsx:21) array (lines 21-82). Has Community Stats section with `--` placeholders.

**Changes**:
- Add `import { useCategories, useCommunityStats } from '@/hooks/use-forum'`
- Replace `defaultCategories` with data from `useCategories()` hook
- Replace the `--` placeholders in Community Stats section with data from `useCommunityStats()`
- The `categories` prop can be kept as an override, but the default should come from the hook
- **Popular Tags** section (lines 176-191): These hardcoded tags should ideally come from `forumTags` table. Add a `usePopularTags()` hook or keep as static for now if tags data is not seeded.

---

### 10. [`NotificationsDropdown`](apps/forum/src/components/navbar/notifications-dropdown.tsx)

**Current state**: Has hardcoded [`mockNotifications`](apps/forum/src/components/navbar/notifications-dropdown.tsx:9) array.

**Changes**:
- Since there is no `notifications` table in the current schema, we have two options:
  1. Show an empty state: "No notifications yet" — remove the mock notifications entirely
  2. Leave this as a future feature
- **Chosen approach**: Remove `mockNotifications` and show the empty state. This is correct behavior since there are no real notifications to display.

---

### 11. [`RightSidebar`](apps/forum/src/components/layout/right-sidebar.tsx)

**Current state**: Composes the four widget components and passes no props.

**Changes**:
- No changes needed. After the individual widgets are updated to use hooks internally, the RightSidebar will automatically display real data.

---

## Component Dependency Order

Rewire components in this order to minimize breakage:
1. Individual widgets first (no dependencies): `LeaderboardWidget`, `CommunityStatsWidget`, `CampaignWidget`, `ActiveCampaignWidget`, `WhatsVibingWidget`
2. Card components: `DiscussionCard`
3. Feed components: `DiscussionFeed`
4. Layout components: `LeftSidebar`, `Sidebar`, `NotificationsDropdown`
5. No changes to `RightSidebar` needed
