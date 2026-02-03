/**
 * Forum-specific TypeScript types for the redesigned forum
 */

export interface Discussion {
  id: string;
  title: string;
  aiSummary: string;
  author: User;
  category: Category;
  upvotes: number;
  comments: number;
  createdAt: Date;
  imageUrl?: string;
  isPinned?: boolean;
  isUpvoted?: boolean;
  isBookmarked?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  points?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name (e.g., 'Code', 'Palette', 'Rocket')
  color: string; // Tailwind color class (e.g., 'bg-blue-500')
  count: number;
  isPremium?: boolean;
  pointsRequired?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  badge: 'gold' | 'silver' | 'bronze';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  prize: string;
  endDate: Date;
  progress: number;
  targetPoints: number;
  participantCount: number;
}

export interface CommunityStats {
  members: string;
  discussions: string;
  comments: string;
}

export interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  engagement: number;
  trend: 'rising' | 'hot' | 'new';
}

export type FeedTabType = 'top' | 'hot' | 'new' | 'fav';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reply' | 'upvote' | 'mention' | 'follow' | 'campaign';
}
