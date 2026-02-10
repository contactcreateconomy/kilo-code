# Phase 02: Seller App — Remove Mock Data & Integrate Convex Backend

## Goal
Replace all hardcoded/mock data in the seller app with real Convex backend queries and mutations. Some seller pages (affiliates, discounts, posts, webhooks) are already integrated — this phase focuses on the remaining mock-data pages.

## Pre-requisites
- Phase 01 completed (some shared backend functions created there)
- Convex dev server running
- Seller app running (`pnpm --filter @createconomy/seller dev`)

---

## Already Integrated Pages (No Changes Needed)

These seller pages already use `useQuery`/`useMutation` with Convex:
- [`affiliates/page.tsx`](../../apps/seller/src/app/affiliates/page.tsx) — `api.functions.affiliates.getSellerAffiliates`
- [`discounts/page.tsx`](../../apps/seller/src/app/discounts/page.tsx) — `api.functions.offerCodes.*`
- [`posts/page.tsx`](../../apps/seller/src/app/posts/page.tsx) — `api.functions.sellerPosts.*`
- [`settings/webhooks/page.tsx`](../../apps/seller/src/app/settings/webhooks/page.tsx) — `api.functions.webhookEndpoints.*`
- [`payouts/page.tsx`](../../apps/seller/src/app/payouts/page.tsx) — Uses Stripe API directly (correct)

---

## Task 1: Seller Dashboard Page — Wire Up Real Stats

**File:** [`apps/seller/src/app/(dashboard)/dashboard/page.tsx`](../../apps/seller/src/app/(dashboard)/dashboard/page.tsx)

**Current state:** Hardcoded values: `$12,450.00`, `156`, `42`, `8,432`

**Required changes:**
1. Convert to `"use client"` component
2. Create or use a seller-specific dashboard stats query (e.g., `orders.getSellerDashboardStats`)
3. Replace hardcoded `SalesCard` values with real data:
   - `Total Sales` → sum of seller's completed order totals (in cents, convert to dollars)
   - `Orders` → count of seller's orders
   - `Products` → count of seller's active products
   - `Views` → may need new tracking or omit
4. Show loading skeletons while data loads
5. Remove hardcoded trend percentages or compute from date-range comparison

---

## Task 2: Seller Revenue Chart — Wire Up Real Data

**File:** [`apps/seller/src/components/dashboard/revenue-chart.tsx`](../../apps/seller/src/components/dashboard/revenue-chart.tsx)

**Current state:** Hardcoded monthly array with fake seller revenue

**Required changes:**
1. Accept `data` prop or fetch from backend
2. Need a backend query to aggregate seller's order totals by month
3. If no data, show empty state instead of fake chart
4. Delete the hardcoded `data` constant

---

## Task 3: Seller Recent Orders Widget — Wire Up Real Data

**File:** [`apps/seller/src/components/dashboard/recent-orders.tsx`](../../apps/seller/src/components/dashboard/recent-orders.tsx)

**Current state:** Hardcoded array of 5 fake orders

**Required changes:**
1. Convert to `"use client"` component
2. Query seller's recent orders from `api.functions.orders.getSellerOrders` (with limit: 5)
3. Map real data to table format
4. Show loading skeleton and empty state
5. Delete hardcoded `recentOrders` array

---

## Task 4: Low Stock Alert Widget — Wire Up Real Data

**File:** [`apps/seller/src/components/dashboard/low-stock-alert.tsx`](../../apps/seller/src/components/dashboard/low-stock-alert.tsx)

**Current state:** Hardcoded array of 4 fake low-stock products

**Required changes:**
1. Convert to `"use client"` component
2. Query seller's products filtered by low stock from Convex
3. May need a new backend query: `products.getSellerLowStockProducts`
4. Show empty state text "All products are well stocked" when no results
5. Delete hardcoded `lowStockProducts` array

---

## Task 5: Seller Products Page — Wire Up Real Data

**File:** [`apps/seller/src/app/products/page.tsx`](../../apps/seller/src/app/products/page.tsx)

**Current state:** Hardcoded `mockProducts` array of 4 products with `/placeholder-product.jpg` images

**Required changes:**
1. Query seller's products from `api.functions.products.getSellerProducts` or similar
2. Implement search, status filter, and category filter using query args
3. Show product images from Convex storage (or placeholder if none)
4. Wire up the "New Product" link
5. Show loading skeleton and empty state
6. Delete `mockProducts` array

---

## Task 6: Product Detail Page — Wire Up Real Data

