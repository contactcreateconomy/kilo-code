# Forum Redesign - Detailed Implementation Tasks

This document breaks down the implementation plan into specific, actionable tasks for each phase.

---

## Phase 1: Global Styles Update

**File:** [`apps/forum/src/app/globals.css`](../apps/forum/src/app/globals.css)

### Tasks:
1. **Update CSS Variables to OKLCH color space**
   - Replace HSL-based `--primary: 239 84% 67%` with `--primary: oklch(0.585 0.233 264)`
   - Add all OKLCH color variables from reference design
   - Update dark mode variables to OKLCH

2. **Reduce border-radius**
   - Change `--radius: 1.3rem` to `--radius: 0.5rem`

3. **Remove dot grid background styles**
   - Remove `--dot-color`, `--dot-size`, `--dot-spacing` variables
   - Remove glow effect variables (or keep for optional use)

4. **Add animation keyframes**
   - Add `fadeInUp` keyframe animation
   - Add `fadeInRight` keyframe animation

---

## Phase 2: Navbar Redesign

**Files to modify:**
- [`apps/forum/src/components/navbar/glassmorphism-navbar.tsx`](../apps/forum/src/components/navbar/glassmorphism-navbar.tsx)

**New files to create:**
- `apps/forum/src/components/navbar/navbar.tsx`
- `apps/forum/src/components/navbar/search-bar.tsx`
- `apps/forum/src/components/navbar/notifications-button.tsx`
- `apps/forum/src/components/navbar/user-menu.tsx`

### Tasks:
1. **Create new simplified navbar component**
   - Use `sticky top-0 z-50` positioning
   - Use `bg-card/95 backdrop-blur` for glass effect
   - Remove gradient border bottom
   - Set `max-w-7xl` container width

2. **Replace logo**
   - Change from circular emoji (💬) to square icon with `MessageSquare` from Lucide
   - Change text from "Createconomy" to "Forum"
   - Use `h-9 w-9 rounded-lg bg-primary` for icon container

3. **Add mobile menu toggle**
   - Add hamburger/X toggle button (lg:hidden)
   - Position on left side of navbar
   - Toggle mobile sidebar visibility

4. **Simplify search bar**
   - Create new `search-bar.tsx` component
   - Use `bg-secondary` background
   - Add scale animation on focus
   - Center in navbar with `max-w-md`

5. **Update notifications button**
   - Create `notifications-button.tsx`
   - Use `Bell` icon from Lucide
   - Add red badge with count

6. **Update user menu**
   - Create `user-menu.tsx`
   - Use `Avatar` with ring effect
   - Add dropdown menu with profile options

7. **Remove theme toggle** (optional - can keep if desired)

---

## Phase 3: Left Sidebar Redesign

**File:** [`apps/forum/src/components/layout/left-sidebar.tsx`](../apps/forum/src/components/layout/left-sidebar.tsx)

### Tasks:
1. **Update container styling**
   - Add `rounded-lg border bg-card shadow-sm`
   - Keep `sticky top-24` positioning

2. **Update "Start Discussion" button**
   - Replace `GlowButton` with standard `Button`
   - Add `Plus` icon with rotate animation on hover
   - Use primary color styling

3. **Replace emoji icons with Lucide icons**
   - Programming: `Code` (blue-500)
   - Design: `Palette` (pink-500)
   - Startups: `Rocket` (orange-500)
   - AI & ML: `Brain` (violet-500)
   - Gaming: `Gamepad2` (green-500)
   - Learning: `BookOpen` (cyan-500)

4. **Add colored icon boxes**
   - Create 8x8 colored icon containers
   - Add scale and shadow on hover

5. **Consolidate category sections**
   - Merge "Discover" and "Premium" into single "Categories" section
   - Remove premium category distinction for now

6. **Add category count badges**
   - Show count in rounded badge
   - Change color when selected

7. **Add selection indicator**
   - Add left border indicator when category is selected
   - Use primary color

8. **Add "My Activity" section**
   - Add at bottom with border-top separator
   - Use `Activity` icon from Lucide

9. **Remove campaign card**
   - Move campaign widget to right sidebar only

---

## Phase 4: Discussion Feed & Cards Redesign

**Files to modify:**
- [`apps/forum/src/components/feed/discussion-feed.tsx`](../apps/forum/src/components/feed/discussion-feed.tsx)
- [`apps/forum/src/components/feed/discussion-card.tsx`](../apps/forum/src/components/feed/discussion-card.tsx)
- [`apps/forum/src/components/feed/feed-tabs.tsx`](../apps/forum/src/components/feed/feed-tabs.tsx)

**New files to create:**
- `apps/forum/src/components/feed/pagination.tsx`

### Tasks:

#### Feed Tabs:
1. **Reduce to 3 tabs**
   - Hot (Flame icon)
   - New (Clock icon)
   - Top (TrendingUp icon)

2. **Replace emoji icons with Lucide icons**
   - Remove 🏆, 🔥, 🆕, ⭐ emojis
   - Use Lucide `Flame`, `Clock`, `TrendingUp`

3. **Update tab styling**
   - Use `bg-muted` container
   - Use `bg-card shadow-sm` for active tab
   - Remove animated background

