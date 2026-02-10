# Phase 06 — Account Sub-Pages

## Goal

Create missing account sub-pages: Reviews, Wishlist, and Downloads. These are referenced from the account dashboard and enhance the customer experience.

---

## Task 1: Create Account Reviews Page

**File:** `apps/marketplace/src/app/account/reviews/page.tsx` (new)

**Why Needed:** The account dashboard shows "Reviews Written" stat and links to reviews, but the page does not exist.

**Page Content:**
- List of user's reviews
- Each review shows:
  - Product thumbnail and name (linked to product page)
  - Star rating
  - Review title and content preview
  - Date posted
  - Status (approved/pending)
- Edit review button → opens edit form
- Delete review button → confirmation dialog + soft delete
- Empty state: "You haven't written any reviews yet"

**Backend Functions:**
- [`getUserReviews`](../../packages/convex/convex/functions/reviews.ts:168) — list user's reviews with product info
- [`updateReview`](../../packages/convex/convex/functions/reviews.ts:415) — edit review
- [`deleteReview`](../../packages/convex/convex/functions/reviews.ts:500) — soft delete review

---

## Task 2: Create Account Wishlist Page

**File:** `apps/marketplace/src/app/account/wishlist/page.tsx` (new)

**Why Needed:** The account dashboard shows "Wishlist Items" stat and the product detail page has a heart/favorite button, but there is no wishlist page.

**Note on Backend Support:** There is currently **no wishlist/favorites table** in the Convex schema. Two approaches:

**Option A — Use localStorage (quick, no backend changes):**
- Store wishlist in Zustand with localStorage persistence
- Similar to current cart implementation
- Pros: No schema changes needed, fast implementation
- Cons: Not synced across devices

**Option B — Create wishlist table (recommended):**
- Add `wishlists` table to schema:
  ```
  wishlists: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"])
  ```
- Create Convex functions: `addToWishlist`, `removeFromWishlist`, `getUserWishlist`
- Synced across devices, proper backend integration

**Page Content:**
- Grid of wishlisted products using `ProductCard`
- Remove from wishlist button on each card
- Add to cart button
- Empty state: "Your wishlist is empty"

---

## Task 3: Create Account Downloads Page

**File:** `apps/marketplace/src/app/account/downloads/page.tsx` (new)

**Why Needed:** The platform sells digital products (`isDigital: true` in products schema with `digitalFileUrl`). After purchase, customers need a place to access their downloads.

**Page Content:**
- List of purchased digital products
- Each item shows:
  - Product name and thumbnail
  - Purchase date
  - Order reference
  - Download button (links to `digitalFileUrl`)
  - Re-download capability
- Fetched by:
  1. Get user's completed orders
  2. Get order items where product `isDigital === true`
  3. Display with download links

**Backend Approach:**
- Use `getUserOrders` with status filter "delivered" or "completed"
- For each order, get items and filter for digital products
- May need a new Convex function `getUserDigitalPurchases` for efficiency

---

## Task 4: Update Account Dashboard Quick Links

**File:** `apps/marketplace/src/app/account/page.tsx`

**Required Changes:**
- Add quick links for:
  - Reviews → `/account/reviews`
  - Wishlist → `/account/wishlist`
  - Downloads → `/account/downloads`
- Update stats to show real data (already planned in Phase 02)

---

## Task 5: Update Account Layout Sidebar

**File:** `apps/marketplace/src/app/account/layout.tsx`

**Required Changes:**
- Add sidebar navigation items for new pages:
  - 📦 Orders
  - ⭐ Reviews
  - ❤️ Wishlist
  - 📥 Downloads
  - ⚙️ Settings

---

## Files Created/Modified

| File | Change Type |
|------|------------|
| `src/app/account/reviews/page.tsx` | New |
| `src/app/account/wishlist/page.tsx` | New |
| `src/app/account/downloads/page.tsx` | New |
| `src/app/account/page.tsx` | Modify — add quick links |
| `src/app/account/layout.tsx` | Modify — add sidebar nav items |
| `packages/convex/convex/schema.ts` | Modify — add wishlists table (Option B) |
| `packages/convex/convex/functions/wishlist.ts` | New — wishlist functions (Option B) |
