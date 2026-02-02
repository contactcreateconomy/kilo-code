'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Discussion, FeedTabType } from '@/types/forum';

interface UseFeedFilterOptions {
  initialTab?: FeedTabType;
}

interface UseFeedFilterReturn {
  activeTab: FeedTabType;
  setActiveTab: (tab: FeedTabType) => void;
  filteredDiscussions: Discussion[];
  sortDiscussions: (discussions: Discussion[]) => Discussion[];
}

/**
 * useFeedFilter - Hook for filtering and sorting discussions
 */
export function useFeedFilter(
  discussions: Discussion[],
  options: UseFeedFilterOptions = {}
): UseFeedFilterReturn {
  const { initialTab = 'top' } = options;
  const [activeTab, setActiveTab] = useState<FeedTabType>(initialTab);

  const sortDiscussions = useCallback(
    (items: Discussion[]): Discussion[] => {
      const sorted = [...items];

      switch (activeTab) {
        case 'top':
          // Sort by upvotes (highest first)
          return sorted.sort((a, b) => b.upvotes - a.upvotes);

        case 'hot':
          // Sort by engagement score (upvotes + comments weighted by recency)
          return sorted.sort((a, b) => {
            const scoreA = calculateHotScore(a);
            const scoreB = calculateHotScore(b);
            return scoreB - scoreA;
          });

        case 'new':
          // Sort by creation date (newest first)
          return sorted.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        case 'fav':
          // In real implementation, this would filter by user's favorites
          // For now, just return pinned items first
          return sorted.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.upvotes - a.upvotes;
          });

        default:
          return sorted;
      }
    },
    [activeTab]
  );

  const filteredDiscussions = useMemo(() => {
    return sortDiscussions(discussions);
  }, [discussions, sortDiscussions]);

  return {
    activeTab,
    setActiveTab,
    filteredDiscussions,
    sortDiscussions,
  };
}

/**
 * Calculate "hot" score based on engagement and recency
 */
function calculateHotScore(discussion: Discussion): number {
  const now = Date.now();
  const created = new Date(discussion.createdAt).getTime();
  const ageInHours = (now - created) / (1000 * 60 * 60);

  // Engagement score
  const engagement = discussion.upvotes + discussion.comments * 2;

  // Decay factor (posts lose relevance over time)
  const decay = Math.pow(0.95, ageInHours / 24);

  return engagement * decay;
}