#### Discussion Card:
1. **Update container styling**
   - Use `rounded-lg border bg-card p-4 shadow-sm`
   - Add hover glow effect with radial gradient

2. **Move category badge to top-left**
   - Add colored background based on category
   - Add hover scale effect

3. **Reduce author avatar size**
   - Change from 40x40 to 24x24 (h-6 w-6)

4. **Add AI summary section**
   - Add `Sparkles` icon from Lucide
   - Use `bg-muted/50` background
   - Show summary text with line-clamp-2

5. **Update preview image**
   - Change from `h-48` fixed height to `aspect-video`
   - Add hover scale effect

6. **Update action buttons**
   - Replace ↑ with `ArrowBigUp` icon
   - Replace 💬 with `MessageCircle` icon
   - Replace ★/☆ with `Bookmark` icon
   - Remove participants/avatar stack

7. **Add hover glow effect**
   - Use radial gradient on hover
   - Track mouse position for effect

#### Pagination:
1. **Create pagination component**
   - Add page number buttons
   - Add prev/next buttons with `ChevronLeft`/`ChevronRight`
   - Add hover scale effects

2. **Remove "You've reached the end" message**

---

## Phase 5: Right Sidebar Redesign

**Files to modify:**
- [`apps/forum/src/components/layout/right-sidebar.tsx`](../apps/forum/src/components/layout/right-sidebar.tsx)
- [`apps/forum/src/components/widgets/leaderboard.tsx`](../apps/forum/src/components/widgets/leaderboard.tsx)

**New files to create:**
- `apps/forum/src/components/widgets/community-stats.tsx`

### Tasks:

#### Leaderboard:
1. **Expand to 10 users**
   - Add more mock users to leaderboard

2. **Replace emoji badges with Lucide icons**
   - Rank 1: `Crown` (yellow-500)
   - Rank 2: `Medal` (gray-400)
   - Rank 3: `Award` (amber-600)
   - Rank 4+: `#N` text

3. **Add Zap icon for points**
   - Use `Zap` icon next to points display

4. **Update styling**
   - Add `fadeInRight` animation
   - Add hover effects on user rows

5. **Remove trend indicators**
   - Remove up/down/stable trend arrows

#### Campaign Widget:
1. **Update styling to match reference**
   - Use gradient background
   - Add `Gift` icon
   - Update progress bar styling

2. **Add "Join Campaign" button**
   - Toggle between "Join Campaign" and "Joined" states

#### Community Stats:
1. **Create new widget**
   - 3-column grid layout
   - Members (Users icon): 24.5K
   - Discussions (FileText icon): 8.2K
   - Comments (MessageSquare icon): 156K

2. **Add hover effects**
   - Icon color change on hover
   - Background color change

#### Remove "What's Vibing" widget

---

## Phase 6: Layout Structure Update

**Files to modify:**
- [`apps/forum/src/components/layout/forum-layout.tsx`](../apps/forum/src/components/layout/forum-layout.tsx)
- [`apps/forum/src/app/page.tsx`](../apps/forum/src/app/page.tsx)
- [`apps/forum/src/app/layout.tsx`](../apps/forum/src/app/layout.tsx)

**New files to create:**
- `apps/forum/src/components/layout/mobile-sidebar.tsx`

### Tasks:

#### Layout:
1. **Update sidebar widths**
   - Left sidebar: `w-[250px]`
   - Right sidebar: `w-[300px]`

2. **Update sticky positioning**
   - Change from `top-20` to `top-24`

3. **Update container**
   - Use `max-w-7xl` instead of default container

#### Mobile Sidebar:
1. **Create mobile sidebar component**
   - Slide-in from left animation
   - Overlay background with opacity
   - Close on overlay click or Escape key

2. **Add mobile menu toggle in navbar**
   - Toggle sidebar visibility

#### Root Layout:
1. **Remove DotGridBackground wrapper**
   - Use solid background color instead

2. **Update navbar import**
   - Replace `GlassmorphismNavbar` with new `Navbar`

#### Homepage:
1. **Remove featured slider**
   - Remove `FeaturedSlider` component from homepage

2. **Update layout structure**
   - Match reference design layout

---

## Phase 7: Database Schema Extension

**Files to modify:**
- [`packages/convex/convex/schema.ts`](../packages/convex/convex/schema.ts)
- [`packages/convex/convex/functions/forum.ts`](../packages/convex/convex/functions/forum.ts)

### Tasks:

#### New Tables:
1. **Add forumReactions table**
   ```typescript
   forumReactions: defineTable({
     tenantId: v.optional(v.id("tenants")),
     userId: v.id("users"),
     targetType: v.union(v.literal("thread"), v.literal("post"), v.literal("comment")),
     targetId: v.string(),
     reactionType: v.union(v.literal("upvote"), v.literal("downvote"), v.literal("bookmark")),
     createdAt: v.number(),
   })
   ```

2. **Add forumTags table**
   ```typescript
   forumTags: defineTable({
     tenantId: v.optional(v.id("tenants")),
     name: v.string(),
     slug: v.string(),
     color: v.optional(v.string()),
     usageCount: v.number(),
     createdAt: v.number(),
   })
   ```

