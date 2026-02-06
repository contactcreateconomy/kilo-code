# Phase 5: Center Feed

## Overview
Implement the center feed with featured slider, feed tabs, discussion cards, avatar stack, and infinite scroll.

## Current Status: NOT STARTED

## Prerequisites
- Phase 1-4 completed

## Design Reference

```
┌────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────┐  │
│  │         Featured Slider (280px)          │  │
│  │  ◄  [Card 1] [Card 2] [Card 3] [Card 4]  ►  │
│  │              ● ○ ○ ○                     │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [Top 🔥] [Hot 🔥] [New 🆕] [Fav ⭐]          │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ ● Avatar | Username | @handle | 2h ago   │  │
│  │                                          │  │
│  │ Title of Discussion (20px, bold)         │  │
│  │ AI one-liner summary (14px, muted)       │  │
│  │                                          │  │
│  │ [Preview image - optional]               │  │
│  │                                          │  │
│  │ ↑342  💬89  👥[avatars]  ⭐  ⋮           │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [Loading more...]                             │
└────────────────────────────────────────────────┘
```

## Tasks

### 5.1 Create FeaturedSlider Component
**File:** `apps/forum/src/components/feed/featured-slider.tsx`

```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Discussion } from '@/types/forum';

interface FeaturedSliderProps {
  discussions: Discussion[];
}

export function FeaturedSlider({ discussions }: FeaturedSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {discussions.map((discussion, index) => (
            <div
              key={discussion.id}
              className="flex-[0_0_100%] min-w-0 pl-4 first:pl-0"
            >
              <motion.div
                className="relative h-[280px] rounded-2xl overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: discussion.imageUrl
                      ? `url(${discussion.imageUrl})`
                      : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.5) 100%)',
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary/20 text-primary-foreground text-xs rounded-full backdrop-blur-sm">
                      {discussion.category.icon} {discussion.category.name}
                    </span>
                    {discussion.isPinned && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full backdrop-blur-sm">
                        📌 Featured
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {discussion.title}
                  </h3>
                  
                  <p className="text-sm text-white/70 line-clamp-2 mb-3">
                    {discussion.summary}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>↑ {discussion.upvotes}</span>
                    <span>💬 {discussion.comments}</span>
                    <span>by @{discussion.author.username}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        ←
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        →
      </button>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {discussions.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === selectedIndex
                ? 'bg-primary w-6'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
          />
        ))}
      </div>
    </div>
  );
}
```

### 5.2 Create FeedTabs Component
**File:** `apps/forum/src/components/feed/feed-tabs.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type TabType = 'top' | 'hot' | 'new' | 'fav';

interface FeedTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'top', label: 'Top', icon: '🏆' },
  { id: 'hot', label: 'Hot', icon: '🔥' },
  { id: 'new', label: 'New', icon: '🆕' },
  { id: 'fav', label: 'Favorites', icon: '⭐' },
];

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === tab.id
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-lg shadow-glow-sm"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
```

### 5.3 Create AvatarStack Component
**File:** `apps/forum/src/components/feed/avatar-stack.tsx`

