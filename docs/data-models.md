# Data Models & Schema

> Database schema reference for the Createconomy platform. Source of truth: `packages/convex/convex/schema.ts`.

All tables include `createdAt`/`updatedAt` (epoch ms). Multi-tenant tables have optional `tenantId`.

---

## Core Tables

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `users` | (from `@convex-dev/auth` authTables) | — |
| `userProfiles` | `userId`, `username`, `defaultRole`, `isBanned` | → `users` |
| `tenants` | `name`, `slug`, `domain`, `subdomain` | — |
| `userTenants` | `userId`, `tenantId`, `role` | → `users`, `tenants` |
| `sessions` | `userId`, `token`, `expiresAt`, `isActive` | → `users` |

---

## Commerce Tables

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `products` | `sellerId`, `name`, `slug`, `price` (cents), `status`, `isDeleted` | → `users`, `productCategories` |
| `productCategories` | `name`, `slug`, `parentId` | self-referential hierarchy |
| `productImages` | `productId`, `url`, `isPrimary`, `sortOrder` | → `products` |
| `productViews` | `productId`, `viewerId`, `viewedAt` | → `products` |
| `orders` | `userId`, `orderNumber`, `status`, `total` (cents) | → `users` |
| `orderItems` | `orderId`, `productId`, `sellerId`, `price`, `quantity` | → `orders`, `products`, `users` |
| `carts` | `userId`, `sessionId`, `subtotal`, `itemCount` | → `users` |
| `cartItems` | `cartId`, `productId`, `quantity`, `price` | → `carts`, `products` |
| `reviews` | `productId`, `userId`, `rating`, `isApproved`, `isDeleted` | → `products`, `users` |
| `sellers` | `userId`, `businessName`, `stripeAccountId`, `isApproved` | → `users` |

---

## Forum Tables

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `forumCategories` | `name`, `slug`, `threadCount`, `postCount` | self-referential via `parentId` |
| `forumThreads` | `categoryId`, `authorId`, `title`, `slug`, `isPinned`, `isLocked`, `isDeleted` | → `forumCategories`, `users` |
| `forumPosts` | `threadId`, `authorId`, `content`, `status`, `isDeleted` | → `forumThreads`, `users` |
| `forumComments` | `postId`, `authorId`, `parentId`, `isDeleted` | → `forumPosts`, `users`, self-referential |
| `forumReactions` | `userId`, `targetType`, `targetId`, `reactionType` | → `users` |
| `forumTags` / `forumThreadTags` | tag + thread junction | → `forumThreads` |
| `userPoints` | `userId`, `totalPoints`, `level`, `badges` | → `users` |
| `forumCampaigns` | `title`, `prize`, `targetPoints`, `isActive` | — |

---

## Stripe Tables

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `stripeCustomers` | `userId`, `stripeCustomerId` | → `users` |
| `stripePayments` | `userId`, `orderId`, `stripePaymentIntentId`, `status` | → `users`, `orders` |
| `stripeWebhookEvents` | `stripeEventId`, `type`, `processed`, `payload` (JSON string) | — |
| `stripeConnectAccounts` | `sellerId`, `stripeAccountId`, `onboardingComplete` | → `sellers` |
| `stripeDisputes` | `paymentId`, `stripeDisputeId`, `status` | → `stripePayments` |

---

## Other Tables

| Table | Purpose |
|-------|---------|
| `rateLimitRecords` | DB-backed sliding-window rate limiting. Key = `"action:identifier"` |

---

## Search Indexes

- `products.search_products` — full-text on `name`, filters: `tenantId`, `categoryId`, `status`, `isDeleted`
- `forumThreads.search_threads` — full-text on `title`, filters: `tenantId`, `categoryId`, `isDeleted`

---

## Important Notes

1. **All prices in cents** (integer). Use `centsToDollars()` / `dollarsToCents()` from `lib/stripe.ts`.
2. **Soft-delete pattern**: set `isDeleted: true, deletedAt: Date.now()` — never hard-delete from client code. A daily cron permanently removes records >30 days old.
3. **`v.any()` is banned** in the schema. Use `metadataValidator` (record of string→string|number|boolean|null). The `stripeWebhookEvents.payload` is stored as a JSON string, not an object.
4. **`convex/_generated/` is auto-generated** — never edit files in this directory. Run `npx convex dev` to regenerate.

---

## Related Docs

- [Architecture Overview](./architecture.md)
- [API Reference](./api-reference.md)
- [Conventions & Patterns](./conventions.md)