3. **Add forumThreadTags junction table**

4. **Add userPoints table**
   ```typescript
   userPoints: defineTable({
     userId: v.id("users"),
     tenantId: v.optional(v.id("tenants")),
     totalPoints: v.number(),
     weeklyPoints: v.number(),
     monthlyPoints: v.number(),
     level: v.number(),
     badges: v.array(v.string()),
     lastActivityAt: v.number(),
     createdAt: v.number(),
     updatedAt: v.number(),
   })
   ```

5. **Add forumCampaigns table**

#### Schema Modifications:
1. **Extend forumCategories**
   - Add `icon: v.string()` field
   - Add `color: v.string()` field

2. **Extend forumThreads**
   - Add `aiSummary: v.optional(v.string())`
   - Add `upvoteCount: v.number()`
   - Add `bookmarkCount: v.number()`
   - Add `imageUrl: v.optional(v.string())`

3. **Extend userProfiles**
   - Add `username: v.string()` field
   - Add `points: v.optional(v.number())` field

---

## Phase 8: Mock Data Generator

**New files to create:**
- `apps/forum/src/data/seed-data.ts`

### Tasks:
1. **Create user profiles data**
   - 10 users with realistic names, usernames, avatars, points

2. **Create categories data**
   - 6 categories with Lucide icon names and Tailwind colors

3. **Create discussions data**
   - 5+ discussions with AI summaries
   - Realistic upvote/comment counts
   - Timestamps spanning last 48 hours

4. **Create leaderboard data**
   - 10 users ranked by points

5. **Create campaign data**
   - Active campaign with progress

6. **Create community stats data**
   - Members, discussions, comments counts

---

## Phase 9: Database Seeding Script

**New files to create:**
- `packages/convex/convex/functions/seed.ts`
- `apps/forum/src/scripts/seed-database.ts`

### Tasks:
1. **Create idempotent seeding function**
   - Check if data already exists
   - Clear existing mock data before seeding

2. **Insert data in correct order**
   - Users first
   - Categories second
   - Threads/discussions third
   - Reactions/points last

3. **Add progress logging**

4. **Create CLI command for seeding**

---

## Phase 10: Backend API Connection

**Files to modify:**
- [`apps/forum/src/data/mock-data.ts`](../apps/forum/src/data/mock-data.ts)
- Various component files

### Tasks:
1. **Replace mock data imports with API calls**
   - Use Convex queries for data fetching

2. **Add loading states**
   - Show skeletons while loading

3. **Add error handling**
   - Show error messages on failure

4. **Implement real-time updates**
   - Use Convex subscriptions

5. **Add optimistic updates**
   - Update UI immediately on interactions

---

## Type Definitions Update

**File:** [`apps/forum/src/types/forum.ts`](../apps/forum/src/types/forum.ts)

### Tasks:
1. **Update Discussion interface**
   - Add `aiSummary: string`
   - Add `isUpvoted?: boolean`
   - Add `isBookmarked?: boolean`
   - Remove `participants: User[]`

2. **Update Category interface**
   - Change `icon: string` to Lucide icon name
   - Add `color: string` for Tailwind class

3. **Update LeaderboardEntry interface**
   - Add `badge: 'gold' | 'silver' | 'bronze'`
   - Remove `trend` field

4. **Update Campaign interface**
   - Add `targetPoints: number`
   - Add `participantCount: number`

5. **Add CommunityStats interface**

6. **Update FeedTabType**
   - Change from `'top' | 'hot' | 'new' | 'fav'` to `'hot' | 'new' | 'top'`

---

## Files to Remove/Deprecate

1. `apps/forum/src/components/navbar/glassmorphism-navbar.tsx` - Replace with new navbar
2. `apps/forum/src/components/navbar/animated-search.tsx` - Replace with simplified search
3. `apps/forum/src/components/feed/featured-slider.tsx` - Remove from homepage
4. `apps/forum/src/components/widgets/whats-vibing.tsx` - Remove entirely
5. `apps/forum/src/components/ui/dot-grid-background.tsx` - Remove entirely

---

## Verification Checklist

### Visual Parity
- [ ] Navbar matches reference exactly
- [ ] Left sidebar matches reference exactly
- [ ] Discussion cards match reference exactly
- [ ] Right sidebar matches reference exactly
- [ ] Color scheme matches reference
- [ ] Typography matches reference
- [ ] Spacing matches reference
- [ ] Hover states match reference
- [ ] Mobile layout matches reference

### Functionality
- [ ] Category selection works
- [ ] Tab switching works
- [ ] Upvote/bookmark interactions work
- [ ] Pagination works
- [ ] Mobile sidebar toggle works
- [ ] Search functionality works
- [ ] User dropdown works
- [ ] Notifications display works

### Data
- [ ] All mock data displays correctly
- [ ] Leaderboard shows 10 users
- [ ] Categories show correct counts
- [ ] Discussions show AI summaries
- [ ] Campaign progress displays correctly
- [ ] Community stats display correctly

---

*Document Version: 1.0*
*Created: 2026-02-02*
