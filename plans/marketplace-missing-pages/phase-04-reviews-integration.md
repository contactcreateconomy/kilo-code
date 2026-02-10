# Phase 04 — Reviews System Integration

## Goal

Add full review display and creation on product detail pages, replacing the placeholder "Reviews will be displayed here when available" text with a working review system.

---

## Task 1: Create ReviewList Component

**File:** `apps/marketplace/src/components/reviews/review-list.tsx` (new)

**Description:**
- Client component that displays reviews for a product
- Uses `api.functions.reviews.getProductReviews` with sort options
- Displays:
  - User avatar, name, and date
  - Star rating
  - Review title and content
  - Verified purchase badge
  - Helpful count with "Mark as helpful" button
- Sort by: Recent, Most Helpful, Rating High, Rating Low
- Paginated or load-more pattern

**Backend Functions:**
- [`getProductReviews`](../../packages/convex/convex/functions/reviews.ts:25)
- [`markReviewHelpful`](../../packages/convex/convex/functions/reviews.ts:571)

---

## Task 2: Create ReviewStats Component

**File:** `apps/marketplace/src/components/reviews/review-stats.tsx` (new)

**Description:**
- Displays aggregate review statistics for a product
- Shows:
  - Average rating (large number with stars)
  - Total review count
  - Rating distribution bar chart (5 stars, 4 stars, etc.)
  - Verified purchase count
- Uses `api.functions.reviews.getProductReviewStats`

**Backend Function:**
- [`getProductReviewStats`](../../packages/convex/convex/functions/reviews.ts:112)

---

## Task 3: Create ReviewForm Component

**File:** `apps/marketplace/src/components/reviews/review-form.tsx` (new)

**Description:**
- Client component for submitting a review
- Checks if user can review via `api.functions.reviews.canReviewProduct`
- Form fields:
  - Star rating selector (1-5, clickable stars)
  - Title (optional)
  - Content (textarea, min 10 chars)
- Submit via `api.functions.reviews.createReview`
- Shows appropriate messages:
  - "Sign in to review" if not authenticated
  - "You have already reviewed" if already reviewed
  - "Verified purchase" badge if user bought the product
- Success toast and refresh on submission

**Backend Functions:**
- [`canReviewProduct`](../../packages/convex/convex/functions/reviews.ts:224) — check eligibility
- [`createReview`](../../packages/convex/convex/functions/reviews.ts:297) — submit review

---

## Task 4: Create ReviewItem Component

**File:** `apps/marketplace/src/components/reviews/review-item.tsx` (new)

**Description:**
- Individual review display card
- Shows star rating, user info, review text
- "Helpful" button with count
- Date formatting

---

## Task 5: Integrate Reviews into Product Detail Page

**File:** `apps/marketplace/src/app/products/[slug]/page.tsx`

**Required Changes:**
- Replace the placeholder reviews tab content with:
  - `ReviewStats` component at top
  - `ReviewForm` component (if user is eligible)
  - `ReviewList` component with sort controls
- Pass `productId` to all review components

---

## Task 6: Create Reviews Index Export

**File:** `apps/marketplace/src/components/reviews/index.ts` (new)

**Description:**
- Barrel export for all review components

---

## Files Created/Modified

| File | Change Type |
|------|------------|
| `src/components/reviews/review-list.tsx` | New |
| `src/components/reviews/review-stats.tsx` | New |
| `src/components/reviews/review-form.tsx` | New |
| `src/components/reviews/review-item.tsx` | New |
| `src/components/reviews/index.ts` | New |
| `src/app/products/[slug]/page.tsx` | Modify — integrate review components |
