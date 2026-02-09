# Phase 03 — Profile & Social Pages

Missing user profile sub-pages and social feature pages.

---

## 3.1 `/u/[username]/threads` — User Threads Page

**Severity**: 🟡 Medium — Tab exists on profile but links nowhere

**Current state**: The profile page at [`u/[username]/page.tsx`](../../apps/forum/src/app/u/[username]/page.tsx:208) has a "Threads" tab button that does nothing.

**What it needs**:
- Dedicated page or functional tab showing all threads by the user
- Pagination support
- Thread cards with category, vote count, post count, date

**Backend**: `getUserThreads` query already exists in [`forum.ts`](../../packages/convex/convex/functions/forum.ts:2094) — returns threads with category enrichment.

---

## 3.2 `/u/[username]/replies` — User Replies Page

**Severity**: 🟡 Medium — Tab exists on profile but links nowhere

**Current state**: The profile page has a "Replies" tab showing `profile.postCount` but no content.

**What it needs**:
- Dedicated page or functional tab showing all replies/posts by the user
- Each reply should link to the parent thread for context
- Pagination support

**Backend gap**: No `getUserReplies` or `getUserPosts` query exists. Needs a new query in [`forum.ts`](../../packages/convex/convex/functions/forum.ts) that:
- Queries `forumPosts` by `authorId` using the `by_author` index
- Filters out first posts (isFirstPost) to show only replies
- Enriches with thread title + category info

---

## 3.3 `/u/[username]/upvoted` — User Upvoted Content

**Severity**: 🟢 Low — Reddit-style feature, nice to have

**Current state**: Does NOT exist.

**What it needs**:
- List of threads the user has upvoted
- Privacy consideration: should this be public or self-only?

**Backend gap**: Would need a query joining `forumReactions` (where `userId = X` and `reactionType = "upvote"`) with `forumThreads`.

---

## 3.4 User Profile — Edit Profile Button for Own Profile

**Severity**: 🟡 Medium — UX gap

**Current state**: When viewing your own profile at `/u/[username]`, the follow button is correctly hidden (`isOwnProfile` check), but there is no "Edit Profile" button linking to `/account`.

**What it needs**:
- An "Edit Profile" button shown only when `isOwnProfile === true`
- Links to `/account` settings page

---

## 3.5 User Profile — Badges & Achievements Display

**Severity**: 🟢 Low — Enhancement for engagement

**Current state**: The profile shows role badge, stats, and reputation. No badges or achievements system.

**What it needs**:
- Badges section showing earned badges (e.g., "Early Adopter", "Top Contributor", "100 Posts")
- This is a future feature requiring backend schema additions

---

## 3.6 User Profile — Activity Graph / Heatmap

**Severity**: 🟢 Low — Enhancement

**Current state**: No activity visualization.

**What it needs**:
- GitHub-style contribution/activity heatmap
- Shows posting frequency over time
- Could be derived from thread + post creation dates

---

## Implementation Checklist

- [ ] Make profile tabs functional: Recent Activity, Threads, Replies
- [ ] Create backend `getUserReplies` query
- [ ] Add "Edit Profile" button on own profile linking to `/account`
- [ ] Optionally create `/u/[username]/upvoted` page
- [ ] Add badges section to profile (requires backend schema)
- [ ] Add activity visualization to profile (derived from existing data)
