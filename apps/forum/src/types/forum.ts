/**
 * Forum-specific TypeScript types for the premium redesign
 */

export interface Discussion {
  id: string;
  title: string;
  summary: string;
  author: User;
  category: Category;
  upvotes: number;
  comments: number;
  participants: User[];
  createdAt: Date;
  imageUrl?: string;
  isPinned?: boolean;
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
  icon: string;
  count: number;
  isPremium?: boolean;
  pointsRequired?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  prize: string;
  endDate: Date;
  progress: number;
  totalParticipants: number;
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
