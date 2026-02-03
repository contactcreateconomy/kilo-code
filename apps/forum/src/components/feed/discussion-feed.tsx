'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedTabs } from './feed-tabs';
import { DiscussionCard } from './discussion-card';
import { FeaturedSlider } from './featured-slider';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { Discussion, FeedTabType } from '@/types/forum';

interface DiscussionFeedProps {
  initialDiscussions: Discussion[];
  className?: string;
  showFeaturedSlider?: boolean;
}

/**
 * DiscussionFeed - Main feed component with tabs, featured slider, and infinite scroll
 */
export function DiscussionFeed({
  initialDiscussions,
  className,
  showFeaturedSlider = true
}: DiscussionFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTabType>('top');
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sort/filter discussions based on active tab
  const sortedDiscussions = [...discussions]
    .filter((d) => {
      // For 'fav' tab, only show bookmarked discussions
      if (activeTab === 'fav') {
        return d.isBookmarked;
      }
      return true;
    })
    .sort((a, b) => {
      switch (activeTab) {
        case 'hot':
          // Hot: combination of upvotes and recency
          const aScore = a.upvotes + (Date.now() - new Date(a.createdAt).getTime()) / 3600000;
          const bScore = b.upvotes + (Date.now() - new Date(b.createdAt).getTime()) / 3600000;
          return bScore - aScore;
        case 'new':
          // New: most recent first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'top':
          // Top: highest upvotes first
          return b.upvotes - a.upvotes;
        case 'fav':
          // Fav: most recent bookmarked first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  // Get featured discussions (pinned or high engagement)
  const featuredDiscussions = sortedDiscussions.filter(
    d => d.isPinned || d.upvotes > 100
  ).slice(0, 5);

  // Simulate loading more discussions
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would fetch more discussions from the API
    // For now, we'll just duplicate existing discussions with new IDs
    const newDiscussions = initialDiscussions.map((d, i) => ({
      ...d,
      id: `${d.id}-${discussions.length + i}`,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random date within last week
    }));
    
    setDiscussions(prev => [...prev, ...newDiscussions]);
    
    // Stop after 3 loads for demo purposes
    if (discussions.length >= initialDiscussions.length * 3) {
      setHasMore(false);
    }
    
    setIsLoading(false);
  }, [isLoading, hasMore, discussions.length, initialDiscussions]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  // Reset discussions when tab changes
  useEffect(() => {
    setDiscussions(initialDiscussions);
    setHasMore(true);
  }, [activeTab, initialDiscussions]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Featured Slider */}
      {showFeaturedSlider && featuredDiscussions.length > 0 && (
        <div className="mb-2">
          <FeaturedSlider discussions={featuredDiscussions} />
        </div>
      )}

      {/* Discussion Cards */}
      <div className="flex flex-col gap-4">
        {sortedDiscussions.map((discussion, index) => (
          <DiscussionCard key={discussion.id} discussion={discussion} index={index} />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading more discussions...</span>
          </div>
        )}
        {!hasMore && discussions.length > initialDiscussions.length && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              🎉 You've reached the end! No more discussions to load.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscussionFeed;
