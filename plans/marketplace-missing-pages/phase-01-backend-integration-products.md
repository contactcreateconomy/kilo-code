# Phase 01 — Products & Categories Backend Integration

## Goal

Replace all mock/hardcoded data in the products and categories pages with real Convex backend queries. This is the highest priority since these are the core marketplace pages.

---

## Task 1: Convert `ProductGrid` Component to Use Convex

**File:** `apps/marketplace/src/components/products/product-grid.tsx`

**Current State:** Server component with mock `getProducts()` function returning hardcoded array.

**Required Changes:**
- Convert to a client component (or use `convexClient` from `src/lib/convex.ts` for server-side)
- Replace mock `getProducts()` with `api.functions.products.listProducts` or `api.functions.products.searchProducts`
- Map Convex response shape to the `Product` type used by `ProductCard`
- Handle the `search` filter using `searchProducts` when a search query is present
- Handle `category` filter by passing `categoryId` (need to resolve slug to ID first)
- Handle pagination using the cursor-based system from `listProducts`
- Handle empty states properly

**Backend Functions:**
- [`listProducts`](../../packages/convex/convex/functions/products.ts:32) — paginated listing with category/seller/status filters
- [`searchProducts`](../../packages/convex/convex/functions/products.ts:341) — full-text search by product name

**Key Mapping:**
```
Convex product shape → Product type:
- product._id → id
- product.slug → slug
- product.name → name
- product.description → description
- product.price → price (NOTE: stored in cents, convert with centsToDollars)
- product.primaryImage → images[0]
- product.categoryId → need to fetch category name/slug
- product.sellerId → need to fetch seller name
- product.averageRating → rating
- product.reviewCount → reviewCount
- product.salesCount → salesCount
```

---

## Task 2: Convert `ProductFilters` Component to Fetch Categories

**File:** `apps/marketplace/src/components/products/product-filters.tsx`

**Current State:** Hardcoded `categories` array with 6 items.

**Required Changes:**
- Fetch categories using `api.functions.categories.listCategories`
- Replace hardcoded categories array with dynamic data
- This is a client component already (`"use client"`), so use `useQuery` from `convex/react`

**Backend Function:**
- [`listCategories`](../../packages/convex/convex/functions/categories.ts:28)

---

## Task 3: Convert Product Detail Page to Use Convex

**File:** `apps/marketplace/src/app/products/[slug]/page.tsx`

**Current State:** Mock `getProduct()` and `getRelatedProducts()` with hardcoded data. Server component.

**Required Changes:**
- Use `convexClient.query(api.functions.products.getProductBySlug, { slug })` for server-side data fetching
- The `getProductBySlug` function already returns images — use those
- Need to also fetch seller profile info separately if not included
- For related products: use `listProducts` with the same `categoryId`
- Update `generateMetadata` to use real product data
- Convert prices from cents to dollars using `centsToDollars()` utility
- Handle product not found properly with `notFound()`

**Backend Functions:**
- [`getProductBySlug`](../../packages/convex/convex/functions/products.ts:204)
- [`getProduct`](../../packages/convex/convex/functions/products.ts:145) — returns full product with images, seller, category
- [`listProducts`](../../packages/convex/convex/functions/products.ts:32) — for related products
- [`incrementViewCount`](../../packages/convex/convex/functions/products.ts:797) — track product views

---

## Task 4: Convert Categories Page to Use Convex

**File:** `apps/marketplace/src/app/categories/page.tsx`

**Current State:** Hardcoded `categories` array with 8 mock categories.

**Required Changes:**
- Use `convexClient` to fetch categories server-side
- Call `api.functions.categories.listCategories`
- Map response to include product count (available from `getCategory`)
- Handle empty state
- Categories have `imageUrl` field in schema — use it for the card images

**Backend Functions:**
- [`listCategories`](../../packages/convex/convex/functions/categories.ts:28)
- [`getCategory`](../../packages/convex/convex/functions/categories.ts:79) — includes `productCount`

---

## Task 5: Convert Category Detail Page to Use Convex

**File:** `apps/marketplace/src/app/categories/[slug]/page.tsx`

**Current State:** Mock `getCategory()` with hardcoded categories.

**Required Changes:**
- Use `convexClient` to fetch category by slug
- Call `api.functions.categories.getCategoryBySlug`
- Update `generateMetadata` with real data
- The `ProductGrid` component (updated in Task 1) will handle fetching products for this category

**Backend Function:**
- [`getCategoryBySlug`](../../packages/convex/convex/functions/categories.ts:135)

---

## Task 6: Update Home Page Trending Products

**File:** `apps/marketplace/src/app/page.tsx`

**Current State:** Hardcoded `featuredProducts` array with 4 items.

**Required Changes:**
- Fetch real trending/popular products using `listProducts` sorted by salesCount or viewCount
- Convert to use `convexClient` for server-side fetching
- Keep the static sections (hero, stats, features, CTA) as-is
- Only replace the "Trending Now" products section with real data

**Backend Function:**
- [`listProducts`](../../packages/convex/convex/functions/products.ts:32) — fetch top products

---

## Task 7: Update Types to Match Convex Schema

**File:** `apps/marketplace/src/types/index.ts`

**Required Changes:**
- Align `Product` interface with Convex schema (prices in cents)
- Add price helper utilities: `centsToDollars()`, `dollarsToCents()`, `formatPrice()`
- Consider creating a `ConvexProduct` type that matches the backend shape
- Add mapper functions: `mapConvexProductToProduct()`

---

## Files Modified

| File | Change Type |
|------|------------|
| `src/components/products/product-grid.tsx` | Rewrite — Convex integration |
| `src/components/products/product-filters.tsx` | Modify — dynamic categories |
| `src/app/products/[slug]/page.tsx` | Rewrite — Convex integration |
| `src/app/categories/page.tsx` | Rewrite — Convex integration |
| `src/app/categories/[slug]/page.tsx` | Rewrite — Convex integration |
| `src/app/page.tsx` | Modify — trending products section |
| `src/types/index.ts` | Modify — align with Convex schema |
| `src/lib/utils.ts` | Add — price formatting utilities |
