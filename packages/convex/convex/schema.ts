import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Security fix (S5): Reusable validator for metadata fields.
// Replaces v.any() with a safe record type that allows string keys
// with string, number, boolean, or null values. This prevents arbitrary
// data injection while remaining flexible for key-value metadata.
export const metadataValidator = v.optional(
  v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))
);

/**
 * Createconomy Database Schema
 *
 * This schema defines the complete data structure for the Createconomy e-commerce platform.
 * It supports multi-tenant architecture with data isolation, four user roles,
 * e-commerce functionality, forum features, and Stripe payment integration.
 *
 * @version 1.0.0
 */

// ============================================================================
// Enums and Validators
// ============================================================================

/** User roles in the system */
export const userRoleValidator = v.union(
  v.literal("customer"),
  v.literal("seller"),
  v.literal("admin"),
  v.literal("moderator")
);

/** Order status values */
export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("processing"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled"),
  v.literal("refunded"),
  v.literal("partially_refunded"),
  v.literal("disputed")
);

/** Product status values */
export const productStatusValidator = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("inactive"),
  v.literal("archived")
);

/** Payment status values */
export const paymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("refunded"),
  v.literal("cancelled"),
  v.literal("partially_refunded"),
  v.literal("disputed")
);

/** Forum post status values */
export const forumPostStatusValidator = v.union(
  v.literal("published"),
  v.literal("draft"),
  v.literal("hidden"),
  v.literal("deleted")
);

// ============================================================================
// Schema Definition
// ============================================================================

