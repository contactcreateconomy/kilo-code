# Phase 2: Bug Fixes and Logic Errors

## Finding B1: Race Condition in Order Creation - Inventory Deduction - HIGH

**File**: [`packages/convex/convex/functions/orders.ts`](../packages/convex/convex/functions/orders.ts:370)

**Problem**: The `createOrder` mutation reads product inventory, validates it, then later reads the product AGAIN before deducting inventory. Between these reads, another concurrent order could have reduced inventory below the required amount. The second `ctx.db.get()` at line 444 re-fetches stale data.

**Root Cause**: The inventory check at line 377-380 and the inventory deduction at line 444-449 operate on different reads of the same document. Additionally, the `salesCount` update at line 452-456 does a separate `ctx.db.patch()` that could overwrite changes from the first patch.

**Current Code** (simplified):
```typescript
// First read - validate inventory
const product = await ctx.db.get(cartItem.productId);
if (product.inventory < cartItem.quantity) { throw ... }

// ... later, separate read and two patches
const product = await ctx.db.get(itemData.productId);
await ctx.db.patch(itemData.productId, {
  inventory: product.inventory - itemData.quantity,
});
await ctx.db.patch(itemData.productId, {
  salesCount: product.salesCount + itemData.quantity,
});
```

**Fix**: Combine inventory deduction and sales count update into a single `patch()` call, and remove the redundant second read. Convex mutations are transactional, so the first read is sufficient.

### Tasks
- [ ] Remove the second `ctx.db.get()` call in the order items loop
- [ ] Combine inventory deduction and sales count into a single `ctx.db.patch()`
- [ ] Use the product data already fetched during validation

---

## Finding B2: HTTP Endpoint Calls Non-Existent Functions - HIGH

**File**: [`packages/convex/convex/http.ts`](../packages/convex/convex/http.ts:253)

**Problem**: The HTTP routes reference functions that do not exist in the codebase:
- Line 253: `api.functions.sessions.refreshSession` is called with `{ token, rotateToken }` but the actual `refreshSession` mutation in `auth.ts:325` only accepts `{ token: v.string() }` - no `rotateToken` parameter.
- Line 327: `api.functions.sessions.revokeAllSessions` does not exist. The actual function is `invalidateAllUserSessions` and it takes no `userId` argument.
- Line 333: `api.functions.sessions.revokeSession` does not exist. The actual function is `invalidateSession`.
- Line 389: `api.functions.sessions.getActiveSessions` does not exist. The actual function is `getUserSessions` and takes no `userId` argument.

**Root Cause**: HTTP routes were written assuming a session functions module at `functions/sessions.ts` that either does not exist or has a different API than what the HTTP layer expects.

**Fix**: Either create the missing `functions/sessions.ts` module, or update the HTTP routes to call the correct functions from `auth.ts`.

### Tasks
- [ ] Create `packages/convex/convex/functions/sessions.ts` with proper exports matching HTTP route expectations
- [ ] OR update HTTP routes to reference correct function names from `auth.ts`
- [ ] Ensure function signatures match what the HTTP routes pass
- [ ] Test all auth HTTP endpoints end-to-end

---

## Finding B3: OAuth Callback is Unimplemented - HIGH

**File**: [`packages/convex/convex/http.ts`](../packages/convex/convex/http.ts:750)

**Problem**: The `GET /auth/callback` endpoint contains placeholder code with a comment "In production, you would..." but just redirects to a `/auth/success` page. This means OAuth callbacks silently succeed without actually completing the auth flow.

**Current Code**:
```typescript
// For now, redirect to success page
const successUrl = new URL("/auth/success", url.origin);
return Response.redirect(successUrl.toString(), 302);
```

**Fix**: Since Convex Auth handles OAuth via `auth.addHttpRoutes(http)`, this custom `/auth/callback` route likely conflicts with or duplicates the built-in handling. Either implement it properly or remove it.

### Tasks
- [ ] Determine if `auth.addHttpRoutes(http)` already handles OAuth callbacks
- [ ] If yes, remove the custom `/auth/callback` route
- [ ] If no, implement the full OAuth code exchange flow

---

## Finding B4: Review Approval Rating Calculation Off-By-One - MEDIUM

**File**: [`packages/convex/convex/functions/admin.ts`](../packages/convex/convex/functions/admin.ts:606)

**Problem**: In `moderateReview`, when approving a review, the code queries for already-approved reviews to calculate the new average rating. However, the review being approved has not yet been updated in the database at the time of the query, so it is NOT included in the count. This means:
1. The average is calculated WITHOUT the newly approved review
2. The `reviewCount` is set to the count WITHOUT the new review

**Current Code**:
```typescript
// First: mark as approved
await ctx.db.patch(args.reviewId, { isApproved: true, updatedAt: now });

// Then: query approved reviews (now includes the just-approved one)
const allReviews = await ctx.db
  .query("reviews")
  .withIndex("by_product_approved", (q) => 
    q.eq("productId", review.productId).eq("isApproved", true)
  )
  .filter((q) => q.eq(q.field("isDeleted"), false))
  .collect();
```

**Note**: Actually, since the patch happens before the query within the same mutation, Convex should see the updated document. This is likely correct. However, the pattern is fragile - re-verify this behavior with Convex's consistency model.

### Tasks
- [ ] Verify that Convex read-after-write within a mutation returns updated data
- [ ] Add a unit test for review approval rating calculation
- [ ] Consider computing the new average mathematically instead of re-querying all reviews

---

## Finding B5: Order Number Generation is Not Unique - MEDIUM

**Files**: 
- [`packages/convex/convex/functions/orders.ts`](../packages/convex/convex/functions/orders.ts:406)
- [`packages/convex/convex/functions/stripe.ts`](../packages/convex/convex/functions/stripe.ts:643)

**Problem**: Order numbers are generated as `ORD-${Date.now()}-${Math.random()...}`. `Math.random()` provides only ~52 bits of entropy and is not guaranteed unique. Two simultaneous order creations could generate the same number. The `orders` table has a `by_order_number` index but no uniqueness constraint is enforced in application code.

**Fix**: Use a counter-based approach or UUID for order numbers. At minimum, check for collisions.

### Tasks
- [ ] Replace `Math.random()` in order number generation with `crypto.randomUUID()`
- [ ] Add collision detection: check if order number exists before inserting
- [ ] Standardize order number format across both `orders.ts` and `stripe.ts`

---

## Finding B6: requestSellerRole Bypasses Approval Process - MEDIUM

**File**: [`packages/convex/convex/functions/users.ts`](../packages/convex/convex/functions/users.ts:404)

**Problem**: The `requestSellerRole` mutation immediately upgrades the user to seller role. The comment says "In production, this would create a pending request" but the code does the upgrade directly. This means any authenticated user can become a seller without approval.

**Fix**: Implement a proper approval workflow with a pending state.

### Tasks
- [ ] Add a `sellerApplications` table or a `pendingSellerRequest` field to `userProfiles`
- [ ] Change `requestSellerRole` to create a pending request instead of direct upgrade
- [ ] Add admin mutation to approve/reject seller requests
- [ ] Add query for admin to list pending seller requests
