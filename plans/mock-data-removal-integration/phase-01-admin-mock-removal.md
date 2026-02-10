# Phase 01: Admin App — Remove Mock Data & Integrate Convex Backend

## Goal
Replace all hardcoded/mock data in the admin app with real Convex backend queries and mutations. The admin backend functions in `packages/convex/convex/functions/admin.ts` already exist — they just need to be wired up.

## Pre-requisites
- Convex dev server running (`cd packages/convex && npx convex dev`)
- Admin app running (`pnpm --filter @createconomy/admin dev`)

---

## Task 1: Dashboard Page — Wire Up Real Stats

**File:** [`apps/admin/src/app/(dashboard)/page.tsx`](../../apps/admin/src/app/(dashboard)/page.tsx)

**Current state:** Hardcoded values like `$45,231.89`, `2,350`, `12,234`, `573`

**Required changes:**
1. Convert from server component to `"use client"` component
2. Import `useQuery` from `convex/react` and `api` from `@createconomy/convex`
3. Call `api.functions.admin.getDashboardStats` to get real stats
4. Replace hardcoded `StatsCard` values with data from the query:
   - `Total Revenue` → `centsToDollars(stats.revenue.total)` 
   - `Orders` → `stats.orders.total`
   - `Active Users` → `stats.users.total`
   - `Products` → `stats.products.active`
5. Show loading skeletons while data loads
6. Remove hardcoded trend percentages — compute from backend data or omit

---

## Task 2: Revenue Chart — Wire Up Real Data

**File:** [`apps/admin/src/components/dashboard/revenue-chart.tsx`](../../apps/admin/src/components/dashboard/revenue-chart.tsx)

**Current state:** Hardcoded monthly array with fake revenue numbers

**Required changes:**
1. Accept `data` as a prop OR fetch from a new Convex query
2. If no backend analytics time-series query exists yet, create `admin.getMonthlyRevenue` in `packages/convex/convex/functions/admin.ts`
3. Alternative: Compute from orders — group completed orders by month, sum totals
4. If no data available, show an empty state message instead of fake chart data
5. Remove the hardcoded `data` constant entirely

---

## Task 3: Recent Orders Widget — Wire Up Real Data

**File:** [`apps/admin/src/components/dashboard/recent-orders.tsx`](../../apps/admin/src/components/dashboard/recent-orders.tsx)

**Current state:** Hardcoded array of 5 fake orders with names like `John Doe`, `Alice Brown`

**Required changes:**
1. Convert to `"use client"` component
2. Call `api.functions.admin.listAllOrders` with `{ limit: 5 }`
3. Map the returned data to the table format
4. Replace fake names/amounts with real data from query result
5. Show loading skeleton while data loads
6. Show empty state if no orders exist
7. Delete the entire `recentOrders` hardcoded array

---

## Task 4: Users Page — Wire Up Real Data

**File:** [`apps/admin/src/app/users/page.tsx`](../../apps/admin/src/app/users/page.tsx)

**Current state:** Hardcoded array of 4 fake users

**Required changes:**
1. Convert to `"use client"` component (remove `Metadata` export or wrap)
2. Call `api.functions.admin.listAllUsers` with pagination
3. Implement role/status filtering using query args
4. Implement search (client-side filter or add backend search)
5. Wire up the `Pagination` component with real `hasMore` / total counts
6. Delete the hardcoded `users` array
7. Show loading skeletons

---

## Task 5: User Detail Page — Wire Up Real Data

**File:** [`apps/admin/src/app/users/[id]/page.tsx`](../../apps/admin/src/app/users/[id]/page.tsx)

**Current state:** Hardcoded `mockUser` object

**Required changes:**
1. Convert to client component
2. Accept user ID from route params
3. Query `api.functions.users.getUserById` or `admin.listAllUsers` filtered by ID
4. Wire up ban/unban using `api.functions.admin.updateUserStatus`
5. Wire up role change using `api.functions.admin.changeUserRole`
6. Show loading state and not-found fallback
7. Delete `mockUser` constant

---

## Task 6: Orders Page — Wire Up Real Data

**File:** [`apps/admin/src/app/orders/page.tsx`](../../apps/admin/src/app/orders/page.tsx)

**Current state:** Hardcoded array of 5 fake orders + hardcoded stats cards

**Required changes:**
1. Convert to `"use client"` component
2. Call `api.functions.admin.listAllOrders` with status filter
3. Replace hardcoded stats (`2,350`, `45`, `128`, `8`) with real computed values from `getDashboardStats`
4. Implement search and date filtering
5. Wire up pagination
6. Delete hardcoded `orders` array

---

## Task 7: Order Detail Page — Wire Up Real Data

**File:** [`apps/admin/src/app/orders/[id]/page.tsx`](../../apps/admin/src/app/orders/[id]/page.tsx)

**Current state:** Hardcoded `mockOrder` object with fake items

**Required changes:**
1. Convert to client component
2. Query order by ID from Convex
3. Query order items using `orderItems` table
4. Wire up status change using `api.functions.admin.forceUpdateOrderStatus`
5. Show real customer info, payment details
6. Delete `mockOrder` constant

---

## Task 8: Products Page — Wire Up Real Data

**File:** [`apps/admin/src/app/products/page.tsx`](../../apps/admin/src/app/products/page.tsx)

**Current state:** Hardcoded array of 4 fake products