export default defineSchema({
  // -------------------------------------------------------------------------
  // Auth Tables (from @convex-dev/auth)
  // -------------------------------------------------------------------------
  ...authTables,

  // -------------------------------------------------------------------------
  // Multi-tenancy Tables
  // -------------------------------------------------------------------------

  /**
   * Tenants table for multi-tenant architecture
   * Each tenant represents a separate marketplace/store
   */
  tenants: defineTable({
    name: v.string(),
    slug: v.string(),
    domain: v.optional(v.string()),
    subdomain: v.optional(v.string()),
    settings: v.optional(
      v.object({
        theme: v.optional(v.string()),
        logo: v.optional(v.string()),
        primaryColor: v.optional(v.string()),
        currency: v.optional(v.string()),
        timezone: v.optional(v.string()),
      })
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_domain", ["domain"])
    .index("by_subdomain", ["subdomain"]),

  /**
   * User-Tenant relationships for multi-tenancy
   * Links users to tenants with specific roles
   */
  userTenants: defineTable({
    userId: v.id("users"),
    tenantId: v.id("tenants"),
    role: userRoleValidator,
    isActive: v.boolean(),
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"])
    .index("by_user_tenant", ["userId", "tenantId"]),

  // -------------------------------------------------------------------------
  // User Tables
  // -------------------------------------------------------------------------

  /**
   * Extended user profiles (extends auth tables)
   * Contains additional profile data beyond authentication
   */
  userProfiles: defineTable({
    userId: v.id("users"),
    username: v.optional(v.string()), // Unique username for forum
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        country: v.optional(v.string()),
      })
    ),
    preferences: v.optional(
      v.object({
        emailNotifications: v.optional(v.boolean()),
        marketingEmails: v.optional(v.boolean()),
        language: v.optional(v.string()),
        currency: v.optional(v.string()),
      })
    ),
    points: v.optional(v.number()), // Forum points
    defaultRole: userRoleValidator,
    isBanned: v.boolean(),
    bannedAt: v.optional(v.number()),
    bannedReason: v.optional(v.string()),
    isMuted: v.optional(v.boolean()),
    mutedUntil: v.optional(v.number()),
    warnCount: v.optional(v.number()),
    // Phase 8: Social counts
    followerCount: v.optional(v.number()),
    followingCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"])
    .index("by_role", ["defaultRole"])
    .index("by_banned", ["isBanned"]),

  /**
   * Sessions for cross-subdomain authentication
   * Manages user sessions across different subdomains
   */
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    tenantId: v.optional(v.id("tenants")),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    origin: v.optional(v.string()),
    expiresAt: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastAccessedAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_expires", ["expiresAt"]),

  // -------------------------------------------------------------------------
  // Product Tables
  // -------------------------------------------------------------------------

  /**
   * Product categories
   * Hierarchical category structure for products
   */
  productCategories: defineTable({
    tenantId: v.optional(v.id("tenants")),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("productCategories")),
    imageUrl: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_slug", ["slug"])
    .index("by_tenant_slug", ["tenantId", "slug"])
    .index("by_parent", ["parentId"])
    .index("by_active", ["isActive"]),

  /**
   * Products table
   * Main product catalog
   */
  products: defineTable({
    tenantId: v.optional(v.id("tenants")),
    sellerId: v.id("users"),
    categoryId: v.optional(v.id("productCategories")),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    currency: v.string(),
    sku: v.optional(v.string()),
    inventory: v.optional(v.number()),
    trackInventory: v.boolean(),
    status: productStatusValidator,
    isDigital: v.boolean(),
    digitalFileUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
    averageRating: v.optional(v.number()),
    reviewCount: v.number(),
    salesCount: v.number(),
    viewCount: v.number(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_seller", ["sellerId"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_tenant_status", ["tenantId", "status"])
    .index("by_seller_status", ["sellerId", "status"])
    .index("by_slug", ["slug"])
    .index("by_tenant_slug", ["tenantId", "slug"])
    .index("by_deleted", ["isDeleted"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["tenantId", "categoryId", "status", "isDeleted"],
    }),

  /**
   * Product view tracking
   * PERF: Lightweight table to deduplicate view counts per viewer per product.
   * Each row records a single viewer's most recent view of a product,
   * enabling a throttle window (e.g., 1 hour) before re-counting.
   */
  productViews: defineTable({
    productId: v.id("products"),
    viewerId: v.string(), // userId or anonymous session token
    viewedAt: v.number(),
  })
    .index("by_product_viewer", ["productId", "viewerId"]),

  /**
   * Product images
   * Multiple images per product
   */
  productImages: defineTable({
    productId: v.id("products"),
    url: v.string(),
    altText: v.optional(v.string()),
    sortOrder: v.number(),
    isPrimary: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_product_primary", ["productId", "isPrimary"]),

  // -------------------------------------------------------------------------
  // Order Tables
  // -------------------------------------------------------------------------

  /**
   * Orders table
   * Customer orders
   */
  orders: defineTable({
    tenantId: v.optional(v.id("tenants")),
    userId: v.id("users"),
    orderNumber: v.string(),
    status: orderStatusValidator,
    subtotal: v.number(),
    tax: v.number(),
    shipping: v.number(),
    discount: v.number(),
    total: v.number(),
    currency: v.string(),
    shippingAddress: v.optional(
      v.object({
        name: v.string(),
        street: v.string(),
        city: v.string(),
        state: v.optional(v.string()),
        postalCode: v.string(),
        country: v.string(),
        phone: v.optional(v.string()),
      })
    ),
    billingAddress: v.optional(
      v.object({
        name: v.string(),
        street: v.string(),
        city: v.string(),
        state: v.optional(v.string()),
        postalCode: v.string(),
        country: v.string(),
      })
    ),
    notes: v.optional(v.string()),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
    paidAt: v.optional(v.number()),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_tenant_status", ["tenantId", "status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_order_number", ["orderNumber"]),

  /**
   * Order items
   * Individual items within an order
   */
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    sellerId: v.id("users"),
    name: v.string(),
    sku: v.optional(v.string()),
    price: v.number(),
    quantity: v.number(),
    subtotal: v.number(),
    status: orderStatusValidator,
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_product", ["productId"])
    .index("by_seller", ["sellerId"])
    .index("by_seller_status", ["sellerId", "status"]),

  // -------------------------------------------------------------------------
  // Cart Tables
  // -------------------------------------------------------------------------

  /**
   * Shopping cart
   * User's shopping cart
   */
  carts: defineTable({
    tenantId: v.optional(v.id("tenants")),
    userId: v.optional(v.id("users")),
    sessionId: v.optional(v.string()),
    currency: v.string(),
    subtotal: v.number(),
    itemCount: v.number(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_tenant_user", ["tenantId", "userId"]),

  /**
   * Cart items
   * Items in a shopping cart
   */
  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    userId: v.optional(v.id("users")),
    quantity: v.number(),
    price: v.number(),
    subtotal: v.number(),
    addedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_cart", ["cartId"])
    .index("by_product", ["productId"])
    .index("by_cart_product", ["cartId", "productId"])
    .index("by_user", ["userId"]),

  // -------------------------------------------------------------------------
  // Review Tables
  // -------------------------------------------------------------------------

  /**
   * Product reviews
   * Customer reviews and ratings for products
   */
  reviews: defineTable({
    tenantId: v.optional(v.id("tenants")),
    productId: v.id("products"),
    userId: v.id("users"),
    orderId: v.optional(v.id("orders")),
    rating: v.number(),
    title: v.optional(v.string()),
    content: v.string(),
    isVerifiedPurchase: v.boolean(),
    helpfulCount: v.number(),
    isApproved: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_product", ["productId"])
    .index("by_user", ["userId"])
    .index("by_product_approved", ["productId", "isApproved"])
    .index("by_deleted", ["isDeleted"]),

  // -------------------------------------------------------------------------
  // Forum Tables
  // -------------------------------------------------------------------------

  /**
   * Forum categories
   * Categories for organizing forum discussions
   */
  forumCategories: defineTable({
    tenantId: v.optional(v.id("tenants")),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("forumCategories")),
    icon: v.optional(v.string()), // Lucide icon name
    color: v.optional(v.string()), // Tailwind color class
    sortOrder: v.number(),
    isActive: v.boolean(),
    threadCount: v.number(),
    postCount: v.number(),
    lastPostAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_slug", ["slug"])
    .index("by_tenant_slug", ["tenantId", "slug"])
    .index("by_parent", ["parentId"])
    .index("by_active", ["isActive"]),

  /**
   * Forum threads
   * Discussion threads within forum categories
   */
  forumThreads: defineTable({
    tenantId: v.optional(v.id("tenants")),
    categoryId: v.id("forumCategories"),
    authorId: v.id("users"),
    title: v.string(),
    slug: v.string(),
    body: v.optional(v.string()), // Thread body content (markdown) — replaces first forumPost
    aiSummary: v.optional(v.string()), // AI-generated summary
    imageUrl: v.optional(v.string()), // Preview image

    // Post type — defaults to "text" for backward compat
    postType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("link"),
        v.literal("image"),
        v.literal("poll")
      )
    ),

    // Link post fields (Phase 3)
    linkUrl: v.optional(v.string()),
    linkDomain: v.optional(v.string()), // e.g., "youtube.com"
    linkTitle: v.optional(v.string()), // OG title
    linkDescription: v.optional(v.string()), // OG description
    linkImage: v.optional(v.string()), // OG image URL

    // Image post fields (Phase 3)
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          caption: v.optional(v.string()),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
        })
      )
    ),

    // Poll fields (Phase 3)
    pollOptions: v.optional(v.array(v.string())),
    pollEndsAt: v.optional(v.number()), // epoch ms
    pollMultiSelect: v.optional(v.boolean()),

    // Flair (Phase 10)
    flairId: v.optional(v.id("postFlairs")),

    isPinned: v.boolean(),
    isLocked: v.boolean(),
    viewCount: v.number(),
    postCount: v.number(), // Legacy: kept for backward compat
    commentCount: v.optional(v.number()), // New: Reddit-style comment count
    upvoteCount: v.optional(v.number()), // Upvote count
    downvoteCount: v.optional(v.number()), // Downvote count
    score: v.optional(v.number()), // Net score (upvoteCount - downvoteCount)
    bookmarkCount: v.optional(v.number()), // Bookmark count
    lastPostAt: v.optional(v.number()),
    lastPostUserId: v.optional(v.id("users")),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_category", ["categoryId"])
    .index("by_author", ["authorId"])
    .index("by_slug", ["slug"])
    .index("by_tenant_slug", ["tenantId", "slug"])
    .index("by_pinned", ["isPinned"])
    .index("by_deleted", ["isDeleted"])
    .index("by_upvotes", ["upvoteCount"])
    .index("by_score", ["score"])
    .searchIndex("search_threads", {
      searchField: "title",
      filterFields: ["tenantId", "categoryId", "isDeleted"],
    }),

  /**
   * Forum posts
   * Individual posts within threads
   */
  forumPosts: defineTable({
    tenantId: v.optional(v.id("tenants")),
    threadId: v.id("forumThreads"),
    authorId: v.id("users"),
    content: v.string(),
    status: forumPostStatusValidator,
    isFirstPost: v.boolean(),
    editedAt: v.optional(v.number()),
    editedBy: v.optional(v.id("users")),
    likeCount: v.number(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_thread", ["threadId"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"])
    .index("by_deleted", ["isDeleted"]),

  /**
   * Forum comments
   * Comments on forum posts
   */
  forumComments: defineTable({
    tenantId: v.optional(v.id("tenants")),
    postId: v.id("forumPosts"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("forumComments")),
    content: v.string(),
    likeCount: v.number(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"])
    .index("by_deleted", ["isDeleted"]),

  /**
   * Comments — Reddit-style threaded comments on threads
   *
   * Replaces the old forumPosts + forumComments 3-level hierarchy with
   * a single Thread → Comments model that supports infinite nesting via parentId.
   */
  comments: defineTable({
    tenantId: v.optional(v.id("tenants")),
    threadId: v.id("forumThreads"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")), // For nesting
    content: v.string(),
    depth: v.number(), // 0 = top-level, 1+ = nested
    upvoteCount: v.number(),
    downvoteCount: v.number(),
    score: v.number(), // upvoteCount - downvoteCount
    replyCount: v.number(), // Direct child count (denormalized)
    isCollapsed: v.boolean(), // Mod-collapsed
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    editedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_thread", ["threadId", "createdAt"])
    .index("by_thread_score", ["threadId", "score"])
    .index("by_parent", ["parentId", "createdAt"])
    .index("by_parent_score", ["parentId", "score"])
    .index("by_author", ["authorId", "createdAt"])
    .index("by_deleted", ["isDeleted"]),

  /**
   * Forum reactions
   * Upvotes, downvotes, and bookmarks on threads/posts/comments
   */
  forumReactions: defineTable({
    tenantId: v.optional(v.id("tenants")),
    userId: v.id("users"),
    targetType: v.union(v.literal("thread"), v.literal("post"), v.literal("comment")),
    targetId: v.string(),
    reactionType: v.union(v.literal("upvote"), v.literal("downvote"), v.literal("bookmark")),
    createdAt: v.number(),
  })
    .index("by_user_target", ["userId", "targetType", "targetId"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"]),

  /**
   * Forum tags
   * Tags for categorizing threads
   */
  forumTags: defineTable({
    tenantId: v.optional(v.id("tenants")),
    name: v.string(),           // Lowercase, normalized
    displayName: v.string(),    // Display version
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),  // Hex color for badge
    usageCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_slug", ["slug"])
    .index("by_tenant_slug", ["tenantId", "slug"])
    .index("by_usage", ["usageCount"])
    .index("by_tenant", ["tenantId"]),

  /**
   * Forum thread tags
   * Junction table linking threads to tags
   */
  forumThreadTags: defineTable({
    threadId: v.id("forumThreads"),
    tagId: v.id("forumTags"),
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_tag", ["tagId"]),

  /**
   * User points
   * Gamification points for users
   */
  userPoints: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")),
    totalPoints: v.number(),
    weeklyPoints: v.number(),
    monthlyPoints: v.number(),
    level: v.number(),
    badges: v.array(v.string()),
    lastActivityAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"])
    .index("by_weekly_points", ["weeklyPoints"])
    .index("by_total_points", ["totalPoints"]),

  /**
   * Forum campaigns
   * Active campaigns for user engagement
   */
  forumCampaigns: defineTable({
    tenantId: v.optional(v.id("tenants")),
    title: v.string(),
    description: v.string(),
    prize: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    targetPoints: v.number(),
    currentProgress: v.number(),
    participantCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_end_date", ["endDate"])
    .index("by_tenant", ["tenantId"]),

  // -------------------------------------------------------------------------
  // Stripe Integration Tables
  // -------------------------------------------------------------------------

  /**
   * Stripe customers
   * Links users to Stripe customer records
   */
  stripeCustomers: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")),
    stripeCustomerId: v.string(),
    email: v.optional(v.string()),
    defaultPaymentMethodId: v.optional(v.string()),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_user_tenant", ["userId", "tenantId"]),

  /**
   * Stripe payments
   * Payment records from Stripe
   */
  stripePayments: defineTable({
    tenantId: v.optional(v.id("tenants")),
    userId: v.id("users"),
    orderId: v.optional(v.id("orders")),
    stripeCustomerId: v.string(),
    stripePaymentIntentId: v.string(),
    stripeChargeId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: paymentStatusValidator,
    paymentMethod: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    failureCode: v.optional(v.string()),
    failureMessage: v.optional(v.string()),
    refundedAmount: v.optional(v.number()),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_user", ["userId"])
    .index("by_order", ["orderId"])
    .index("by_stripe_payment_intent", ["stripePaymentIntentId"])
    .index("by_stripe_charge", ["stripeChargeId"])
    .index("by_checkout_session", ["stripeCheckoutSessionId"])
    .index("by_status", ["status"]),

  /**
   * Stripe webhook events
   * Log of processed Stripe webhook events
   */
  stripeWebhookEvents: defineTable({
    stripeEventId: v.string(),
    type: v.string(),
    processed: v.boolean(),
    processedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    // Security fix (S5): replaced v.any() for webhook event payload.
    // Stored as JSON-serialized string to avoid deeply nested arbitrary objects.
    // The raw Stripe event is complex; serializing to string is safest for audit.
    payload: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_stripe_event", ["stripeEventId"])
    .index("by_type", ["type"])
    .index("by_processed", ["processed"]),

  // -------------------------------------------------------------------------
  // Seller Tables
  // -------------------------------------------------------------------------

  /**
   * Sellers table
   * Seller profiles and business information
   */
  sellers: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")),
    businessName: v.string(),
    businessEmail: v.optional(v.string()),
    businessPhone: v.optional(v.string()),
    businessAddress: v.optional(
      v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        country: v.optional(v.string()),
      })
    ),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    stripeAccountId: v.optional(v.string()),
    stripeOnboarded: v.boolean(),
    isApproved: v.boolean(),
    approvedAt: v.optional(v.number()),
    isActive: v.boolean(),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"])
    .index("by_approved", ["isApproved"])
    .index("by_active", ["isActive"])
    .index("by_stripe_account", ["stripeAccountId"]),

  /**
   * Stripe Connect accounts
   * Links sellers to Stripe Connect accounts
   */
  stripeConnectAccounts: defineTable({
    sellerId: v.id("sellers"),
    tenantId: v.optional(v.id("tenants")),
    stripeAccountId: v.string(),
    chargesEnabled: v.boolean(),
    payoutsEnabled: v.boolean(),
    detailsSubmitted: v.boolean(),
    onboardingComplete: v.boolean(),
    accountType: v.optional(v.string()),
    businessType: v.optional(v.string()),
    country: v.optional(v.string()),
    defaultCurrency: v.optional(v.string()),
    deauthorizedAt: v.optional(v.number()),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_tenant", ["tenantId"])
    .index("by_stripe_account", ["stripeAccountId"]),

  /**
   * Stripe disputes
   * Records of payment disputes
   */
  stripeDisputes: defineTable({
    tenantId: v.optional(v.id("tenants")),
    paymentId: v.id("stripePayments"),
    orderId: v.optional(v.id("orders")),
    stripeDisputeId: v.string(),
    stripeChargeId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    reason: v.optional(v.string()),
    status: v.string(),
    evidenceDueBy: v.optional(v.number()),
    isChargeRefundable: v.optional(v.boolean()),
    closedAt: v.optional(v.number()),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_payment", ["paymentId"])
    .index("by_order", ["orderId"])
    .index("by_stripe_dispute", ["stripeDisputeId"])
    .index("by_status", ["status"]),

  // -------------------------------------------------------------------------
  // Notification Tables
  // -------------------------------------------------------------------------

  /**
   * Notifications
   * In-app notifications for user engagement events (replies, upvotes, mentions, etc.)
   */
  notifications: defineTable({
    tenantId: v.optional(v.id("tenants")),
    recipientId: v.id("users"),
    actorId: v.id("users"),
    type: v.union(
      v.literal("reply"),
      v.literal("upvote"),
      v.literal("mention"),
      v.literal("follow"),
      v.literal("thread_lock"),
      v.literal("thread_pin"),
      v.literal("mod_action"),
      v.literal("campaign")
    ),
    targetType: v.union(
      v.literal("thread"),
      v.literal("post"),
      v.literal("comment"),
      v.literal("user")
    ),
    targetId: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_recipient", ["recipientId", "createdAt"])
    .index("by_recipient_unread", ["recipientId", "read"])
    .index("by_tenant_recipient", ["tenantId", "recipientId"]),

  /**
   * Notification preferences
   * Per-user toggles for email and push notifications by type
   */
  notificationPreferences: defineTable({
    userId: v.id("users"),
    replyEmail: v.boolean(),
    replyPush: v.boolean(),
    upvoteEmail: v.boolean(),
    upvotePush: v.boolean(),
    mentionEmail: v.boolean(),
    mentionPush: v.boolean(),
    followEmail: v.boolean(),
    followPush: v.boolean(),
    campaignEmail: v.boolean(),
    campaignPush: v.boolean(),
    weeklyDigest: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // -------------------------------------------------------------------------
  // Poll Tables (Phase 3)
  // -------------------------------------------------------------------------

  /**
   * Poll votes
   * Tracks which option(s) each user voted for on poll threads
   */
  pollVotes: defineTable({
    threadId: v.id("forumThreads"),
    userId: v.id("users"),
    optionIndex: v.number(), // Which option they voted for
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_user", ["threadId", "userId"]),

  // -------------------------------------------------------------------------
  // Moderation Tables (Phase 4)
  // -------------------------------------------------------------------------

  /**
   * Reports — user-submitted reports for threads, comments, or users.
   * Moderators review pending reports and take action from the admin queue.
   */
  reports: defineTable({
    tenantId: v.optional(v.id("tenants")),
    reporterId: v.id("users"),
    targetType: v.union(
      v.literal("thread"),
      v.literal("comment"),
      v.literal("user")
    ),
    targetId: v.string(),
    targetAuthorId: v.id("users"),
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("hate_speech"),
      v.literal("misinformation"),
      v.literal("nsfw"),
      v.literal("off_topic"),
      v.literal("self_harm"),
      v.literal("violence"),
      v.literal("other")
    ),
    details: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("actioned"),
      v.literal("dismissed")
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    actionTaken: v.optional(
      v.union(
        v.literal("none"),
        v.literal("removed"),
        v.literal("warned"),
        v.literal("banned")
      )
    ),
    modNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status", "createdAt"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_reporter", ["reporterId", "createdAt"])
    .index("by_target_author", ["targetAuthorId", "createdAt"]),

  /**
   * Moderation action log — audit trail for all moderator actions.
   * Every remove, approve, lock, ban, warn, etc. is logged here.
   */
  modActions: defineTable({
    tenantId: v.optional(v.id("tenants")),
    moderatorId: v.id("users"),
    targetType: v.union(
      v.literal("thread"),
      v.literal("comment"),
      v.literal("user")
    ),
    targetId: v.string(),
    action: v.union(
      v.literal("remove"),
      v.literal("approve"),
      v.literal("lock"),
      v.literal("unlock"),
      v.literal("pin"),
      v.literal("unpin"),
      v.literal("warn"),
      v.literal("ban"),
      v.literal("unban"),
      v.literal("mute"),
      v.literal("unmute")
    ),
    reason: v.optional(v.string()),
    reportId: v.optional(v.id("reports")),
    createdAt: v.number(),
  })
    .index("by_moderator", ["moderatorId", "createdAt"])
    .index("by_target", ["targetType", "targetId", "createdAt"]),

  /**
   * User bans — tracks active/expired bans (temp or permanent).
   */
  userBans: defineTable({
    tenantId: v.optional(v.id("tenants")),
    userId: v.id("users"),
    bannedBy: v.id("users"),
    reason: v.string(),
    isPermanent: v.boolean(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "isActive"])
    .index("by_active", ["isActive", "expiresAt"]),

  // -------------------------------------------------------------------------
  // Social / Following Tables (Phase 8)
  // -------------------------------------------------------------------------

  /**
   * Follows — user-to-user follow relationships.
   * Used for "Following" feed tab and follow notifications.
   */
  follows: defineTable({
    tenantId: v.optional(v.id("tenants")),
    followerId: v.id("users"), // The user who follows
    followeeId: v.id("users"), // The user being followed
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId", "createdAt"])
    .index("by_followee", ["followeeId", "createdAt"])
    .index("by_pair", ["followerId", "followeeId"]),

  // -------------------------------------------------------------------------
  // Flair Tables (Phase 10)
  // -------------------------------------------------------------------------

  /**
   * Post flairs — moderator-managed labels per category.
   * Examples: "Solved", "Bug", "Discussion", "Tutorial"
   */
  postFlairs: defineTable({
    tenantId: v.optional(v.id("tenants")),
    categoryId: v.id("forumCategories"),
    name: v.string(),
    displayName: v.string(),
    backgroundColor: v.string(),    // e.g., "#22c55e"
    textColor: v.string(),          // e.g., "#ffffff"
    emoji: v.optional(v.string()),  // Optional emoji prefix
    isModOnly: v.boolean(),         // Can only be applied by mods
    sortOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["categoryId", "sortOrder"]),

  /**
   * User flairs — visible badges/roles on user posts within categories.
   * Examples: "Pro Seller", "Moderator", custom user-set text
   */
  userFlairs: defineTable({
    tenantId: v.optional(v.id("tenants")),
    categoryId: v.optional(v.id("forumCategories")),  // Null = global flair
    userId: v.id("users"),
    text: v.string(),              // Custom text (e.g., "Pro Seller", "Moderator")
    emoji: v.optional(v.string()), // Optional emoji
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    isCustom: v.boolean(),         // User-customized vs assigned
    assignedBy: v.optional(v.id("users")),  // If assigned by mod
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_category", ["userId", "categoryId"]),

  // -------------------------------------------------------------------------
  // Rate Limiting Tables
  // -------------------------------------------------------------------------

  /**
   * Rate limit records for database-backed rate limiting.
   *
   * Stores sliding-window counters keyed by action + identifier (e.g.,
   * "requestSellerRole:userId123"). Each record tracks the request count
   * within the current window. Expired windows are lazily reset on the
   * next check.
   *
   * @see packages/convex/convex/lib/security.ts — checkRateLimitWithDb()
   */
  rateLimitRecords: defineTable({
    /** Composite key, e.g. "createOrder:userId123" or "incrementView:productId:userId" */
    key: v.string(),
    /** Number of requests recorded in the current window */
    count: v.number(),
    /** Timestamp (ms) when the current window started */
    windowStart: v.number(),
  }).index("by_key", ["key"]),
});
