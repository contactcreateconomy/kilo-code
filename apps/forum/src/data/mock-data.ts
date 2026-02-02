import type { Category, Campaign, User, Discussion, LeaderboardEntry, TrendingTopic } from '@/types/forum';

/**
 * Mock data for development - will be replaced with real API data
 */

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
  { rank: 1, user: mockUsers[0]!, points: 2450, trend: 'up' },
  { rank: 2, user: mockUsers[1]!, points: 1890, trend: 'stable' },
  { rank: 3, user: mockUsers[2]!, points: 1650, trend: 'down' },
];

export const mockTrendingTopics: TrendingTopic[] = [
  { id: '1', title: 'AI Tools for Creators', category: 'News', engagement: 89, trend: 'hot' },
  { id: '2', title: 'Best Design Resources 2024', category: 'List', engagement: 76, trend: 'rising' },
  { id: '3', title: 'Figma vs Sketch Comparison', category: 'Compare', engagement: 54, trend: 'new' },
];

export const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'Best AI Tools for Content Creators in 2024',
    summary: 'A comprehensive guide to the most useful AI tools that can help content creators streamline their workflow and boost productivity.',
    author: mockUsers[0]!,
    category: mockCategories[0]!,
    upvotes: 342,
    comments: 89,
    participants: mockUsers.slice(0, 5),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    isPinned: true,
  },
  {
    id: '2',
    title: 'How I Built a $10k/month Digital Product Business',
    summary: 'Sharing my journey from zero to $10k monthly revenue selling digital products. Tips, strategies, and lessons learned.',
    author: mockUsers[1]!,
    category: mockCategories[5]!,
    upvotes: 256,
    comments: 67,
    participants: mockUsers.slice(1, 4),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Figma vs Sketch vs Adobe XD - Which One Should You Choose?',
    summary: 'An in-depth comparison of the three most popular design tools. Pros, cons, and use cases for each.',
    author: mockUsers[2]!,
    category: mockCategories[2]!,
    upvotes: 189,
    comments: 45,
    participants: mockUsers.slice(2, 5),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
  },
  {
    id: '4',
    title: 'Need help with my first digital product launch',
    summary: 'I\'m about to launch my first ebook and would love some advice from experienced creators on pricing and marketing.',
    author: mockUsers[3]!,
    category: mockCategories[4]!,
    upvotes: 45,
    comments: 23,
    participants: mockUsers.slice(0, 3),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    title: 'Top 10 Resources for Learning Web Development in 2024',
    summary: 'A curated list of the best courses, tutorials, and resources for aspiring web developers.',
    author: mockUsers[4]!,
    category: mockCategories[3]!,
    upvotes: 178,
    comments: 34,
    participants: mockUsers.slice(1, 5),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

export const mockFeaturedDiscussions = mockDiscussions.filter(d => d.isPinned || d.upvotes > 200);