```typescript
'use client';

import { cn } from '@/lib/utils';
import type { User } from '@/types/forum';

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarStack({ users, max = 5, size = 'sm' }: AvatarStackProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <img
            key={user.id}
            src={user.avatarUrl}
            alt={user.name}
            className={cn(
              'rounded-full border-2 border-background',
              sizeClasses[size]
            )}
            style={{ zIndex: displayUsers.length - index }}
            title={user.name}
          />
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              'rounded-full border-2 border-background bg-muted flex items-center justify-center font-medium text-muted-foreground',
              sizeClasses[size]
            )}
            style={{ zIndex: 0 }}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5.4 Create GlowCard Component
**File:** `apps/forum/src/components/ui/glow-card.tsx`

```typescript
'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, children, hover = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-xl border bg-card p-4 transition-all duration-200',
          hover && 'hover:border-primary/50 hover:shadow-glow-sm',
          className
        )}
        whileHover={hover ? { y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlowCard.displayName = 'GlowCard';
```

### 5.5 Create DiscussionCard Component
**File:** `apps/forum/src/components/feed/discussion-card.tsx`

```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { AvatarStack } from './avatar-stack';
import { cn } from '@/lib/utils';
import type { Discussion } from '@/types/forum';

interface DiscussionCardProps {
  discussion: Discussion;
}

export function DiscussionCard({ discussion }: DiscussionCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(discussion.upvotes);
  const [bookmarked, setBookmarked] = useState(false);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    setUpvoted(!upvoted);
    setUpvotes(upvoted ? upvotes - 1 : upvotes + 1);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setBookmarked(!bookmarked);
  };

  const timeAgo = getTimeAgo(discussion.createdAt);

  return (
    <Link href={`/t/${discussion.id}`}>
      <GlowCard className="group">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={discussion.author.avatarUrl}
            alt={discussion.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{discussion.author.name}</span>
              <span className="text-muted-foreground text-sm">@{discussion.author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>
          </div>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {discussion.category.icon} {discussion.category.name}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {discussion.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {discussion.summary}
        </p>

        {/* Optional Image */}
        {discussion.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={discussion.imageUrl}
              alt=""
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            {/* Upvote */}
            <motion.button
              onClick={handleUpvote}
              className={cn(
                'flex items-center gap-1 text-sm transition-colors',
                upvoted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              whileTap={{ scale: 1.2 }}
            >
              <motion.span
                animate={upvoted ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                ↑
              </motion.span>
              <span>{upvotes}</span>
            </motion.button>

            {/* Comments */}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              💬 {discussion.comments}
            </span>

            {/* Participants */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">👥</span>
              <AvatarStack users={discussion.participants} max={4} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <motion.button
              onClick={handleBookmark}
              className={cn(
                'p-1 rounded transition-colors',
                bookmarked ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'
              )}
              whileTap={{ scale: 1.2 }}
            >
              {bookmarked ? '★' : '☆'}
            </motion.button>

            {/* More Options */}
            <button className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
              ⋮
            </button>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}
```

### 5.6 Create useInfiniteScroll Hook
**File:** `apps/forum/src/hooks/use-infinite-scroll.ts`

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const newItems = await fetchMore();
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, isLoading, hasMore]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, threshold, rootMargin]);

  return {
    items,
    setItems,
    isLoading,
    hasMore,
    loadMoreRef,
  };
}
```

### 5.7 Create DiscussionFeed Component
**File:** `apps/forum/src/components/feed/discussion-feed.tsx`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiscussionCard } from './discussion-card';
import { FeedTabs } from './feed-tabs';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Skeleton } from '@createconomy/ui';
import type { Discussion } from '@/types/forum';

// Mock fetch function - replace with actual API call
const fetchDiscussions = async (tab: string, page: number): Promise<Discussion[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Return mock data or empty array for end of list
  if (page > 3) return [];
  
  // Import mock data
  const { mockDiscussions } = await import('@/data/mock-data');
  return mockDiscussions;
};

interface DiscussionFeedProps {
  initialDiscussions?: Discussion[];
}

export function DiscussionFeed({ initialDiscussions = [] }: DiscussionFeedProps) {
  const [activeTab, setActiveTab] = useState<'top' | 'hot' | 'new' | 'fav'>('top');
  const [page, setPage] = useState(1);

  const fetchMore = useCallback(async () => {
    const newDiscussions = await fetchDiscussions(activeTab, page);
    setPage((p) => p + 1);
    return newDiscussions;
  }, [activeTab, page]);

  const { items, isLoading, hasMore, loadMoreRef, setItems } = useInfiniteScroll<Discussion>(fetchMore);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setItems([]);
    setPage(1);
  };

  const discussions = items.length > 0 ? items : initialDiscussions;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Discussion List */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {discussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <DiscussionCard discussion={discussion} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && <div ref={loadMoreRef} className="h-10" />}

      {/* End of List */}
      {!hasMore && discussions.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          You have reached the end 🎉
        </p>
      )}
    </div>
  );
}
```

### 5.8 Add Mock Discussions to Data File
**File:** `apps/forum/src/data/mock-data.ts` (append)

```typescript
export const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'Best AI Tools for Content Creators in 2024',
    summary: 'A comprehensive guide to the most useful AI tools that can help content creators streamline their workflow and boost productivity.',
    author: mockUsers[0],
    category: mockCategories[0],
    upvotes: 342,
    comments: 89,
    participants: mockUsers.slice(0, 5),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    isPinned: true,
  },
  {
    id: '2',
    title: 'How I Built a $10k/month Digital Product Business',
    summary: 'Sharing my journey from zero to $10k monthly revenue selling digital products. Tips, strategies, and lessons learned.',
    author: mockUsers[1],
    category: mockCategories[5],
    upvotes: 256,
    comments: 67,
    participants: mockUsers.slice(1, 4),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Figma vs Sketch vs Adobe XD - Which One Should You Choose?',
    summary: 'An in-depth comparison of the three most popular design tools. Pros, cons, and use cases for each.',
    author: mockUsers[2],
    category: mockCategories[2],
    upvotes: 189,
    comments: 45,
    participants: mockUsers.slice(2, 5),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
  },
  // Add more mock discussions as needed
];

export const mockFeaturedDiscussions = mockDiscussions.filter(d => d.isPinned || d.upvotes > 200);
```

### 5.9 Create Feed Index Export
**File:** `apps/forum/src/components/feed/index.ts`

```typescript
export { FeaturedSlider } from './featured-slider';
export { FeedTabs } from './feed-tabs';
export { DiscussionCard } from './discussion-card';
export { DiscussionFeed } from './discussion-feed';
export { AvatarStack } from './avatar-stack';
```

## File Structure After Phase 5

```
apps/forum/src/
├── components/
│   ├── feed/
│   │   ├── index.ts              ✅ NEW
│   │   ├── featured-slider.tsx   ✅ NEW
│   │   ├── feed-tabs.tsx         ✅ NEW
│   │   ├── discussion-card.tsx   ✅ NEW
│   │   ├── discussion-feed.tsx   ✅ NEW
│   │   └── avatar-stack.tsx      ✅ NEW
│   └── ui/
│       └── glow-card.tsx         ✅ NEW
├── hooks/
│   └── use-infinite-scroll.ts    ✅ NEW
├── data/
│   └── mock-data.ts              ✅ UPDATED
```

## Verification Checklist
- [ ] Featured slider auto-plays every 5 seconds
- [ ] Slider navigation arrows work
- [ ] Dot indicators show current slide
- [ ] Feed tabs switch with animation
- [ ] Active tab has glow effect
- [ ] Discussion cards have hover glow and lift
- [ ] Upvote button bounces on click
- [ ] Avatar stack shows max 5 with +N indicator
- [ ] Infinite scroll loads more on scroll
- [ ] Loading skeletons display while fetching
- [ ] Stagger animation on card appearance

## Next Phase
After completing Phase 5, proceed to [Phase 6: Right Sidebar](./phase-6-right-sidebar.md)
