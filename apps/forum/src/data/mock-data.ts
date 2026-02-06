import type { Category, Campaign, User, Discussion, LeaderboardEntry, CommunityStats } from '@/types/forum';

/**
 * Mock data for development - matches reference design
 */

// Users with realistic data
export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Chen', username: 'sarahchen', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', points: 12450 },
  { id: '2', name: 'Alex Rivera', username: 'alexr', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', points: 11230 },
  { id: '3', name: 'Emily Watson', username: 'emilyw', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', points: 10890 },
  { id: '4', name: 'Marcus Johnson', username: 'marcusj', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', points: 9750 },
  { id: '5', name: 'David Kim', username: 'davidk', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face', points: 8920 },
  { id: '6', name: 'Lisa Park', username: 'lisap', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', points: 7650 },
  { id: '7', name: 'Tom Wilson', username: 'tomw', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', points: 6540 },
  { id: '8', name: 'Nina Brown', username: 'ninab', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', points: 5890 },
  { id: '9', name: 'James Lee', username: 'jamesl', avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=100&h=100&fit=crop&crop=face', points: 5120 },
  { id: '10', name: 'Amy Zhang', username: 'amyz', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face', points: 4780 },
];

// Categories with Lucide icons and Tailwind colors
export const mockCategories: Category[] = [
  { id: '1', name: 'Programming', slug: 'programming', icon: 'Code', color: 'bg-blue-500', count: 1234 },
  { id: '2', name: 'Design', slug: 'design', icon: 'Palette', color: 'bg-pink-500', count: 856 },
  { id: '3', name: 'Startups', slug: 'startups', icon: 'Rocket', color: 'bg-orange-500', count: 432 },
  { id: '4', name: 'AI & ML', slug: 'ai-ml', icon: 'Brain', color: 'bg-violet-500', count: 2156 },
  { id: '5', name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', color: 'bg-green-500', count: 678 },
  { id: '6', name: 'Learning', slug: 'learning', icon: 'BookOpen', color: 'bg-cyan-500', count: 345 },
];

// Premium categories (optional)
export const mockPremiumCategories: Category[] = [
  { id: '7', name: 'Debate', slug: 'debate', icon: 'MessageSquare', color: 'bg-amber-500', count: 0, isPremium: true, pointsRequired: 500 },
  { id: '8', name: 'Launch', slug: 'launch', icon: 'Rocket', color: 'bg-rose-500', count: 0, isPremium: true, pointsRequired: 1000 },
];

// Campaign data
export const mockCampaign: Campaign = {
  id: '1',
  title: 'Win Claude Pro!',
  description: 'Top contributors this month win 3 months of Claude Pro subscription.',
  prize: 'Claude Pro',
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  progress: 2450,
  targetPoints: 5000,
  participantCount: 234,
};

// Leaderboard with badges
export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user: mockUsers[0]!, points: 12450, badge: 'gold' },
  { rank: 2, user: mockUsers[1]!, points: 11230, badge: 'gold' },
  { rank: 3, user: mockUsers[2]!, points: 10890, badge: 'gold' },
  { rank: 4, user: mockUsers[3]!, points: 9750, badge: 'silver' },
  { rank: 5, user: mockUsers[4]!, points: 8920, badge: 'silver' },
  { rank: 6, user: mockUsers[5]!, points: 7650, badge: 'silver' },
  { rank: 7, user: mockUsers[6]!, points: 6540, badge: 'bronze' },
  { rank: 8, user: mockUsers[7]!, points: 5890, badge: 'bronze' },
  { rank: 9, user: mockUsers[8]!, points: 5120, badge: 'bronze' },
  { rank: 10, user: mockUsers[9]!, points: 4780, badge: 'bronze' },
];

// Community stats
export const mockCommunityStats: CommunityStats = {
  members: '24.5K',
  discussions: '8.2K',
  comments: '156K',
};

// Discussions with AI summaries
export const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'What are the best practices for building scalable React applications in 2025?',
    aiSummary: 'Discussion covers React Server Components, state management patterns, and performance optimization techniques for large-scale applications.',
    author: mockUsers[0]!,
    category: mockCategories[0]!,
    upvotes: 234,
    comments: 56,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=338&fit=crop',
    isPinned: true,
    isUpvoted: false,
    isBookmarked: false,
  },
  {
    id: '2',
    title: 'The future of AI-powered design tools: Are designers being replaced?',
    aiSummary: 'Explores how AI tools like Midjourney and Figma AI are changing the design landscape and the evolving role of human designers.',
    author: mockUsers[3]!,
    category: mockCategories[1]!,
    upvotes: 189,
    comments: 78,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isUpvoted: false,
    isBookmarked: false,
  },
  {
    id: '3',
    title: 'How I built a $10M ARR SaaS in 18 months with a team of 3',
    aiSummary: 'Detailed breakdown of growth strategies, tech stack choices, and lessons learned from scaling a B2B SaaS company rapidly.',
    author: mockUsers[2]!,
    category: mockCategories[2]!,
    upvotes: 567,
    comments: 123,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=338&fit=crop',
    isUpvoted: true,
    isBookmarked: false,
  },
  {
    id: '4',
    title: 'GPT-5 leaked benchmarks show unprecedented reasoning capabilities',
    aiSummary: 'Analysis of rumored GPT-5 performance metrics showing significant improvements in multi-step reasoning and code generation.',
    author: mockUsers[1]!,
    category: mockCategories[3]!,
    upvotes: 892,
    comments: 234,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isUpvoted: false,
    isBookmarked: true,
  },
  {
    id: '5',
    title: 'The indie game that made $2M in its first week - A postmortem',
    aiSummary: 'Solo developer shares marketing strategies, launch timing decisions, and community building tactics that led to viral success.',
    author: mockUsers[4]!,
    category: mockCategories[4]!,
    upvotes: 445,
    comments: 89,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isUpvoted: false,
    isBookmarked: false,
  },
];

// Featured discussions (pinned or high upvotes)
export const mockFeaturedDiscussions = mockDiscussions.filter(d => d.isPinned || d.upvotes > 400);
