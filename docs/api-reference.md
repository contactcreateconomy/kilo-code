# API Reference

> API documentation for the Createconomy platform. Source of truth: `packages/convex/convex/functions/`.

---

## Overview

The platform uses [Convex](https://convex.dev) as its backend:

- **Queries** — read-only functions with real-time subscriptions
- **Mutations** — write operations with ACID transactions
- **Actions** — async operations for external API calls (Stripe, etc.)
- **HTTP Actions** — REST-like endpoints for webhooks

---

## Authentication

```typescript
// Client-side — check auth status
const { isAuthenticated, isLoading } = useConvexAuth();

// OAuth sign-in / sign-out
await signIn("google"); // or "github"
await signOut();

// Get current user
const user = useQuery(api.functions.users.getCurrentUser);
```

---

## Products

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `products.list` | query | public | List products with optional category/seller/status filter, cursor pagination |
| `products.get` | query | public | Get product by ID |
| `products.getBySlug` | query | public | Get product by URL slug |
| `products.create` | mutation | seller | Create product (price in cents) |
| `products.update` | mutation | seller | Update own product |
| `products.delete` | mutation | seller | Soft-delete own product |

**Domain modules:** `lib/products/` — repository, policies (`assertProductOwnership`), service (`validateProductSlug`, `validateProductPrice`).

---

## Categories

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `categories.list` | query | public | List all product categories (hierarchical via `parentId`) |
| `categories.get` | query | public | Get category by slug |

---

## Orders

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `orders.list` | query | auth | List current user's orders, optional status filter |
| `orders.get` | query | auth | Get order details by ID |
| `orders.create` | mutation | internal | Create order after payment confirmation |

**Domain modules:** `lib/orders/` — repository, policies, service, mappers, types.

Statuses: `pending` → `processing` → `completed` | `refunded` | `failed`

---

## Cart

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `cart.get` | query | auth | Get current cart with product details |
| `cart.addItem` | mutation | auth | Add product to cart |
| `cart.updateItem` | mutation | auth | Update item quantity |
| `cart.removeItem` | mutation | auth | Remove item from cart |
| `cart.clear` | mutation | auth | Clear entire cart |

---

## Reviews

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `reviews.list` | query | public | List reviews for a product (includes `averageRating`, `totalCount`) |
| `reviews.create` | mutation | auth | Create review (must have purchased product) |

---

## Forum

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `forum.getCategories` | query | public | List forum categories (tree structure) |
| `forum.getThreads` | query | public | List threads by category, sortBy: `recent` / `popular` / `unanswered` |
| `forum.getThread` | query | public | Get thread with posts |
| `forum.createThread` | mutation | auth | Create thread in a category |
| `forum.createPost` | mutation | auth | Reply to a thread (supports nested replies via `parentId`) |
| `forum.toggleReaction` | mutation | auth | Upvote/downvote/bookmark a thread, post, or comment |
| `forum.getLeaderboard` | query | public | Community leaderboard by points |
| `forum.getCommunityStats` | query | public | Aggregate community statistics |

**Domain modules:** `lib/forum/` — repository (~25 DB functions), policies (`canEditThread`, `canDeletePost`, etc.), service (slug generation, scoring, sorting), mappers (`toThreadListItem`, `toCommentTree`, `toCategoryTree`), types.

**Shared utilities:** `lib/shared/author.ts` — `enrichAuthor()`, `enrichAuthorBatch()` for consistent author display across all domains.

---

## Users

| Function | Type | Auth | Description |
|----------|------|------|-------------|
| `users.getCurrentUser` | query | auth | Get authenticated user with profile |
| `users.updateProfile` | mutation | auth | Update display name, bio, avatar, etc. |
| `users.getProfile` | query | public | Get user profile by username |
| `users.searchUsers` | query | admin | Search users by name/email |

**Domain modules:** `lib/users/` — repository (`getProfileByUserId`, `getSellerByUserId`, `upsertProfile`), policies (`assertTenantAdmin`), service (`buildProfilePatch`, `buildSellerProfilePatch`).

---

## Admin Functions

> Require admin role via `adminMutation` / `adminQuery` middleware.

| Function | Type | Description |
|----------|------|-------------|
| `admin.getStats` | query | Platform statistics (users, sellers, products, orders, revenue) |
| `admin.getUsers` | query | List/search users with role filter |
| `admin.updateUserRole` | mutation | Change user role |
| `admin.moderateContent` | mutation | Approve/reject/flag content |
| `moderation.banUser` | mutation | Ban a user |
| `moderation.dismissReport` | mutation | Dismiss a content report |

---

## HTTP Endpoints

Defined in `packages/convex/convex/http.ts`.

### Stripe Webhooks — `POST /webhooks/stripe`

| Event | Description |
|-------|-------------|
| `payment_intent.succeeded` | Payment completed |
| `payment_intent.payment_failed` | Payment failed |
| `checkout.session.completed` | Checkout completed |
| `account.updated` | Connected account updated |
| `payout.paid` | Payout sent to seller |
| `charge.refunded` | Charge refunded |

### Auth Callbacks — `GET /api/auth/callback/:provider`

OAuth callback for `google` and `github` providers.

### Session Endpoints

Cross-subdomain session management via custom `sessions` table. See `http.ts` for `createSession`, `refreshSession`, `revokeSession`.

---

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Queries | 1000 | 1 minute |
| Mutations | 100 | 1 minute |
| Actions | 50 | 1 minute |
| Auth (login) | 5 | 15 minutes |
| Auth (register) | 3 | 1 hour |

Rate limiting is DB-backed via `rateLimitRecords` table and `checkRateLimitWithDb()`.

---

## Error Handling

Error format: `"ERROR_CODE: Human-readable message"`

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input |
| `RATE_LIMITED` | Too many requests |

Errors are thrown from `lib/errors.ts` using `createError(ErrorCode, message)`.

---

## Related Docs

- [Architecture](./architecture.md) | [Data Models](./data-models.md) | [Conventions](./conventions.md) | [Security](./security.md)
