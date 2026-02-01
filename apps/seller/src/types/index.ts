// User types
export interface User {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: "user" | "seller" | "admin";
  createdAt: number;
}

// Seller types
export interface Seller {
  _id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  storeLogo?: string;
  storeBanner?: string;
  businessType: "individual" | "llc" | "corporation" | "partnership" | "nonprofit";
  status: "pending" | "approved" | "suspended";
  phone: string;
  website?: string;
  createdAt: number;
  approvedAt?: number;
}

export interface SellerSettings {
  sellerId: string;
  shippingMethods: ShippingMethod[];
  returnPolicy: string;
  refundPolicy: string;
  processingTime: string;
  payoutMethod?: PayoutMethod;
}

// Product types
export interface Product {
  _id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  lowStockThreshold: number;
  category: string;
  tags: string[];
  images: string[];
  status: "draft" | "active" | "archived";
  createdAt: number;
  updatedAt: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  sku: string;
  stock: number;
  category: string;
  status: string;
}

// Order types
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  _id: string;
  orderNumber: string;
  sellerId: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  shippingInfo?: ShippingInfo;
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingInfo {
  carrier: string;
  trackingNumber: string;
  shippingDate: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Shipping types
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  enabled: boolean;
}

// Payout types
export interface PayoutMethod {
  type: "bank" | "paypal" | "stripe";
  details: Record<string, string>;
}

export interface Payout {
  _id: string;
  sellerId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "pending" | "processing" | "completed" | "failed";
  method: PayoutMethod;
  createdAt: number;
  processedAt?: number;
}

// Review types
export interface Review {
  _id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  sellerResponse?: string;
  sellerResponseAt?: number;
  createdAt: number;
}

// Analytics types
export interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface AnalyticsData {
  revenue: RevenueData[];
  orders: { date: string; count: number }[];
  topProducts: TopProduct[];
  conversionRate: number;
  averageOrderValue: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form types
export interface SellerApplicationData {
  email: string;
  password: string;
  storeName: string;
  storeDescription: string;
  businessType: string;
  website?: string;
  phone: string;
  agreeToTerms: boolean;
}

export interface ShippingFormData {
  carrier: string;
  trackingNumber: string;
  shippingDate: string;
  estimatedDelivery: string;
  notes: string;
}
