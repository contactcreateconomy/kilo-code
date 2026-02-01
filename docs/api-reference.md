# API Reference

> Complete API documentation for the Createconomy platform.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Convex Functions](#convex-functions)
- [HTTP Endpoints](#http-endpoints)
- [Webhook Endpoints](#webhook-endpoints)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)

---

## Overview

The Createconomy platform uses [Convex](https://convex.dev) as its backend, providing:

- **Queries**: Read-only functions with real-time subscriptions
- **Mutations**: Write operations with ACID transactions
- **Actions**: Async operations for external API calls
- **HTTP Actions**: REST-like endpoints for webhooks and external integrations

### Base URLs

| Environment | Convex URL |
|-------------|------------|
| Production | `https://your-deployment.convex.cloud` |
| Development | `https://your-dev-deployment.convex.cloud` |

---

## Authentication

### Session Management

All authenticated requests require a valid session token obtained through the authentication flow.

```typescript
// Client-side authentication
import { useConvexAuth } from "convex/react";

function Component() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <SignIn />;
  
  return <AuthenticatedContent />;
}
```

### Auth Endpoints

#### Sign In with OAuth

```typescript
// Using Convex Auth
import { signIn } from "@convex-dev/auth/react";

// Google OAuth
await signIn("google");

// GitHub OAuth
await signIn("github");
```

#### Sign Out

```typescript
import { signOut } from "@convex-dev/auth/react";

await signOut();
```

#### Get Current User

```typescript
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

const user = useQuery(api.functions.users.getCurrentUser);
```

---

## Convex Functions

### Products

#### `products.list`

List products with optional filtering.

```typescript
// Query
const products = useQuery(api.functions.products.list, {
  categoryId: "category_123",  // optional
  sellerId: "seller_456",      // optional
  status: "active",            // optional: "active" | "draft" | "archived"
  limit: 20,                   // optional, default: 20
  cursor: "cursor_abc",        // optional, for pagination
});
```

**Response:**
```typescript
{
  products: Product[];
  nextCursor: string | null;
}
```

#### `products.get`

Get a single product by ID.

```typescript
const product = useQuery(api.functions.products.get, {
  id: "product_123",
});
```

**Response:**
```typescript
{
  _id: Id<"products">;
  name: string;
  description: string;
  price: number;
  sellerId: Id<"sellers">;
  categoryId: Id<"categories">;
  images: string[];
  files: { name: string; url: string; size: number }[];
  status: "active" | "draft" | "archived";
  createdAt: number;
  updatedAt: number;
}
```

#### `products.create`

Create a new product (seller only).

```typescript
const productId = await mutation(api.functions.products.create, {
  name: "Digital Art Pack",
  description: "A collection of digital art assets",
  price: 2999, // in cents
  categoryId: "category_123",
  images: ["https://..."],
  files: [{ name: "assets.zip", storageId: "storage_123" }],
});
```

#### `products.update`

Update an existing product (seller only).

```typescript
await mutation(api.functions.products.update, {
  id: "product_123",
  name: "Updated Name",
  price: 3999,
  // ... other fields
});
```

#### `products.delete`

Delete a product (seller only).

```typescript
await mutation(api.functions.products.delete, {
  id: "product_123",
});
```

---

### Categories

#### `categories.list`

List all categories.

```typescript
const categories = useQuery(api.functions.categories.list);
```

**Response:**
```typescript
{
  _id: Id<"categories">;
  name: string;
  slug: string;
  description: string;
  parentId: Id<"categories"> | null;
  productCount: number;
}[]
```

#### `categories.get`

Get a category by slug.

```typescript
const category = useQuery(api.functions.categories.get, {
  slug: "digital-art",
});
```

---

### Orders

#### `orders.list`

List orders for the current user.

```typescript
const orders = useQuery(api.functions.orders.list, {
  status: "completed", // optional
  limit: 10,
});
```

**Response:**
```typescript
{
  orders: Order[];
  nextCursor: string | null;
}
```

#### `orders.get`

Get order details.

```typescript
const order = useQuery(api.functions.orders.get, {
  id: "order_123",
});
```

**Response:**
```typescript
{
  _id: Id<"orders">;
  userId: Id<"users">;
  items: {
    productId: Id<"products">;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: "pending" | "processing" | "completed" | "refunded" | "failed";
  paymentIntentId: string;
  createdAt: number;
}
```

#### `orders.create`

Create a new order (internal use, called after payment).

```typescript
const orderId = await mutation(api.functions.orders.create, {
  items: [
    { productId: "product_123", quantity: 1 },
  ],
  paymentIntentId: "pi_123",
});
```

---

### Cart

#### `cart.get`

Get the current user's cart.

```typescript
const cart = useQuery(api.functions.cart.get);
```

**Response:**
```typescript
{
  _id: Id<"carts">;
  items: {
    productId: Id<"products">;
    product: Product;
    quantity: number;
  }[];
  total: number;
}
```

#### `cart.addItem`

Add an item to the cart.

```typescript
await mutation(api.functions.cart.addItem, {
  productId: "product_123",
  quantity: 1,
});
```

#### `cart.updateItem`

Update item quantity.

```typescript
await mutation(api.functions.cart.updateItem, {
  productId: "product_123",
  quantity: 2,
});
```

#### `cart.removeItem`

Remove an item from the cart.

```typescript
await mutation(api.functions.cart.removeItem, {
  productId: "product_123",
});
```

#### `cart.clear`

Clear the entire cart.

```typescript
await mutation(api.functions.cart.clear);
```

---

### Reviews

#### `reviews.list`

List reviews for a product.

```typescript
const reviews = useQuery(api.functions.reviews.list, {
  productId: "product_123",
  limit: 10,
});
```

**Response:**
```typescript
{
  reviews: {
    _id: Id<"reviews">;
    userId: Id<"users">;
    user: { name: string; avatar: string };
    rating: number;
    title: string;
    content: string;
    createdAt: number;
  }[];
  averageRating: number;
  totalCount: number;
}
```

#### `reviews.create`

Create a review (must have purchased the product).

```typescript
await mutation(api.functions.reviews.create, {
  productId: "product_123",
  rating: 5,
  title: "Great product!",
  content: "Highly recommended...",
});
```

---

### Forum

#### `forum.getCategories`

List forum categories.

```typescript
const categories = useQuery(api.functions.forum.getCategories);
```

#### `forum.getThreads`

List threads in a category.

```typescript
const threads = useQuery(api.functions.forum.getThreads, {
  categorySlug: "general",
  sortBy: "recent", // "recent" | "popular" | "unanswered"
  limit: 20,
});
```

#### `forum.getThread`

Get a thread with its posts.

```typescript
const thread = useQuery(api.functions.forum.getThread, {
  id: "thread_123",
});
```

#### `forum.createThread`

Create a new thread.

```typescript
const threadId = await mutation(api.functions.forum.createThread, {
  categoryId: "category_123",
  title: "How to get started?",
  content: "I'm new here and...",
});
```

#### `forum.createPost`

Reply to a thread.

```typescript
await mutation(api.functions.forum.createPost, {
  threadId: "thread_123",
  content: "Welcome! Here's how...",
  parentId: "post_456", // optional, for nested replies
});
```

---

### Users

#### `users.getCurrentUser`

Get the current authenticated user.

```typescript
const user = useQuery(api.functions.users.getCurrentUser);
```

**Response:**
```typescript
{
  _id: Id<"users">;
  email: string;
  name: string;
  avatar: string;
  role: "user" | "seller" | "admin";
  createdAt: number;
}
```

#### `users.updateProfile`

Update user profile.

```typescript
await mutation(api.functions.users.updateProfile, {
  name: "New Name",
  avatar: "https://...",
});
```

---

### Admin Functions

> These functions require admin role.

#### `admin.getStats`

Get platform statistics.

```typescript
const stats = useQuery(api.functions.admin.getStats);
```

**Response:**
```typescript
{
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}
```

#### `admin.getUsers`

List all users with filtering.

```typescript
const users = useQuery(api.functions.admin.getUsers, {
  role: "seller",
  search: "john",
  limit: 50,
});
```

#### `admin.updateUserRole`

Update a user's role.

```typescript
await mutation(api.functions.admin.updateUserRole, {
  userId: "user_123",
  role: "seller",
});
```

#### `admin.moderateContent`

Moderate content (products, reviews, posts).

```typescript
await mutation(api.functions.admin.moderateContent, {
  type: "product",
  id: "product_123",
  action: "approve", // "approve" | "reject" | "flag"
  reason: "Approved for marketplace",
});
```

---

## HTTP Endpoints

### Stripe Webhooks

#### `POST /api/webhooks/stripe`

Handles Stripe webhook events.

**Headers:**
```
Stripe-Signature: t=...,v1=...
Content-Type: application/json
```

**Supported Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`
- `account.updated`
- `payout.paid`

---

### Auth Callbacks

#### `GET /api/auth/callback/:provider`

OAuth callback handler.

**Providers:**
- `google`
- `github`

---

## Webhook Endpoints

### Stripe Webhook Handler

```typescript
// packages/convex/convex/http.ts
import { httpRouter } from "convex/server";
import { stripeWebhook } from "./functions/webhooks";

const http = httpRouter();

http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
```

### Webhook Event Types

| Event | Description |
|-------|-------------|
| `payment_intent.succeeded` | Payment completed successfully |
| `payment_intent.payment_failed` | Payment failed |
| `checkout.session.completed` | Checkout session completed |
| `account.updated` | Connected account updated |
| `payout.paid` | Payout sent to seller |
| `charge.refunded` | Charge was refunded |

---

## Rate Limits

### Default Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Queries | 1000 | 1 minute |
| Mutations | 100 | 1 minute |
| Actions | 50 | 1 minute |
| HTTP Actions | 100 | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1612345678
```

### Rate Limit Response

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Error Handling

### Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Handling Example

```typescript
import { useMutation } from "convex/react";
import { api } from "@createconomy/convex";

function CreateProduct() {
  const createProduct = useMutation(api.functions.products.create);
  
  const handleSubmit = async (data: ProductData) => {
    try {
      await createProduct(data);
    } catch (error) {
      if (error.message.includes("VALIDATION_ERROR")) {
        // Handle validation error
      } else if (error.message.includes("UNAUTHORIZED")) {
        // Redirect to login
      } else {
        // Handle generic error
      }
    }
  };
}
```

---

## TypeScript Types

### Core Types

```typescript
// Product
interface Product {
  _id: Id<"products">;
  name: string;
  description: string;
  price: number;
  sellerId: Id<"sellers">;
  categoryId: Id<"categories">;
  images: string[];
  files: ProductFile[];
  status: ProductStatus;
  createdAt: number;
  updatedAt: number;
}

type ProductStatus = "active" | "draft" | "archived";

interface ProductFile {
  name: string;
  storageId: Id<"_storage">;
  size: number;
  type: string;
}

// Order
interface Order {
  _id: Id<"orders">;
  userId: Id<"users">;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentIntentId: string;
  createdAt: number;
}

type OrderStatus = "pending" | "processing" | "completed" | "refunded" | "failed";

interface OrderItem {
  productId: Id<"products">;
  name: string;
  price: number;
  quantity: number;
}

// User
interface User {
  _id: Id<"users">;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: number;
}

type UserRole = "user" | "seller" | "admin";
```

---

## Related Documentation

- [Architecture Overview](./architecture.md)
- [Security Guide](./security.md)
- [Contributing Guide](./contributing.md)
