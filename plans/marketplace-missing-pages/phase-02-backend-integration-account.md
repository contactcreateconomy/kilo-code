# Phase 02 — Account Pages Backend Integration

## Goal

Replace all mock/hardcoded data in account pages with real Convex backend queries. Account pages are customer-facing and critical for post-purchase experience.

---

## Task 1: Convert Account Dashboard to Use Convex

**File:** `apps/marketplace/src/app/account/page.tsx`

**Current State:** Hardcoded `user` object and `stats` object with fake data.

**Required Changes:**
- Convert to client component (`"use client"`)
- Use `useAuth()` hook to get current user
- Fetch user profile via `api.functions.users.getCurrentUser`
- Fetch order stats: use `api.functions.orders.getUserOrders` and compute totals
- Fetch review count: use `api.functions.reviews.getUserReviews` and get length
- Add auth guard — redirect to `/auth/signin` if not authenticated
- Handle loading state with skeleton
- Handle null profile gracefully

**Backend Functions:**
- [`getCurrentUser`](../../packages/convex/convex/functions/users.ts:23)
- [`getUserOrders`](../../packages/convex/convex/functions/orders.ts:189)
- [`getUserReviews`](../../packages/convex/convex/functions/reviews.ts:168)

---

## Task 2: Convert Account Layout to Include Auth Guard

**File:** `apps/marketplace/src/app/account/layout.tsx`

**Current State:** Basic layout wrapper.

**Required Changes:**
- Add authentication check
- Redirect unauthenticated users to `/auth/signin?redirect=/account`
- Add sidebar navigation for account sub-pages:
  - Dashboard
  - Orders
  - Reviews (Phase 06)
  - Wishlist (Phase 06)
  - Downloads (Phase 06)
  - Settings

---

## Task 3: Convert Orders List Page to Use Convex

**File:** `apps/marketplace/src/app/account/orders/page.tsx`

**Current State:** Hardcoded `orders` array with 4 mock orders.

**Required Changes:**
- Convert to client component
- Fetch orders via `api.functions.orders.getUserOrders`
- Add optional status filter tabs: All, Pending, Processing, Completed, Cancelled
- Map Convex order shape to display:
  - `order.orderNumber` → Order #
  - `order.createdAt` → Date (format from epoch ms)
  - `order.status` → Status badge
  - `order.total` → Total (convert cents to dollars)
  - `order.itemCount` → Items count
- Handle loading with skeleton
- Handle empty state

**Backend Function:**
- [`getUserOrders`](../../packages/convex/convex/functions/orders.ts:189) — returns orders with `itemCount`

**Key Data Mapping:**
```
Convex order → Display:
- order._id → link to /account/orders/[id]
- order.orderNumber → "Order #ORD-XXXXXX"
- order.createdAt → formatted date
- order.total → centsToDollars(order.total)
- order.status → Badge with appropriate variant
```

---

## Task 4: Convert Order Detail Page to Use Convex

**File:** `apps/marketplace/src/app/account/orders/[id]/page.tsx`

**Current State:** Mock `getOrder()` returning hardcoded order with items.

**Required Changes:**
- Convert to client component
- Accept order ID as param (Convex ID, not string like "ord_123456")
- Fetch order via `api.functions.orders.getOrder` with `orderId`
- Display:
  - Order items with product images (from Convex)
  - Order summary (subtotal, tax, shipping, total — all in cents, convert)
  - Payment info from `order.payment`
  - Shipping address
  - Order status timeline
- Add cancel order button for pending orders using `api.functions.orders.cancelOrder`
- Handle loading and error states

**Backend Functions:**
- [`getOrder`](../../packages/convex/convex/functions/orders.ts:46) — full order with items, products, payment
- [`cancelOrder`](../../packages/convex/convex/functions/orders.ts:631) — cancel pending/confirmed orders

---

## Task 5: Convert Settings Page to Use Convex

**File:** `apps/marketplace/src/app/account/settings/page.tsx`

**Current State:** Hardcoded user data, forms don't submit.

**Required Changes:**
- Convert to client component
- Fetch current user profile via `useAuth()` hook and `getCurrentUser`
- Profile form:
  - Pre-fill with current data
  - Submit via `api.functions.users.updateUserProfile`
  - Add `displayName`, `bio`, `phone`, `address` fields
- Remove password section (auth is OAuth-based via `@convex-dev/auth`)
- Notification preferences:
  - Wire toggle switches to `updateUserProfile` preferences
- Delete account:
  - Wire to `api.functions.users.deleteAccount`
  - Add confirmation dialog before deletion
- Show success/error toast notifications on save

**Backend Functions:**
- [`getCurrentUser`](../../packages/convex/convex/functions/users.ts:23)
- [`updateUserProfile`](../../packages/convex/convex/functions/users.ts:212)
- [`deleteAccount`](../../packages/convex/convex/functions/users.ts:497)

---

## Files Modified

| File | Change Type |
|------|------------|
| `src/app/account/page.tsx` | Rewrite — client component with Convex |
| `src/app/account/layout.tsx` | Modify — add auth guard and sidebar nav |
| `src/app/account/orders/page.tsx` | Rewrite — client component with Convex |
| `src/app/account/orders/[id]/page.tsx` | Rewrite — client component with Convex |
| `src/app/account/settings/page.tsx` | Rewrite — client component with Convex |
