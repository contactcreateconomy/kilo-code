# Phase 4: Left Sidebar

## Overview
Implement the left sidebar with categories, start discussion button, and campaign card.

## Current Status: NOT STARTED

## Prerequisites
- Phase 1-3 completed

## Design Reference

```
┌─────────────────────────┐
│  [+ Start Discussion]   │  ← Primary button with glow
├─────────────────────────┤
│  DISCOVER               │
│  📰 News          (12)  │
│  ⭐ Review        (45)  │
│  ⚖️ Compare       (8)   │
│  📋 List          (23)  │
│  ❓ Help          (67)  │
│  ✨ Showcase      (34)  │
│  📚 Tutorial      (19)  │
├─────────────────────────┤
│  PREMIUM                │
│  🎭 Debate   🔒 500pts  │
│  🚀 Launch   🔒 1000pts │
├─────────────────────────┤
│  ┌─────────────────┐    │
│  │ Active Campaign │    │
│  │ Win $500!       │    │
│  │ [Enter Now]     │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

## Tasks

### 4.1 Create GlowButton Component
**File:** `apps/forum/src/components/ui/glow-button.tsx`

```typescript
'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = true, children, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glow && variant === 'primary' && 'shadow-glow hover:shadow-glow-strong',
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

GlowButton.displayName = 'GlowButton';
```

### 4.2 Create CategoryItem Component
**File:** `apps/forum/src/components/ui/category-item.tsx`

```typescript
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/forum';

interface CategoryItemProps {
  category: Category;
  isActive?: boolean;
}

export function CategoryItem({ category, isActive }: CategoryItemProps) {
  return (
    <Link href={`/c/${category.slug}`}>
      <motion.div
        className={cn(
          'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all',
          'hover:bg-accent group',
          isActive && 'bg-primary/10 border-l-2 border-primary'
        )}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{category.icon}</span>
          <span className={cn(
            'text-sm font-medium',
            isActive ? 'text-primary' : 'text-foreground'
          )}>
            {category.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {category.isPremium && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              🔒 {category.pointsRequired}pts
            </span>
          )}
          {!category.isPremium && category.count > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {category.count}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
```

### 4.3 Create CampaignCard Component
**File:** `apps/forum/src/components/widgets/campaign-card.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { GlowButton } from '@/components/ui/glow-button';
import type { Campaign } from '@/types/forum';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🏆</span>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Active Campaign
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-1">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
        
        {/* Prize */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-primary">{campaign.prize}</span>
        </div>
        
        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{campaign.totalParticipants} participants</span>
            <span>{daysLeft} days left</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${campaign.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
        
        <GlowButton className="w-full" size="sm">
          Enter Now
        </GlowButton>
      </div>
    </motion.div>
  );
}
```

### 4.4 Create Mock Data
**File:** `apps/forum/src/data/mock-data.ts`

```typescript
import type { Category, Campaign, User, Discussion, LeaderboardEntry, TrendingTopic } from '@/types/forum';

export const mockCategories: Category[] = [
  { id: '1', name: 'News', slug: 'news', icon: '📰', count: 12 },
  { id: '2', name: 'Review', slug: 'review', icon: '⭐', count: 45 },
  { id: '3', name: 'Compare', slug: 'compare', icon: '⚖️', count: 8 },
  { id: '4', name: 'List', slug: 'list', icon: '📋', count: 23 },
  { id: '5', name: 'Help', slug: 'help', icon: '❓', count: 67 },
  { id: '6', name: 'Showcase', slug: 'showcase', icon: '✨', count: 34 },
  { id: '7', name: 'Tutorial', slug: 'tutorial', icon: '📚', count: 19 },
];

export const mockPremiumCategories: Category[] = [
  { id: '8', name: 'Debate', slug: 'debate', icon: '🎭', count: 0, isPremium: true, pointsRequired: 500 },
  { id: '9', name: 'Launch', slug: 'launch', icon: '🚀', count: 0, isPremium: true, pointsRequired: 1000 },
];

export const mockCampaign: Campaign = {
  id: '1',
  title: 'Best Product Review',
  description: 'Write the most helpful product review and win!',
  prize: '$500',
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  progress: 65,
  totalParticipants: 234,
};

export const mockUsers: User[] = [
  { id: '1', name: 'Alex Chen', username: 'alexchen', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', points: 2450 },
  { id: '2', name: 'Sarah Kim', username: 'sarahk', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', points: 1890 },
  { id: '3', name: 'Mike Johnson', username: 'mikej', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', points: 1650 },
  { id: '4', name: 'Emma Wilson', username: 'emmaw', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', points: 1420 },
  { id: '5', name: 'David Lee', username: 'davidl', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', points: 1200 },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user: mockUsers[0], points: 2450, trend: 'up' },
  { rank: 2, user: mockUsers[1], points: 1890, trend: 'stable' },
  { rank: 3, user: mockUsers[2], points: 1650, trend: 'down' },
];

export const mockTrendingTopics: TrendingTopic[] = [
  { id: '1', title: 'AI Tools for Creators', category: 'News', engagement: 89, trend: 'hot' },
  { id: '2', title: 'Best Design Resources 2024', category: 'List', engagement: 76, trend: 'rising' },
  { id: '3', title: 'Figma vs Sketch Comparison', category: 'Compare', engagement: 54, trend: 'new' },
];
```

### 4.5 Update LeftSidebar Component
**File:** `apps/forum/src/components/layout/left-sidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlowButton } from '@/components/ui/glow-button';
import { CategoryItem } from '@/components/ui/category-item';
import { CampaignCard } from '@/components/widgets/campaign-card';
import { mockCategories, mockPremiumCategories, mockCampaign } from '@/data/mock-data';

export function LeftSidebar() {
  const pathname = usePathname();
  const currentCategory = pathname.startsWith('/c/') ? pathname.split('/')[2] : null;

  return (
    <div className="space-y-6">
      {/* Start Discussion Button */}
      <Link href="/t/new">
        <GlowButton className="w-full" size="lg">
          <span className="mr-2">+</span>
          Start Discussion
        </GlowButton>
      </Link>

      {/* Discover Categories */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Discover
        </h3>
        <nav className="space-y-1">
          {mockCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isActive={currentCategory === category.slug}
            />
          ))}
        </nav>
      </div>

      {/* Premium Categories */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Premium
        </h3>
        <nav className="space-y-1">
          {mockPremiumCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isActive={currentCategory === category.slug}
            />
          ))}
        </nav>
      </div>

      {/* Active Campaign */}
      <CampaignCard campaign={mockCampaign} />
    </div>
  );
}
```

## File Structure After Phase 4

```
apps/forum/src/
├── components/
│   ├── layout/
│   │   └── left-sidebar.tsx    ✅ UPDATED
│   ├── ui/
│   │   ├── glow-button.tsx     ✅ NEW
│   │   └── category-item.tsx   ✅ NEW
│   └── widgets/
│       └── campaign-card.tsx   ✅ NEW
├── data/
│   └── mock-data.ts            ✅ NEW
```

## Verification Checklist
- [ ] Start Discussion button has glow effect
- [ ] Button scales on hover/tap
- [ ] Categories display with icons and counts
- [ ] Active category has left border accent
- [ ] Premium categories show lock icon and points
- [ ] Category items slide right on hover
- [ ] Campaign card has gradient background
- [ ] Progress bar animates on load
- [ ] Enter Now button has glow effect

## Next Phase
After completing Phase 4, proceed to [Phase 5: Center Feed](./phase-5-center-feed.md)
