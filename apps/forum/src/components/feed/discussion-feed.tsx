'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiscussionCard } from './discussion-card';
import { FeedTabs } from './feed-tabs';
import { Skeleton } from '@createconomy/ui';
import { mockDiscussions } from '@/data/mock-data';
import type { Discussion, FeedTabType } from '@/types/forum';

interface DiscussionFeedProps {
  initialDiscussions?: Discussion[];
}

/**
 * DiscussionFeed - Main feed with tabs and discussion cards
 */
export function DiscussionFeed({ initialDiscussions }: DiscussionFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTabType>('top');
  const [isLoading, setIsLoading] = useState(false);

  // Use mock data for now
  const discussions = initialDiscussions || mockDiscussions;

  const handleTabChange = (tab: FeedTabType) => {
    setActiveTab(tab);
    // In real implementation, this would fetch filtered data
  };

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

      {/* End of List */}
      {discussions.length > 0 && !isLoading && (
        <p className="text-center text-muted-foreground text-sm py-8">
          You&apos;ve reached the end 🎉
        </p>
      )}
    </div>
  );
}
