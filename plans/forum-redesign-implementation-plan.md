# Forum Homepage Redesign - Comprehensive Implementation Plan

## Executive Summary

This document provides a detailed element-by-element comparison between the reference design (`discussion-forum-homepage`) and the existing forum application (`apps/forum`), along with a complete implementation plan to achieve pixel-perfect parity.

---

## Part 1: Design Comparison Analysis

### 1.1 Global Styling & CSS Variables

| Aspect | Reference Design | Current Implementation | Action Required |
|--------|------------------|----------------------|-----------------|
| **Color System** | OKLCH color space with purple/indigo primary (`oklch(0.585 0.233 264)`) | HSL color space with indigo primary (`239 84% 67%`) | Update to OKLCH color system |
| **Border Radius** | `--radius: 0.5rem` (8px) | `--radius: 1.3rem` (20.8px) | Reduce radius for cleaner look |
| **Font Family** | Geist Sans/Mono | Inter | Add Geist font or keep Inter |
| **Background** | Solid `oklch(0.985 0.002 285)` | Dot grid pattern overlay | Remove dot grid, use solid bg |
| **Dark Mode** | Full OKLCH dark theme | HSL-based dark theme | Update dark mode variables |

#### CSS Variables to Update:
```css
/* Reference Design Variables */
--background: oklch(0.985 0.002 285);
--foreground: oklch(0.145 0.015 285);
--card: oklch(1 0 0);
--primary: oklch(0.585 0.233 264);
--secondary: oklch(0.965 0.015 285);
--muted: oklch(0.955 0.01 285);
--border: oklch(0.91 0.015 285);
```

---

### 1.2 Navbar Component

| Element | Reference Design | Current Implementation | Differences |
|---------|------------------|----------------------|-------------|
| **Container** | `sticky top-0 z-50`, `h-16`, `max-w-7xl`, `bg-card/95 backdrop-blur` | `sticky top-0 z-50`, glassmorphism with gradient border | Remove gradient border, simplify glass effect |
| **Logo** | Square icon (9x9) with `MessageSquare` icon + "Forum" text | Circular emoji (💬) + "Createconomy" text | Change to square icon with Lucide icon |
| **Mobile Menu** | Hamburger/X toggle button (lg:hidden) | Similar but different styling | Update styling |
| **Search Bar** | Centered, `max-w-md`, `bg-secondary`, scale animation on focus | `AnimatedSearch` component with different styling | Simplify to match reference |
| **Notifications** | Bell icon with badge count (red dot with number) | `NotificationsDropdown` component | Simplify to icon + badge |
| **User Avatar** | 9x9 avatar with ring effect, dropdown menu | `ProfileDropdown` component | Update avatar styling |
| **Theme Toggle** | Not present in reference | Present | Remove or keep as optional |

#### Navbar Structure Comparison:

**Reference:**
```
[Mobile Menu] [Logo Icon + Text] --- [Search Bar] --- [Bell + Badge] [Avatar Dropdown]
```

**Current:**
```
[Logo + Text] --- [AnimatedSearch] --- [ThemeToggle] [Notifications] [Profile] [Mobile Menu]
```

---

### 1.3 Left Sidebar

| Element | Reference Design | Current Implementation | Differences |
|---------|------------------|----------------------|-------------|
| **Container** | `w-[250px]`, `sticky top-24`, `rounded-lg border bg-card shadow-sm` | `w-[220px] xl:w-[250px]`, `sticky top-20` | Add border and shadow |
| **New Discussion Button** | Primary button with `Plus` icon, rotate animation on hover | `GlowButton` with glow effect | Simplify to standard button |
| **Categories Section** | "Categories" header, 6 categories with colored icons | "Discover" + "Premium" sections with emoji icons | Restructure to single section |
| **Category Items** | Colored icon boxes (8x8), name, count badge, selection indicator | Emoji icons, simpler styling | Add colored icon boxes |
| **My Activity** | Bottom section with `Activity` icon | Not present | Add activity section |
| **Campaign Card** | Not in left sidebar | Present in left sidebar | Move to right sidebar |