**File:** [`apps/seller/src/app/products/[id]/page.tsx`](../../apps/seller/src/app/products/[id]/page.tsx)

**Current state:** Hardcoded product object with fake data

**Required changes:**
1. Query product by ID from Convex
2. Verify the product belongs to the current seller
3. Show real product data, images, tags
4. Wire up edit, delete, status change actions
5. Delete hardcoded data

---

## Task 7: Product Images Page — Wire Up Real Data

**File:** [`apps/seller/src/app/products/[id]/images/page.tsx`](../../apps/seller/src/app/products/[id]/images/page.tsx)

**Current state:** Hardcoded array of 3 images all using `/placeholder-product.jpg`

**Required changes:**
1. Query product images from `productImages` table via Convex
2. Wire up image upload, delete, reorder, set-primary actions
3. Show empty state if no images
4. Delete hardcoded images array

---

## Task 8: Seller Orders Page — Wire Up Real Data

**File:** [`apps/seller/src/app/orders/page.tsx`](../../apps/seller/src/app/orders/page.tsx)

**Current state:** Hardcoded `mockOrders` array of 6 orders

**Required changes:**
1. Query seller's orders from `api.functions.orders.getSellerOrders`
2. Implement status tab filtering
3. Implement search by order ID or customer name
4. Compute real status counts from data
5. Show loading skeleton and empty state
6. Delete `mockOrders` array

---

## Task 9: Order Detail Page — Wire Up Real Data

**File:** [`apps/seller/src/app/orders/[id]/page.tsx`](../../apps/seller/src/app/orders/[id]/page.tsx)

**Current state:** Hardcoded order object with fake items and `/placeholder-product.jpg`

**Required changes:**
1. Query order by ID from Convex
2. Verify order belongs to current seller
3. Query order items
4. Wire up shipping form with real mutation
5. Show real customer info, products, amounts
6. Delete hardcoded data

---

## Task 10: Seller Reviews Page — Wire Up Real Data

**File:** [`apps/seller/src/app/reviews/page.tsx`](../../apps/seller/src/app/reviews/page.tsx)

**Current state:** Hardcoded `mockReviews` array of 5 reviews

**Required changes:**
1. Query reviews for seller's products from `api.functions.reviews.*`
2. Implement rating filter
3. Compute real stats (average rating, total, pending responses)
4. Show loading skeleton and empty state
5. Delete `mockReviews` array

---

## Task 11: Review Detail Page — Wire Up Real Data

**File:** [`apps/seller/src/app/reviews/[id]/page.tsx`](../../apps/seller/src/app/reviews/[id]/page.tsx)

**Current state:** Hardcoded `review` object with `/placeholder-product.jpg`

**Required changes:**
1. Query review by ID from Convex
2. Show real review data, product info, customer info
3. Wire up seller response submission
4. Delete hardcoded data

---

## Task 12: Seller Analytics Page — Wire Up Real Data

**File:** [`apps/seller/src/app/analytics/page.tsx`](../../apps/seller/src/app/analytics/page.tsx)

**Current state:** Hardcoded stats, topProducts, and customer insights — all fake numbers

**Required changes:**
1. Query seller dashboard stats from backend
2. Top products — query from orders/products data
3. Customer insights — may need new backend function or compute from orders
4. If data unavailable, show empty states
5. Delete all hardcoded data constants

---

## New Backend Functions Needed

Create in `packages/convex/convex/functions/` as appropriate:

1. **`orders.getSellerOrders`** — List orders for authenticated seller with pagination and status filter
2. **`orders.getSellerOrderById`** — Get single order by ID for seller view
3. **`orders.getSellerDashboardStats`** — Aggregate seller stats (total sales, order count, etc.)
4. **`products.getSellerProducts`** — List seller's products with pagination, status, search
5. **`products.getSellerLowStockProducts`** — Products below stock threshold
6. **`reviews.getSellerReviews`** — Reviews on seller's products
7. **`reviews.getSellerReviewById`** — Single review for seller view
8. **`reviews.addSellerResponse`** — Seller response to a review

> Note: Some of these may already exist in the codebase — check before creating duplicates.

---

## Validation Checklist
- [ ] Zero hardcoded data arrays remain in seller app
- [ ] All pages show loading skeletons while data loads
- [ ] All pages show empty states when no data exists
- [ ] All pages verify seller ownership of data
- [ ] No `/placeholder-product.jpg` references remain
- [ ] Pagination works with real data counts
- [ ] Search/filter controls actually filter data
- [ ] `pnpm typecheck` passes for seller app
- [ ] `pnpm lint` passes for seller app
