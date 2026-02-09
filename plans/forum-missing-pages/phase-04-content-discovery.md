# Phase 04 — Content & Discovery Pages

Missing pages for bookmarks/saved content, user-specific content views, and discovery features.

---

## 4.1 `/saved` or `/account/saved` — Bookmarked/Saved Threads Page

**Severity**: 🔴 High — Backend supports bookmarks, no UI to view them

**Current state**: The forum has a full bookmark system in the backend:
- `forumReactions` table supports `reactionType: "bookmark"` in the [schema](../../packages/convex/convex/schema.ts:656)
- [`toggleReaction`](../../packages/convex/convex/functions/forum.ts:1679) mutation handles bookmarking
- [`getUserReactions`](../../packages/convex/convex/functions/forum.ts:1811) query can check bookmark status
- Threads track `bookmarkCount`

But there is **NO page to view saved/bookmarked threads**.

**What it needs**:
- A page listing all threads the user has bookmarked
- Sorted by bookmark date (most recent first)
- Ability to remove bookmarks
- Empty state when no bookmarks

**Backend gap**: Need a `getBookmarkedThreads` query that:
- Queries `forumReactions` where `userId = currentUser`, `reactionType = "bookmark"`, `targetType = "thread"`
- Fetches and enriches the associated threads
- Supports pagination

**Navigation**: Should be added to:
- Account sidebar nav items
- Profile dropdown menu
- Left sidebar (under "My Activity" area)

---

## 4.2 `/t/[id]/edit` — Thread Edit Page

**Severity**: 🟡 Medium — Backend supports editing, no dedicated UI

**Current state**: The [`updateThread`](../../packages/convex/convex/functions/forum.ts:644) mutation exists and allows title editing. The [`updatePost`](../../packages/convex/convex/functions/forum.ts:922) mutation allows content editing. But there is no edit page or inline edit UI.

**What it needs**:
- Edit page that pre-fills the thread title and first post content
- Authorization check: only author or mod/admin can access
- Redirect to thread after save
- "Edit" button on thread detail page (currently missing)

---

## 4.3 `/leaderboard` — Community Leaderboard Page

**Severity**: 🟡 Medium — Backend exists, only shown as widget

**Current state**: The [`getLeaderboard`](../../packages/convex/convex/functions/forum.ts:1467) query exists with weekly/monthly/allTime support. The [`Leaderboard`](../../apps/forum/src/components/widgets/leaderboard.tsx) component exists as a sidebar widget. But there is no full-page leaderboard.

**What it needs**:
- Full-page leaderboard with period tabs: Weekly, Monthly, All Time
- More entries than the widget (e.g., top 50 instead of top 10)
- User avatars, rank badges, point breakdowns
- Link from the widget "View All" to this page

---

## 4.4 `/trending` — Trending Topics Full Page

**Severity**: 🟢 Low — Widget exists, full page is optional

**Current state**: [`getTrendingTopics`](../../packages/convex/convex/functions/forum.ts:1591) query exists. The [`WhatsVibing`](../../apps/forum/src/components/widgets/whats-vibing.tsx) widget shows trending. No full page.

**What it needs**:
- Full page showing trending discussions with more context
- Filtering by time period
- Category-based trending

---

## 4.5 `/tags` and `/tags/[name]` — Tags Browsing Pages

**Severity**: 🟡 Medium — Tags system exists, no browsing UI

**Current state**: Tags exist in the schema (`forumTags`, `forumThreadTags`). Components exist:
- [`TagBadge`](../../apps/forum/src/components/tags/tag-badge.tsx)
- [`TagInput`](../../apps/forum/src/components/tags/tag-input.tsx)
- [`PopularTagsWidget`](../../apps/forum/src/components/tags/popular-tags-widget.tsx)

But there are no pages for:
- Browsing all tags
- Viewing threads filtered by a specific tag

**What it needs**:
- `/tags` — All tags page with search, sorted by usage count
- `/tags/[name]` — Threads with a specific tag, with sort options

**Backend**: [`tags.ts`](../../packages/convex/convex/functions/tags.ts) functions exist for tag management.

---

## 4.6 `/polls/[id]` — Poll Results / Standalone Poll View

**Severity**: 🟢 Low — Polls are embedded in threads

**Current state**: Poll functionality exists:
- Thread creation supports `postType: "poll"` with poll options
- [`PollWidget`](../../apps/forum/src/components/post-types/poll-widget.tsx) component exists
- [`polls.ts`](../../packages/convex/convex/functions/polls.ts) has poll voting functions

A standalone poll page is not strictly needed since polls live within threads, but could be useful for sharing direct poll links.

---

## Implementation Checklist

- [ ] **HIGH PRIORITY**: Create `/account/saved` or `/saved` bookmarks page
- [ ] Create backend `getBookmarkedThreads` query
- [ ] Add "Saved" to profile dropdown, account sidebar, and left sidebar navigation
- [ ] Create `/t/[id]/edit` page for thread editing
- [ ] Add "Edit" button to thread detail page for authors/mods
- [ ] Create `/leaderboard` full-page view
- [ ] Add "View All" link from leaderboard widget to full page
- [ ] Create `/tags` and `/tags/[name]` pages for tag browsing
- [ ] Optionally create `/trending` full page
