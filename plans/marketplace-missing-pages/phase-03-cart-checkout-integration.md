# Phase 03 — Cart & Checkout Backend Integration

## Goal

Migrate the cart system from client-side Zustand + localStorage to Convex backend cart, and fix the checkout flow to use proper server-side cart data.

---

## Task 1: Create Convex-Backed Cart Hook

**File:** `apps/marketplace/src/hooks/use-cart.ts` (rewrite)

**Current State:** Zustand store with `persist` middleware using localStorage. No server sync.

**Required Changes:**
- Keep Zustand for optimistic UI updates, but sync with Convex backend
- For authenticated users:
  - On mount, fetch cart from `api.functions.cart.getCart` or `getCartItems`
  - On add/remove/update, call Convex mutations AND update Zustand optimistically
  - Cart data persists across devices via Convex
- For anonymous users:
  - Keep localStorage fallback with sessionId
  - On sign-in, merge local cart into Convex cart
- Use `useConvexAuth` to determine auth state

**Backend Functions (from `packages/convex/convex/functions/cart.ts`):**
- Need to verify exact function signatures — read `cart.ts`

---

## Task 2: Update CartItem Component

**File:** `apps/marketplace/src/components/cart/cart-item.tsx`

**Required Changes:**
- Accept Convex cart item shape (with `productId`, fetch product details)
- Wire quantity update to Convex mutation
- Wire remove to Convex mutation
- Show product image from Convex product data

---

## Task 3: Update CartSummary Component

**File:** `apps/marketplace/src/components/cart/cart-summary.tsx`

**Required Changes:**
- Calculate totals from Convex cart data (prices in cents)
- Use `centsToDollars()` for display
- Update checkout button to work with Convex cart

---

## Task 4: Update Cart Page

**File:** `apps/marketplace/src/app/cart/page.tsx`

**Current State:** Static server component with empty `items` array.

**Required Changes:**
- Convert `CartItemsList` to client component
- Use the updated `useCart()` hook
- Display items from Convex cart
- Handle loading state

---

## Task 5: Update AddToCartButton Component

**File:** `apps/marketplace/src/components/products/add-to-cart-button.tsx`

**Required Changes:**
- Call Convex cart mutation to add item
- Show loading state during mutation
- Show "In Cart" state when product is already in cart
- Handle auth — prompt sign-in for authenticated cart, or use local for anonymous

---

## Task 6: Fix Checkout Flow

**File:** `apps/marketplace/src/app/checkout/page.tsx`

**Current State:** Reads from `localStorage` to get cart items, then calls `initiateCheckout()`.

**Required Changes:**
- For authenticated users: fetch cart from Convex instead of localStorage
- Pass cart items to Stripe checkout session creation
- After successful checkout, Convex cart is cleared server-side via webhook
- Handle the transition from localStorage cart to Convex cart

---

## Task 7: Fix Checkout Success Page

**File:** `apps/marketplace/src/app/checkout/success/page.tsx`

**Required Changes:**
- Verify session with backend
- Clear Convex cart (may already be handled by webhook)
- Show real order details from Convex

---

## Pre-requisite: Read Cart Functions

Before implementation, need to examine:
- `packages/convex/convex/functions/cart.ts` — exact function signatures
- `packages/convex/convex/functions/stripe.ts` — checkout session creation

---

## Files Modified

| File | Change Type |
|------|------------|
| `src/hooks/use-cart.ts` | Rewrite — Convex-backed cart |
| `src/components/cart/cart-item.tsx` | Modify — use Convex data |
| `src/components/cart/cart-summary.tsx` | Modify — Convex totals |
| `src/app/cart/page.tsx` | Modify — client component |
| `src/components/products/add-to-cart-button.tsx` | Modify — Convex mutations |
| `src/app/checkout/page.tsx` | Modify — use Convex cart |
| `src/app/checkout/success/page.tsx` | Modify — Convex order verification |