#### Category Icons (Reference):
- Programming: `Code` (blue-500)
- Design: `Palette` (pink-500)
- Startups: `Rocket` (orange-500)
- AI & ML: `Brain` (violet-500)
- Gaming: `Gamepad2` (green-500)
- Learning: `BookOpen` (cyan-500)

#### Category Icons (Current):
- News: 📰
- Review: ⭐
- Compare: ⚖️
- List: 📋
- Help: ❓
- Showcase: ✨
- Tutorial: 📚

---

### 1.4 Discussion Feed

| Element | Reference Design | Current Implementation | Differences |
|---------|------------------|----------------------|-------------|
| **Tabs** | 3 tabs (Hot/New/Top) with icons, pill-style bg | 4 tabs (Top/Hot/New/Fav) with emojis, animated bg | Reduce to 3 tabs, use Lucide icons |
| **Tab Icons** | `Flame`, `Clock`, `TrendingUp` | 🏆, 🔥, 🆕, ⭐ | Switch to Lucide icons |
| **Featured Slider** | Not present | Present above feed | Remove featured slider |
| **Pagination** | Bottom pagination with page numbers | "You've reached the end" message | Add pagination component |

---

### 1.5 Discussion Card

| Element | Reference Design | Current Implementation | Differences |
|---------|------------------|----------------------|-------------|
| **Container** | `rounded-lg border bg-card p-4 shadow-sm`, hover glow effect | `GlowCard` with lift animation | Simplify hover effect |
| **Category Badge** | Top-left, colored badge with hover scale | Top-right, primary/10 bg | Move to top-left, add colors |
| **Title** | `text-lg font-bold`, hover color change | Similar | Keep similar |
| **Author Info** | Avatar (6x6) + name + @username + timestamp | Avatar (10x10) + name + @username + timestamp | Reduce avatar size |
| **AI Summary** | Sparkles icon + summary in muted bg box | Not present (uses `summary` field) | Add AI summary section |
| **Preview Image** | Optional, `aspect-video`, hover scale | Optional, `h-48` fixed height | Change to aspect-video |
| **Actions** | Upvote (ArrowBigUp), Comments (MessageCircle), Bookmark | Upvote (↑), Comments (💬), Participants (AvatarStack), Bookmark (★) | Update icons, remove participants |
| **Upvote Button** | `ArrowBigUp` icon with fill on active | Text arrow (↑) | Use Lucide icon |
| **Bookmark** | `Bookmark` icon with fill on active | Star (★/☆) | Use Bookmark icon |

#### Discussion Card Data Structure:

**Reference:**
```typescript
interface Discussion {
  id: number;
  title: string;
  category: string;
  categoryColor: string;
  author: { name, username, avatar };
  timestamp: string;
  aiSummary: string;
  upvotes: number;
  comments: number;
  image?: string;
  isBookmarked?: boolean;
  isUpvoted?: boolean;
}
```

**Current:**
```typescript
interface Discussion {
  id: string;
  title: string;
  summary: string;
  author: User;
  category: Category;
  upvotes: number;
  comments: number;
  participants: User[];
  createdAt: Date;
  imageUrl?: string;
  isPinned?: boolean;
}
```

---

### 1.6 Right Sidebar

| Element | Reference Design | Current Implementation | Differences |
|---------|------------------|----------------------|-------------|
| **Container** | `w-[300px]`, `sticky top-24` | `w-[280px] 2xl:w-[320px]`, `sticky top-20` | Adjust width |
| **Leaderboard** | Trophy icon, 10 users, rank badges (Crown/Medal/Award), points with Zap icon | 5 users, emoji badges (🥇🥈🥉), trend indicators | Expand to 10 users, use Lucide icons |
| **Campaign Widget** | Gradient bg, Gift icon, progress bar, "Join Campaign" button | Similar but different styling | Update styling to match |
| **Community Stats** | 3-column grid (Members/Discussions/Comments) | Not present | Add stats widget |
| **What's Vibing** | Not present | Present | Remove or repurpose |

#### Leaderboard Entry Structure:

**Reference:**
```typescript
interface LeaderboardEntry {
  rank: number;
  name: string;
  username: string;
  points: number;
  badge: 'gold' | 'silver' | 'bronze';
  avatar: string;
}
```

**Current:**
```typescript
interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  trend: 'up' | 'down' | 'stable';
}
```

