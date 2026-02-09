'use client';

import { useState, useMemo } from 'react';
import { FeedTabs } from './feed-tabs';
import { DiscussionCard } from './discussion-card';
import { FeaturedSlider } from './featured-slider';
import { useDiscussionFeed } from '@/hooks/use-discussion-feed';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { cn, Spinner } from '@createconomy/ui';
import { Users } from 'lucide-react';
import type { FeedTabType } from '@/types/forum';

interface DiscussionFeedProps {
  className?: string;
  showFeaturedSlider?: boolean;
}

/**
 * DiscussionFeed - Main feed component with tabs, featured slider, and infinite scroll
 *
 * Fetches discussions from Convex via useDiscussionFeed hook.
 * Sorting is done server-side; tabs control the sortBy parameter.
 * Infinite scroll loads more discussions as user scrolls down.
 */
export function DiscussionFeed({
  className,
  showFeaturedSlider = true,
}: DiscussionFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTabType>('top');
  const { discussions, isLoading, hasMore, loadMore, isLoadingMore } =
    useDiscussionFeed(activeTab, 20);

  const { ref: loadMoreRef } = useInfiniteScroll(
    async () => {
      await loadMore();
    },
    {
      enabled: hasMore && !isLoadingMore,
      threshold: 0.1,
      rootMargin: '200px',
    }
  );

  // Featured: pinned or high-engagement discussions
  const featuredDiscussions = useMemo(
    () =>
      discussions
        .filter((d) => d.isPinned || d.score > 50)
        .slice(0, 5),
    [discussions]
  );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Featured Slider */}
      {showFeaturedSlider && featuredDiscussions.length > 0 && (
        <div className="mb-2">
          <FeaturedSlider discussions={featuredDiscussions} />
        </div>
      )}

      {/* Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Discussion Cards */}
      <div className="flex flex-col gap-4">
        {isLoading && discussions.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner size="md" />
              <span className="text-sm">Loading discussions...</span>
            </div>
          </div>
        ) : discussions.length === 0 ? (
          activeTab === 'following' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Follow some users to see their posts in your feed. Visit user profiles to follow them.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-foreground">No discussions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to start a conversation!
              </p>
            </div>
          )
        ) : (
          <>
            {discussions.map((discussion, index) => (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                index={index}
              />
            ))}

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner size="md" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Scroll for more
                  </span>
                )}
              </div>
            )}

            {!hasMore && discussions.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                You&apos;ve reached the end!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DiscussionFeed;
