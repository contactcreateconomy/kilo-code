# Phase 6: Right Sidebar

## Overview
Implement the right sidebar widgets: What's Vibing, Leaderboard, and Active Campaign.

## Current Status: NOT STARTED

## Prerequisites
- Phase 1-5 completed

## Design Reference

```
┌─────────────────────────────┐
│  🔥 What's Vibing           │
│  ┌───────────────────────┐  │
│  │  [Morphing Card Stack] │  │
│  │  Topic 1 → Topic 2     │  │
│  │  Auto-rotate 4s        │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  🏆 Weekly Top Creators     │
│                             │
│  1. 🥇 Alex Chen    2,450   │
│     ↑ trending up           │
│  2. 🥈 Sarah Kim    1,890   │
│     → stable                │
│  3. 🥉 Mike Johnson 1,650   │
│     ↓ trending down         │
│                             │
│  [View Full Leaderboard →]  │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ 🎯 Active Campaign    │  │
│  │                       │  │
│  │ Best Product Review   │  │
│  │ Win $500!             │  │
│  │                       │  │
│  │ ████████░░ 65%        │  │
│  │ 234 participants      │  │
│  │ 7 days left           │  │
│  │                       │  │
│  │ [Enter Now ✨]        │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## Tasks

### 6.1 Create WhatsVibingWidget Component
**File:** `apps/forum/src/components/widgets/whats-vibing.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { TrendingTopic } from '@/types/forum';

interface WhatsVibingWidgetProps {
  topics: TrendingTopic[];
  autoRotateInterval?: number;
}

export function WhatsVibingWidget({ 
  topics, 
  autoRotateInterval = 4000 
}: WhatsVibingWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (topics.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topics.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [topics.length, autoRotateInterval]);

  const currentTopic = topics[currentIndex];

  const trendColors = {
    rising: 'text-green-500',
    hot: 'text-orange-500',
    new: 'text-blue-500',
  };

  const trendIcons = {
    rising: '📈',
    hot: '🔥',
    new: '✨',
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>🔥</span>
          What&apos;s Vibing
        </h3>
        <div className="flex gap-1">
          {topics.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                index === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>

      <div className="relative h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTopic.id}
            initial={{ opacity: 0, y: 20, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, rotateX: 15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Link href={`/search?q=${encodeURIComponent(currentTopic.title)}`}>
              <div className="h-full rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 hover:from-primary/20 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('text-sm', trendColors[currentTopic.trend])}>
                    {trendIcons[currentTopic.trend]}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {currentTopic.trend}
                  </span>
                </div>
                
                <h4 className="font-medium text-sm mb-2 line-clamp-2">
                  {currentTopic.title}
                </h4>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{currentTopic.category}</span>
                  <span>{currentTopic.engagement} engaged</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### 6.2 Create LeaderboardWidget Component
**File:** `apps/forum/src/components/widgets/leaderboard.tsx`

```typescript
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/forum';

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[];
}

const rankBadges = ['🥇', '🥈', '🥉'];

const trendIcons = {
  up: { icon: '↑', color: 'text-green-500' },
  down: { icon: '↓', color: 'text-red-500' },
  stable: { icon: '→', color: 'text-muted-foreground' },
};

export function LeaderboardWidget({ entries }: LeaderboardWidgetProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>🏆</span>
          Weekly Top Creators
        </h3>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/u/${entry.user.username}`}>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group">
                {/* Rank Badge */}
                <span className="text-xl w-8 text-center">
                  {rankBadges[entry.rank - 1] || entry.rank}
                </span>

                {/* Avatar */}
                <img
                  src={entry.user.avatarUrl}
                  alt={entry.user.name}
                  className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-primary/50 transition-colors"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{entry.user.name}</p>
                  <p className="text-xs text-muted-foreground">@{entry.user.username}</p>
                </div>

                {/* Points & Trend */}
                <div className="text-right">
                  <p className="font-bold text-sm">{entry.points.toLocaleString()}</p>
                  <p className={cn('text-xs flex items-center justify-end gap-1', trendIcons[entry.trend].color)}>
                    <span>{trendIcons[entry.trend].icon}</span>
                    <span>{entry.trend}</span>
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link
        href="/leaderboard"
        className="block mt-4 text-center text-sm text-primary hover:underline"
      >
        View Full Leaderboard →
      </Link>
    </div>
  );
}
```

### 6.3 Create ActiveCampaignWidget Component
**File:** `apps/forum/src/components/widgets/active-campaign.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { GlowButton } from '@/components/ui/glow-button';
import type { Campaign } from '@/types/forum';

interface ActiveCampaignWidgetProps {
  campaign: Campaign;
}

export function ActiveCampaignWidget({ campaign }: ActiveCampaignWidgetProps) {
  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-purple-500/10" />
      
      {/* Animated Glow */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Active Campaign
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>

        {/* Prize */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-primary">{campaign.prize}</span>
          <span className="text-sm text-muted-foreground">prize pool</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-2xl font-bold">{campaign.totalParticipants}</p>
            <p className="text-xs text-muted-foreground">participants</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <p className="text-2xl font-bold">{daysLeft}</p>
            <p className="text-xs text-muted-foreground">days left</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{campaign.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${campaign.progress}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <GlowButton className="w-full" size="lg">
          Enter Now ✨
        </GlowButton>
      </div>
    </motion.div>
  );
}
```

### 6.4 Create Widgets Index Export
**File:** `apps/forum/src/components/widgets/index.ts`

```typescript
export { WhatsVibingWidget } from './whats-vibing';
export { LeaderboardWidget } from './leaderboard';
export { ActiveCampaignWidget } from './active-campaign';
export { CampaignCard } from './campaign-card';
```

### 6.5 Update RightSidebar Component
**File:** `apps/forum/src/components/layout/right-sidebar.tsx`

```typescript
'use client';

import { WhatsVibingWidget } from '@/components/widgets/whats-vibing';
import { LeaderboardWidget } from '@/components/widgets/leaderboard';
import { ActiveCampaignWidget } from '@/components/widgets/active-campaign';
import { mockTrendingTopics, mockLeaderboard, mockCampaign } from '@/data/mock-data';

export function RightSidebar() {
  return (
    <div className="space-y-6">
      {/* What's Vibing */}
      <WhatsVibingWidget topics={mockTrendingTopics} />

      {/* Leaderboard */}
      <LeaderboardWidget entries={mockLeaderboard} />

      {/* Active Campaign */}
      <ActiveCampaignWidget campaign={mockCampaign} />
    </div>
  );
}
```

## File Structure After Phase 6

```
apps/forum/src/components/
├── widgets/
│   ├── index.ts                ✅ NEW
│   ├── whats-vibing.tsx        ✅ NEW
│   ├── leaderboard.tsx         ✅ NEW
│   ├── active-campaign.tsx     ✅ NEW
│   └── campaign-card.tsx       (from Phase 4)
├── layout/
│   └── right-sidebar.tsx       ✅ UPDATED
```

## Verification Checklist
- [ ] What's Vibing auto-rotates every 4 seconds
- [ ] Card morphing animation is smooth
- [ ] Dot indicators show current topic
- [ ] Clicking dots changes topic
- [ ] Leaderboard shows top 3 with rank badges
- [ ] Trend indicators show correct colors
- [ ] User avatars have hover effect
- [ ] Campaign widget has animated glow
- [ ] Progress bar animates on load
- [ ] Enter Now button has glow effect
- [ ] All widgets are responsive

## Next Phase
After completing Phase 6, proceed to [Phase 7: Animations & Polish](./phase-7-animations.md)