---

### 1.7 Mobile Behavior

| Aspect | Reference Design | Current Implementation | Differences |
|--------|------------------|----------------------|-------------|
| **Mobile Sidebar** | Slide-in from left with overlay | Not implemented (hidden) | Add mobile sidebar |
| **Mobile Menu Toggle** | In navbar, toggles sidebar | Opens different menu | Update to toggle sidebar |
| **Bottom Navigation** | Not present | `MobileBottomNav` component | Remove or keep |

---

## Part 2: Database Schema Extensions

### 2.1 New Tables Required

#### Forum Reactions Table
```typescript
forumReactions: defineTable({
  tenantId: v.optional(v.id("tenants")),
  userId: v.id("users"),
  targetType: v.union(v.literal("thread"), v.literal("post"), v.literal("comment")),
  targetId: v.string(), // ID of thread/post/comment
  reactionType: v.union(v.literal("upvote"), v.literal("downvote"), v.literal("bookmark")),
  createdAt: v.number(),
})
  .index("by_user_target", ["userId", "targetType", "targetId"])
  .index("by_target", ["targetType", "targetId"])
```

#### Forum Tags Table
```typescript
forumTags: defineTable({
  tenantId: v.optional(v.id("tenants")),
  name: v.string(),
  slug: v.string(),
  color: v.optional(v.string()),
  usageCount: v.number(),
  createdAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_usage", ["usageCount"])
```

#### Thread Tags Junction Table
```typescript
forumThreadTags: defineTable({
  threadId: v.id("forumThreads"),
  tagId: v.id("forumTags"),
  createdAt: v.number(),
})
  .index("by_thread", ["threadId"])
  .index("by_tag", ["tagId"])
```

#### User Points/Gamification Table
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
  .index("by_user", ["userId"])
  .index("by_weekly_points", ["weeklyPoints"])
  .index("by_total_points", ["totalPoints"])
