# Phase 04 — Widgets (Leaderboard, Stats, Trending, Campaign)

**Files to modify**:
- [`apps/forum/src/components/widgets/leaderboard.tsx`](../../apps/forum/src/components/widgets/leaderboard.tsx)
- [`apps/forum/src/components/widgets/community-stats.tsx`](../../apps/forum/src/components/widgets/community-stats.tsx)
- [`apps/forum/src/components/widgets/whats-vibing.tsx`](../../apps/forum/src/components/widgets/whats-vibing.tsx)
- [`apps/forum/src/components/widgets/campaign-widget.tsx`](../../apps/forum/src/components/widgets/campaign-widget.tsx)
- [`apps/forum/src/components/widgets/active-campaign.tsx`](../../apps/forum/src/components/widgets/active-campaign.tsx)

## Changes

### 1. `leaderboard.tsx`

**Current**: Imports `mockLeaderboard` from `@/data/mock-data`, uses it as default prop value.

**Target**:
- Remove `mockLeaderboard` import
- Remove the `entries` prop default value
- Call `useLeaderboard()` hook internally
- Map the hook results to the existing rendering logic
- Show loading skeleton while `isLoading`
- Show empty state if no entries

```diff
- import { mockLeaderboard } from '@/data/mock-data';
- import type { LeaderboardEntry } from '@/types/forum';
+ import { useLeaderboard } from '@/hooks/use-leaderboard';

- export function LeaderboardWidget({
-   entries = mockLeaderboard,
-   maxEntries = 10,
- }: LeaderboardWidgetProps) {
+ export function LeaderboardWidget({ maxEntries = 10 }: { maxEntries?: number }) {
+   const { entries, isLoading } = useLeaderboard("weekly", maxEntries);
```

Handle nullable `avatarUrl` — use fallback to dicebear or initials:
```typescript
const avatarSrc = entry.user?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user?.username}`;
```

### 2. `community-stats.tsx`

**Current**: Imports `mockCommunityStats`, uses as default prop.

**Target**:
- Remove `mockCommunityStats` import
- Call `useCommunityStats()` hook internally
- Show loading skeleton while `isLoading`

```diff
- import { mockCommunityStats } from '@/data/mock-data';
+ import { useCommunityStats } from '@/hooks/use-community-stats';

- export function CommunityStatsWidget({ stats = mockCommunityStats }: CommunityStatsWidgetProps) {
+ export function CommunityStatsWidget() {
+   const { stats, isLoading } = useCommunityStats();
```

### 3. `whats-vibing.tsx`

**Current**: Has hardcoded `trendingTopics` array inline (lines 8-44).

**Target**:
- Remove the hardcoded `trendingTopics` constant
- Call `useTrending()` hook
- Map results to existing UI
- Show empty state if no trending topics

```diff
- const trendingTopics = [...]; // Remove this
+ import { useTrending } from '@/hooks/use-trending';

  export function WhatsVibingWidget({ className }: WhatsVibingWidgetProps) {
+   const { topics: trendingTopics, isLoading } = useTrending(5);
```

The `id` field from Convex is `_id` (a Convex ID string), which maps fine to the existing `topic.id`.

### 4. `campaign-widget.tsx`

**Current**: Imports `mockCampaign`, uses as default prop.

**Target**:
- Remove `mockCampaign` import
- Call `useActiveCampaign()` hook internally
- If no active campaign, render nothing (return null)
- Map campaign fields from Convex shape to UI

```diff
- import { mockCampaign } from '@/data/mock-data';
+ import { useActiveCampaign } from '@/hooks/use-campaign';

- export function CampaignWidget({ campaign = mockCampaign }: CampaignWidgetProps) {
+ export function CampaignWidget() {
+   const { campaign, isLoading } = useActiveCampaign();
+   if (isLoading) return <CampaignSkeleton />;
+   if (!campaign) return null;
```

The Convex `getActiveCampaign` returns:
```typescript
{
  id: string;
  title: string;
  description: string;
  prize: string;
  endDate: number; // epoch ms — needs conversion to Date
  progress: number;
  targetPoints: number;
  participantCount: number;
}
```

The existing UI expects `campaign.endDate` as `Date` and `campaign.progress` as number. The Convex version returns `endDate` as epoch ms. Need to convert: `new Date(campaign.endDate)`.

### 5. `active-campaign.tsx`

Same treatment as `campaign-widget.tsx`:
- Remove `mockCampaign` import
- Call `useActiveCampaign()` hook
- Convert `endDate` from epoch ms to Date for countdown calculation
- Return null if no active campaign

### 6. `right-sidebar.tsx` — No changes needed

[`right-sidebar.tsx`](../../apps/forum/src/components/layout/right-sidebar.tsx) just composes the widgets — it doesn't import mock data directly. Once the widgets are updated, the sidebar works automatically.

## Loading States

Each widget should show a simple skeleton while loading. Pattern:

```tsx
if (isLoading) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## Empty States

If no data exists yet (new database), widgets should show a friendly empty state:

```tsx
if (entries.length === 0) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground">No data yet. Start contributing!</p>
      </CardContent>
    </Card>
  );
}
```
