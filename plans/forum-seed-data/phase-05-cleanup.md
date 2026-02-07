# Phase 5 — Cleanup and Verification

## Goal
Delete all mock data files, remove dead imports, and verify the entire forum application displays data exclusively from the Convex database as populated by the seed script.

## Step 1: Delete Mock Data File

Delete [`apps/forum/src/data/mock-data.ts`](apps/forum/src/data/mock-data.ts) entirely. This file should have zero imports pointing to it after Phases 3 and 4.

## Step 2: Delete Data Directory

If [`apps/forum/src/data/`](apps/forum/src/data/) has no other files, delete the entire directory.

## Step 3: Codebase-Wide Import Audit

Search the entire forum app for any remaining references to mock data:

```bash
grep -rn "mock-data\|mockData\|MOCK\|placeholder\|hardcoded\|simulated\|dummy" apps/forum/src/
```

Specific patterns to search for:
- `from '@/data/mock-data'` or `from '../data/mock-data'`
- `mockLeaderboard`, `mockCommunityStats`, `mockCampaign`, `mockCategories`, `mockDiscussions`, `mockFeaturedDiscussions`, `mockUsers`, `mockPremiumCategories`
- `mockParticipants`, `mockNotifications`
- `trendingTopics` (the hardcoded constant in whats-vibing.tsx)
- `defaultCategories` (the hardcoded constant in sidebar.tsx)
- Any inline `const categories = {` or `const threads = {` mock objects in pages

Each result must be either removed or replaced with a database query.

## Step 4: Verify No Hardcoded Data Remains

Audit each screen of the forum app to confirm it displays data from the database:

| Screen | Data Source | Verification |
|--------|-----------|--------------|
| Homepage feed | `listDiscussions` query | Discussions show seed thread titles, authors |
| Featured slider | Filtered from `listDiscussions` | Pinned threads appear in slider |
| Left sidebar | Static nav items OK; campaign card from `getActiveCampaign` | Campaign shows seed data |
| Right sidebar - Whats Vibing | `getTrendingTopics` query | Shows trending seed threads |
| Right sidebar - Leaderboard | `getLeaderboard` query | Shows ranked seed users by points |
| Right sidebar - Campaign | `getActiveCampaign` query | Shows seed campaign with progress |
| Right sidebar - Community Stats | `getCommunityStats` query | Shows correct counts from DB |
| Category page `/c/[slug]` | `getCategoryBySlug` + `listThreads` | Shows threads in that category |
| Thread page `/t/[id]` | `getThread` + posts | Shows thread content and replies |
| User profile `/u/[username]` | `getUserByUsername` | Shows user profile with stats |
| Notifications dropdown | Empty state (no notifications table) | Shows "No notifications yet" |
| Categories list `/c` | `listForumCategories` | Shows all 6 seed categories |

## Step 5: Remove Unused Types

Check [`apps/forum/src/types/forum.ts`](apps/forum/src/types/forum.ts) and [`apps/forum/src/types/index.ts`](apps/forum/src/types/index.ts) for types that were only used by mock data. These may need to be updated to match the shapes returned by Convex queries instead of the mock data shapes.

## Step 6: Run Type Checking

After all changes, run type checking on the forum app to ensure no broken imports or type mismatches:

```bash
pnpm --filter @createconomy/forum typecheck
```

Fix any TypeScript errors that arise.

## Step 7: Run the Seed Script

Execute the seed script to populate the development database:

```bash
cd packages/convex && npx convex run functions/seed:seedForum
```

## Step 8: Visual Verification

Launch the forum app and visually verify each screen:

```bash
pnpm --filter @createconomy/forum dev
```

Navigate through:
1. Homepage — feed shows 20 seed discussions
2. Category pages — each category shows its threads
3. Thread detail — shows content and replies
4. User profiles — shows stats derived from seed data
5. Leaderboard — shows users ranked by points
6. Community stats — shows correct aggregate counts
7. Whats Vibing — shows trending threads
8. Campaign widget — shows active campaign with progress

## Cleanup Checklist Summary

- [ ] Delete `apps/forum/src/data/mock-data.ts`
- [ ] Delete `apps/forum/src/data/` directory if empty
- [ ] Grep for all mock-related imports — zero results
- [ ] Grep for all hardcoded data patterns — zero results
- [ ] Type check passes with no errors
- [ ] Seed script runs successfully
- [ ] All 8 screens verified with real data