```

#### Campaigns Table
```typescript
forumCampaigns: defineTable({
  tenantId: v.optional(v.id("tenants")),
  title: v.string(),
  description: v.string(),
  prize: v.string(),
  startDate: v.number(),
  endDate: v.number(),
  targetPoints: v.number(),
  currentProgress: v.number(),
  participantCount: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_active", ["isActive"])
  .index("by_end_date", ["endDate"])
```

### 2.2 Schema Modifications

#### Extend forumCategories
```typescript
// Add fields:
icon: v.string(), // Lucide icon name
color: v.string(), // Tailwind color class
```

#### Extend forumThreads
```typescript
// Add fields:
aiSummary: v.optional(v.string()),
upvoteCount: v.number(),
bookmarkCount: v.number(),
imageUrl: v.optional(v.string()),
```

#### Extend userProfiles
```typescript
// Add fields:
username: v.string(), // Unique username
points: v.optional(v.number()),
```

---

## Part 3: Implementation Phases

### Phase 1: Global Styles Update
**Files to modify:**
- [`apps/forum/src/app/globals.css`](apps/forum/src/app/globals.css)

**Tasks:**
1. Update CSS variables to OKLCH color space
2. Reduce border-radius from 1.3rem to 0.5rem
3. Remove dot grid background styles
4. Update dark mode variables
5. Add new animation keyframes (fadeInUp, fadeInRight)

### Phase 2: Navbar Redesign
**Files to modify:**
- [`apps/forum/src/components/navbar/glassmorphism-navbar.tsx`](apps/forum/src/components/navbar/glassmorphism-navbar.tsx)

**New files to create:**
- `apps/forum/src/components/navbar/navbar.tsx`

**Tasks:**
1. Create new simplified navbar component
2. Replace emoji logo with Lucide MessageSquare icon
3. Simplify search bar (remove animations)
4. Update notification bell with badge
5. Update avatar dropdown styling
6. Add mobile menu toggle functionality

### Phase 3: Left Sidebar Redesign
**Files to modify:**
- [`apps/forum/src/components/layout/left-sidebar.tsx`](apps/forum/src/components/layout/left-sidebar.tsx)

**Tasks:**
1. Update "Start Discussion" button styling
2. Replace emoji icons with colored Lucide icons
3. Consolidate category sections
4. Add category count badges
5. Add selection indicator (left border)
6. Add "My Activity" section at bottom
7. Remove campaign card (move to right sidebar)

### Phase 4: Discussion Feed & Cards Redesign
**Files to modify:**
- [`apps/forum/src/components/feed/discussion-feed.tsx`](apps/forum/src/components/feed/discussion-feed.tsx)
- [`apps/forum/src/components/feed/discussion-card.tsx`](apps/forum/src/components/feed/discussion-card.tsx)
- [`apps/forum/src/components/feed/feed-tabs.tsx`](apps/forum/src/components/feed/feed-tabs.tsx)

**Tasks:**
1. Update feed tabs to 3 tabs with Lucide icons
2. Remove featured slider from homepage
3. Add pagination component
4. Redesign discussion card layout
5. Add AI summary section with Sparkles icon
6. Update action buttons (ArrowBigUp, MessageCircle, Bookmark)
7. Add hover glow effect
8. Update category badge positioning and colors

### Phase 5: Right Sidebar Redesign
**Files to modify:**
- [`apps/forum/src/components/layout/right-sidebar.tsx`](apps/forum/src/components/layout/right-sidebar.tsx)
- [`apps/forum/src/components/widgets/leaderboard.tsx`](apps/forum/src/components/widgets/leaderboard.tsx)

**New files to create:**
- `apps/forum/src/components/widgets/community-stats.tsx`

**Tasks:**
1. Expand leaderboard to 10 users
2. Replace emoji badges with Lucide icons (Crown, Medal, Award)
3. Add Zap icon for points display
4. Update campaign widget styling
5. Create community stats widget
6. Remove "What's Vibing" widget

### Phase 6: Layout Structure Update
**Files to modify:**
- [`apps/forum/src/components/layout/forum-layout.tsx`](apps/forum/src/components/layout/forum-layout.tsx)
- [`apps/forum/src/app/page.tsx`](apps/forum/src/app/page.tsx)
- [`apps/forum/src/app/layout.tsx`](apps/forum/src/app/layout.tsx)

**Tasks:**
1. Update layout widths (250px left, 300px right)
2. Add mobile sidebar overlay
3. Add mobile sidebar slide-in animation
4. Update sticky positioning (top-24)
5. Remove DotGridBackground wrapper
6. Update container max-width to 7xl

### Phase 7: Database Schema Extension
**Files to modify:**
- [`packages/convex/convex/schema.ts`](packages/convex/convex/schema.ts)
- [`packages/convex/convex/functions/forum.ts`](packages/convex/convex/functions/forum.ts)

**Tasks:**
1. Add forumReactions table
2. Add forumTags table
3. Add forumThreadTags table
4. Add userPoints table
5. Add forumCampaigns table
6. Extend existing tables with new fields
7. Create new API functions for reactions, tags, points

### Phase 8: Mock Data Generator
**New files to create:**
- `apps/forum/src/data/seed-data.ts`
- `apps/forum/src/scripts/generate-mock-data.ts`

**Tasks:**
1. Create user profiles with realistic data
2. Create categories with icons and colors
3. Create threads with AI summaries
4. Create posts and comments
5. Create reactions and bookmarks
6. Create leaderboard entries
7. Create active campaign data
8. Generate realistic timestamps

### Phase 9: Database Seeding Script
**New files to create:**
- `packages/convex/convex/functions/seed.ts`
- `apps/forum/src/scripts/seed-database.ts`

**Tasks:**
1. Create idempotent seeding function
2. Clear existing mock data before seeding
3. Insert data in correct relational order
4. Handle foreign key dependencies
5. Add progress logging
6. Create CLI command for seeding

### Phase 10: Backend API Connection
**Files to modify:**
- [`apps/forum/src/data/mock-data.ts`](apps/forum/src/data/mock-data.ts)
- Various component files

**Tasks:**
1. Replace mock data imports with API calls
2. Add loading states
3. Add error handling
4. Implement real-time updates
5. Add optimistic updates for interactions

---

## Part 4: Component Architecture

### 4.1 New Component Tree

```
apps/forum/src/
├── app/
│   ├── layout.tsx (updated)
│   ├── page.tsx (updated)
│   └── globals.css (updated)
├── components/
│   ├── layout/
│   │   ├── forum-layout.tsx (updated)
│   │   ├── left-sidebar.tsx (updated)
│   │   ├── right-sidebar.tsx (updated)
│   │   ├── mobile-sidebar.tsx (new)
│   │   └── footer.tsx (keep)
│   ├── navbar/
│   │   ├── navbar.tsx (new - replaces glassmorphism-navbar)
│   │   ├── search-bar.tsx (new - simplified)
│   │   ├── notifications-button.tsx (new)
│   │   └── user-menu.tsx (new)
│   ├── feed/
│   │   ├── discussion-feed.tsx (updated)
│   │   ├── discussion-card.tsx (updated)
│   │   ├── feed-tabs.tsx (updated)
│   │   └── pagination.tsx (new)
│   ├── widgets/
│   │   ├── leaderboard.tsx (updated)
│   │   ├── campaign-widget.tsx (updated)
│   │   └── community-stats.tsx (new)
│   └── ui/
│       ├── category-item.tsx (updated)
│       └── ... (existing)
├── data/
│   ├── mock-data.ts (updated)
│   └── seed-data.ts (new)
├── types/
│   └── forum.ts (updated)
└── scripts/
    └── seed-database.ts (new)
```

### 4.2 Type Definitions Update

```typescript
// apps/forum/src/types/forum.ts

export interface Discussion {
  id: string;
  title: string;
  aiSummary: string;
  author: User;
  category: Category;
  upvotes: number;
  comments: number;
  createdAt: Date;
  imageUrl?: string;
  isPinned?: boolean;
  isUpvoted?: boolean;
  isBookmarked?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  points?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  count: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  badge: 'gold' | 'silver' | 'bronze';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  prize: string;
  endDate: Date;
  progress: number;
  targetPoints: number;
  participantCount: number;
}

export interface CommunityStats {
  members: string;
  discussions: string;
  comments: string;
}

export type FeedTabType = 'hot' | 'new' | 'top';
```

---

## Part 5: Mock Data Specification

### 5.1 Users (10 users)

| Name | Username | Avatar | Points |
|------|----------|--------|--------|
| Sarah Chen | sarahchen | Unsplash photo | 12,450 |
| Alex Rivera | alexr | Unsplash photo | 11,230 |
| Emily Watson | emilyw | Unsplash photo | 10,890 |
| Marcus Johnson | marcusj | Unsplash photo | 9,750 |
| David Kim | davidk | Unsplash photo | 8,920 |
| Lisa Park | lisap | Unsplash photo | 7,650 |
| Tom Wilson | tomw | Unsplash photo | 6,540 |
| Nina Brown | ninab | Unsplash photo | 5,890 |
| James Lee | jamesl | Unsplash photo | 5,120 |
| Amy Zhang | amyz | Unsplash photo | 4,780 |

### 5.2 Categories (6 categories)

| Name | Slug | Icon | Color | Count |
|------|------|------|-------|-------|
| Programming | programming | Code | blue-500 | 1,234 |
| Design | design | Palette | pink-500 | 856 |
| Startups | startups | Rocket | orange-500 | 432 |
| AI & ML | ai-ml | Brain | violet-500 | 2,156 |
| Gaming | gaming | Gamepad2 | green-500 | 678 |
| Learning | learning | BookOpen | cyan-500 | 345 |

### 5.3 Discussions (5+ discussions)

Each discussion should have:
- Meaningful title (question or statement)
- AI-generated summary (2-3 sentences)
- Author from user list
- Category assignment
- Realistic upvote/comment counts
- Timestamps spanning last 48 hours
- Optional preview image

### 5.4 Community Stats

- Members: 24.5K
- Discussions: 8.2K
- Comments: 156K

### 5.5 Active Campaign

- Title: "Win Claude Pro!"
- Description: "Top contributors this month win 3 months of Claude Pro subscription."
- Progress: 2,450 / 5,000 pts (49%)

---

## Part 6: File Changes Summary

### Files to Create (New)
1. `apps/forum/src/components/navbar/navbar.tsx`
2. `apps/forum/src/components/navbar/search-bar.tsx`
3. `apps/forum/src/components/navbar/notifications-button.tsx`
4. `apps/forum/src/components/navbar/user-menu.tsx`
5. `apps/forum/src/components/layout/mobile-sidebar.tsx`
6. `apps/forum/src/components/feed/pagination.tsx`
7. `apps/forum/src/components/widgets/community-stats.tsx`
8. `apps/forum/src/data/seed-data.ts`
9. `apps/forum/src/scripts/seed-database.ts`
10. `packages/convex/convex/functions/seed.ts`

### Files to Modify (Update)
1. `apps/forum/src/app/globals.css`
2. `apps/forum/src/app/layout.tsx`
3. `apps/forum/src/app/page.tsx`
4. `apps/forum/src/components/layout/forum-layout.tsx`
5. `apps/forum/src/components/layout/left-sidebar.tsx`
6. `apps/forum/src/components/layout/right-sidebar.tsx`
7. `apps/forum/src/components/feed/discussion-feed.tsx`
8. `apps/forum/src/components/feed/discussion-card.tsx`
9. `apps/forum/src/components/feed/feed-tabs.tsx`
10. `apps/forum/src/components/widgets/leaderboard.tsx`
11. `apps/forum/src/components/widgets/campaign-card.tsx`
12. `apps/forum/src/components/ui/category-item.tsx`
13. `apps/forum/src/data/mock-data.ts`
14. `apps/forum/src/types/forum.ts`
15. `packages/convex/convex/schema.ts`
16. `packages/convex/convex/functions/forum.ts`

### Files to Remove/Deprecate
1. `apps/forum/src/components/navbar/glassmorphism-navbar.tsx` (replace)
2. `apps/forum/src/components/navbar/animated-search.tsx` (replace)
3. `apps/forum/src/components/feed/featured-slider.tsx` (remove from homepage)
4. `apps/forum/src/components/widgets/whats-vibing.tsx` (remove)
5. `apps/forum/src/components/ui/dot-grid-background.tsx` (remove)

---

## Part 7: Verification Checklist

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

### Backend
- [ ] Schema migrations applied
- [ ] Seed script runs successfully
- [ ] API endpoints return correct data
- [ ] Real-time updates work

---

## Appendix A: Color Mapping

| Reference (OKLCH) | Current (HSL) | Usage |
|-------------------|---------------|-------|
| `oklch(0.985 0.002 285)` | `hsl(0 0% 100%)` | Background |
| `oklch(0.145 0.015 285)` | `hsl(240 10% 4%)` | Foreground |
| `oklch(0.585 0.233 264)` | `hsl(239 84% 67%)` | Primary |
| `oklch(0.965 0.015 285)` | `hsl(240 5% 96%)` | Secondary |
| `oklch(0.91 0.015 285)` | `hsl(240 6% 90%)` | Border |

## Appendix B: Icon Mapping

| Reference Icon | Current Icon | Component |
|----------------|--------------|-----------|
| `MessageSquare` | 💬 | Logo |
| `Menu` / `X` | SVG hamburger | Mobile toggle |
| `Search` | Custom | Search bar |
| `Bell` | Custom | Notifications |
| `Code` | 📰 | Programming category |
| `Palette` | ⭐ | Design category |
| `Rocket` | ⚖️ | Startups category |
| `Brain` | 📋 | AI & ML category |
| `Gamepad2` | ❓ | Gaming category |
| `BookOpen` | ✨ | Learning category |
| `Flame` | 🔥 | Hot tab |
| `Clock` | 🆕 | New tab |
| `TrendingUp` | 🏆 | Top tab |
| `ArrowBigUp` | ↑ | Upvote |
| `MessageCircle` | 💬 | Comments |
| `Bookmark` | ★/☆ | Bookmark |
| `Sparkles` | N/A | AI Summary |
| `Trophy` | 🏆 | Leaderboard |
| `Crown` | 🥇 | Rank 1 |
| `Medal` | 🥈 | Rank 2 |
| `Award` | 🥉 | Rank 3 |
| `Zap` | N/A | Points |
| `Gift` | 🏆 | Campaign |
| `Users` | N/A | Members stat |
| `FileText` | N/A | Discussions stat |
| `Activity` | N/A | My Activity |

---

*Document Version: 1.0*
*Created: 2026-02-02*
*Last Updated: 2026-02-02*
