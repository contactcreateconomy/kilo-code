// User types
export type UserRole = 'user' | 'seller' | 'moderator' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: number;
  updatedAt?: number;
  lastLoginAt?: number;
}

// Product types
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  sellerId: string;
  status: ProductStatus;
  featured: boolean;
  inventory: number;
  createdAt: number;
  updatedAt?: number;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  productCount: number;
  createdAt: number;
  updatedAt?: number;
}

// Order types
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Seller types
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Seller {
  _id: string;
  userId: string;
  businessName: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: SellerStatus;
  rating: number;
  reviewCount: number;
  productCount: number;
  totalSales: number;
  totalRevenue: number;
  commissionRate: number;
  contactEmail: string;
  contactPhone?: string;
  address?: Address;
  createdAt: number;
  updatedAt?: number;
  approvedAt?: number;
}

// Report types
export type ReportType = 'product' | 'review' | 'user' | 'forum_post' | 'forum_comment';

export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface Report {
  _id: string;
  type: ReportType;
  targetId: string;
  reporterId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  assignedTo?: string;
  resolution?: string;
  createdAt: number;
  updatedAt?: number;
  resolvedAt?: number;
}

// Review types
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  status: ReviewStatus;
  helpful: number;
  verified: boolean;
  createdAt: number;
  updatedAt?: number;
}

// Analytics types
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalUsers: number;
  usersChange: number;
  totalProducts: number;
  productsChange: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  _id: string;
  name: string;
  image?: string;
  sales: number;
  revenue: number;
}

export interface TopSeller {
  _id: string;
  businessName: string;
  logo?: string;
  sales: number;
  revenue: number;
}

// Table types
export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

// Form types
export interface SelectOption {
  value: string;
  label: string;
}

// Settings types
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
}

export interface CommissionSettings {
  defaultRate: number;
  minimumPayout: number;
  payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
}

export interface NotificationSettings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  sellerNotifications: boolean;
  reportNotifications: boolean;
}

// Activity log types
export type ActivityType =
  | 'user_created'
  | 'user_updated'
  | 'user_suspended'
  | 'product_created'
  | 'product_updated'
  | 'product_approved'
  | 'product_rejected'
  | 'order_created'
  | 'order_updated'
  | 'order_refunded'
  | 'seller_approved'
  | 'seller_rejected'
  | 'report_resolved'
  | 'settings_updated';

export interface ActivityLog {
  _id: string;
  type: ActivityType;
  userId: string;
  targetType: string;
  targetId: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
}
