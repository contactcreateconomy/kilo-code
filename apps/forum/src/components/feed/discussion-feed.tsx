'use client';

import { useState, useMemo } from 'react';
import { FeedTabs } from './feed-tabs';
import { DiscussionCard } from './discussion-card';
import { FeaturedSlider } from './featured-slider';
import { useDiscussionFeed } from '@/hooks/use-discussion-feed';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { FeedTabType } from '@/types/forum';

interface DiscussionFeedProps {
  className?: string;
  showFeaturedSlider?: boolean;
}

/**
 * DiscussionFeed - Main feed component with tabs, featured slider, and live data
 *
 * Fetches discussions from Convex via useDiscussionFeed hook.
 * Sorting is done server-side; tabs control the sortBy parameter.
 */
export function DiscussionFeed({
  className,
  showFeaturedSlider = true,
}: DiscussionFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTabType>('top');
  const { discussions, isLoading } = useDiscussionFeed(activeTab, 30);

  // Featured: pinned or high-engagement discussions
  const featuredDiscussions = useMemo(
    () =>
      discussions
        .filter((d) => d.isPinned || d.upvotes > 50)
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
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading discussions...</span>
            </div>
          </div>
        ) : discussions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-foreground">No discussions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to start a conversation!
            </p>
          </div>
        ) : (
          discussions.map((discussion, index) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default DiscussionFeed;
