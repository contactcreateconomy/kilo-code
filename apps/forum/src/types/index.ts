// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role?: "admin" | "moderator" | "member";
  bio?: string;
  joinedAt: Date | string;
  postCount?: number;
  threadCount?: number;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  threadCount: number;
  postCount: number;
  order?: number;
  parentId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Thread types
export interface Thread {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: User;
  category: Category;
  tags?: string[];
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  lastReply?: {
    author: Pick<User, "username" | "avatar">;
    createdAt: Date | string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Post types
export interface Post {
  id: string;
  threadId: string;
  content: string;
  author: User;
  replyToId?: string;
  replyTo?: Post;
  likeCount: number;
  isLiked?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Search types
export interface SearchResult {
  type: "thread" | "post" | "user";
  id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  author?: User;
  category?: Category;
  createdAt: Date | string;
  relevance: number;
}

export interface SearchFilters {
  query: string;
  type?: "thread" | "post" | "user" | "all";
  categoryId?: string;
  authorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "relevance" | "date" | "popularity";
  sortOrder?: "asc" | "desc";
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "reply" | "mention" | "like" | "follow" | "system";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date | string;
  actor?: Pick<User, "id" | "username" | "avatar">;
}

// Form types
export interface ThreadFormData {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}

export interface PostFormData {
  content: string;
  replyToId?: string;
}

export interface ProfileFormData {
  username: string;
  bio?: string;
  avatar?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Auth types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username: string;
}

// Theme types
export type Theme = "light" | "dark" | "system";

// Forum stats types
export interface ForumStats {
  totalUsers: number;
  totalThreads: number;
  totalPosts: number;
  onlineUsers: number;
  newestMember?: Pick<User, "id" | "username">;
}

// Activity types
export interface Activity {
  id: string;
  type: "thread_created" | "post_created" | "user_joined";
  actor: Pick<User, "id" | "username" | "avatar">;
  target?: {
    type: "thread" | "post" | "category";
    id: string;
    title?: string;
  };
  createdAt: Date | string;
}

// Report types
export interface Report {
  id: string;
  type: "thread" | "post" | "user";
  targetId: string;
  reason: string;
  description?: string;
  reporter: Pick<User, "id" | "username">;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: Date | string;
  resolvedAt?: Date | string;
  resolvedBy?: Pick<User, "id" | "username">;
}