**Required changes:**
1. Convert to `"use client"` component
2. Query products from `api.functions.products.listProducts` or create admin-specific query
3. Implement category and status filtering
4. Implement search
5. Wire up bulk actions (activate/deactivate/delete) with mutations
6. Wire up pagination
7. Delete hardcoded `products` array

---

## Task 9: Product Detail Page — Wire Up Real Data

**File:** [`apps/admin/src/app/products/[id]/page.tsx`](../../apps/admin/src/app/products/[id]/page.tsx)

**Current state:** Hardcoded `mockProduct` object with fake images/tags

**Required changes:**
1. Convert to client component
2. Query product by ID from Convex
3. Show real product images, seller info, tags
4. Wire up status change, edit, delete actions
5. Delete `mockProduct` constant

---

## Task 10: Sellers Page — Wire Up Real Data

**File:** [`apps/admin/src/app/sellers/page.tsx`](../../apps/admin/src/app/sellers/page.tsx)

**Current state:** Hardcoded array of 4 fake sellers + hardcoded stats

**Required changes:**
1. Convert to `"use client"` component
2. Query sellers from backend — may need new `admin.listAllSellers` query
3. Replace hardcoded stats (`234`, `198`, `12`, `$1.2M`) with real data
4. Implement search and status filtering
5. Wire up pagination
6. Delete hardcoded `sellers` array

---

## Task 11: Seller Detail Page — Wire Up Real Data

**File:** [`apps/admin/src/app/sellers/[id]/page.tsx`](../../apps/admin/src/app/sellers/[id]/page.tsx)

**Current state:** Hardcoded seller object

**Required changes:**
1. Convert to client component
2. Query seller by ID from Convex
3. Show real seller products, orders, revenue
4. Wire up suspend/activate actions
5. Delete hardcoded data

---

## Task 12: Pending Sellers Page — Wire Up Real Data

**File:** [`apps/admin/src/app/sellers/pending/page.tsx`](../../apps/admin/src/app/sellers/pending/page.tsx)

**Current state:** Hardcoded array of 3 fake pending applications

**Required changes:**
1. Convert to `"use client"` component
2. Call `api.functions.admin.listPendingSellers`
3. Wire up `api.functions.admin.approveSeller` for approve/reject buttons
4. Show loading state and empty state
5. Delete hardcoded `pendingApplications` array

---

## Task 13: Categories Page — Wire Up Real Data

**File:** [`apps/admin/src/app/categories/page.tsx`](../../apps/admin/src/app/categories/page.tsx)

**Current state:** Hardcoded categories array

**Required changes:**
1. Convert to `"use client"` component
2. Query categories from `api.functions.categories.*`
3. Wire up create/edit/delete mutations
4. Delete hardcoded data

---

## Task 14: Category Detail Page — Wire Up Real Data

**File:** [`apps/admin/src/app/categories/[id]/page.tsx`](../../apps/admin/src/app/categories/[id]/page.tsx)

**Current state:** Hardcoded `mockCategory` object

**Required changes:**
1. Convert to client component
2. Query category by ID
3. Show real products in category
4. Wire up edit/delete
5. Delete `mockCategory` constant

---

## Task 15: Analytics Page — Wire Up Real Data

**File:** [`apps/admin/src/app/analytics/page.tsx`](../../apps/admin/src/app/analytics/page.tsx)

**Current state:** Massive `analyticsData` object with fake stats, top products, sellers, categories, traffic

**Required changes:**
1. Call `api.functions.admin.getDashboardStats` for overview stats
2. Top products/sellers/categories — may need new backend queries or compute from existing data
3. Traffic sources — remove entirely if no analytics backend exists, or show placeholder
4. Replace all hardcoded numbers with real data
5. Delete the entire `analyticsData` constant

---

## Task 16: Moderation Reviews Page — Wire Up Real Data

**File:** [`apps/admin/src/app/moderation/reviews/page.tsx`](../../apps/admin/src/app/moderation/reviews/page.tsx)

**Current state:** Hardcoded `pendingReviews` array

**Required changes:**
1. Convert to `"use client"` component
2. Call `api.functions.admin.listPendingReviews`
3. Wire up `api.functions.admin.moderateReview` for approve/reject
4. Show loading state and empty state
5. Delete hardcoded data

---

## New Backend Functions Needed

Some pages need backend queries that may not exist yet. Create these in `packages/convex/convex/functions/admin.ts`:

1. **`admin.getMonthlyRevenue`** — Aggregate order totals by month for revenue chart
2. **`admin.listAllSellers`** — List all sellers with pagination, filtering, stats
3. **`admin.getSellerById`** — Get single seller with products/orders/revenue
4. **`admin.getUserById`** — Get single user with full profile for admin view
5. **`admin.getOrderById`** — Get single order with items for admin view
6. **`admin.getProductById`** — Get single product with images/seller for admin view
7. **`admin.getAnalyticsOverview`** — Top products, sellers, categories ranked by revenue

---

## Validation Checklist
- [ ] Zero hardcoded data arrays remain in admin app
- [ ] All pages show loading skeletons while data loads
- [ ] All pages show empty states when no data exists
- [ ] All pages gracefully handle errors
- [ ] Pagination works with real data counts
- [ ] Search/filter controls actually filter data
- [ ] `pnpm typecheck` passes for admin app
- [ ] `pnpm lint` passes for admin app
