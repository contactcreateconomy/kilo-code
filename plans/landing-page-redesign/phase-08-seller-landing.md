# Phase 08 — Seller Onboarding Landing Page (NEW)

## Objective

Create a new public-facing landing page for the seller portal that non-authenticated users see before signing up. This is the "Start Selling on Createconomy" page — a marketing/onboarding page built with free shadcn-compatible sections from 21st.dev and custom components.

## Current State

Currently, [`apps/seller/src/app/page.tsx`](../../apps/seller/src/app/page.tsx) immediately shows the seller dashboard inside `SellerGuard`. Non-authenticated users get redirected to `/auth/signin`.

There is no public-facing landing page to explain the value proposition of selling on Createconomy.

## Target State

A new public route at `/welcome` or restructure routing so:
- **Unauthenticated users:** See the landing page at `/` with CTA to sign up
- **Authenticated sellers:** See the dashboard at `/dashboard`

### Page Sections

```
┌─────────────────────────────────────────────┐
│ [Navbar]                                     │
│ Logo | Features | Pricing | FAQ | Sign In    │
├─────────────────────────────────────────────┤
│                                              │
│ [Hero Section]                               │
│ "Turn Your Creativity Into Income"           │
│ "Join thousands of creators selling          │
│  digital products on Createconomy"           │
│ [Start Selling] [Learn More]                 │
│                                              │
├─────────────────────────────────────────────┤
│                                              │
│ [Stats Bar]                                  │
│ 10K+ Sellers | 500K+ Products | $2M+ Sales   │
│                                              │
├─────────────────────────────────────────────┤
│                                              │
│ [Features Section]                           │
│ Easy Setup | Analytics | Secure Payouts      │
│ Product Management | Customer Reviews        │
│ Marketing Tools                              │
│                                              │
├─────────────────────────────────────────────┤
│                                              │
│ [How It Works]                               │
│ 1. Create Account → 2. List Products         │
│ → 3. Get Paid                                │
│                                              │
├─────────────────────────────────────────────┤
│                                              │
│ [Testimonials]                               │
│ Seller success stories                       │
│                                              │
├─────────────────────────────────────────────┤
│                                              │
│ [CTA Section]                                │
│ "Ready to start selling?"                    │
│ [Create Your Store]                          │
│                                              │
├─────────────────────────────────────────────┤
│ [Footer]                                     │
│ Links | Terms | Privacy | © 2026             │
└─────────────────────────────────────────────┘
```

## Tasks

### 8.1 Update Route Structure

Restructure the seller app routing:

```
apps/seller/src/app/
├── page.tsx                  → Landing page (public)
├── (dashboard)/
│   ├── layout.tsx            → SellerGuard + SellerLayout
│   ├── page.tsx              → Dashboard (was root page.tsx)
│   ├── products/...
│   ├── orders/...
│   ├── analytics/...
│   ├── payouts/...
│   ├── reviews/...
│   ├── settings/...
│   └── support/...
├── auth/
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   ├── signout/page.tsx
│   └── pending/page.tsx
└── layout.tsx               → Root layout (no sidebar)
```

This means:
- `/` — Public landing page (no auth required)
- `/dashboard` — Protected seller dashboard
- `/products`, `/orders`, etc. — Protected under `(dashboard)` group

### 8.2 Create Landing Page

**File:** `apps/seller/src/app/page.tsx` (replaces current dashboard)

Build using free components. Each section is a separate component:

### 8.3 Create Landing Page Components

**Files to create:**

```
apps/seller/src/components/landing/
├── landing-navbar.tsx       → Navigation bar with logo + links
├── hero-section.tsx         → Hero with headline + CTA buttons
├── stats-bar.tsx            → Marketplace stats
├── features-section.tsx     → 6 feature cards with Lucide icons
├── how-it-works.tsx         → 3-step process
├── testimonials-section.tsx → Seller testimonials carousel
├── cta-section.tsx          → Final call to action
└── landing-footer.tsx       → Footer with links
```

**Component sources (all FREE):**
- **Navbar:** Custom using shadcn `Button`, `NavigationMenu` (or simple custom nav)
- **Hero:** Adapt from 21st.dev hero sections (https://21st.dev/s/hero) — pick a clean SaaS-style hero
- **Features:** Adapt from 21st.dev features (https://21st.dev/s/features) — 3x2 grid with Lucide icons
- **Testimonials:** Shadcn Carousel + Card, or 21st.dev testimonials section
- **CTA:** 21st.dev call-to-action section
- **Stats/How It Works/Footer:** Custom using shadcn components (Card, Badge, Button)

### 8.4 Move Dashboard to Route Group

Move existing dashboard from `/` to `/(dashboard)/`:

- Move current `page.tsx` dashboard content to `apps/seller/src/app/(dashboard)/page.tsx`
- Create `apps/seller/src/app/(dashboard)/layout.tsx` with `SellerGuard` + `SellerLayout`
- Move all protected routes (products, orders, etc.) under `(dashboard)/`

## Files Created/Modified

| Action | File |
|--------|------|
| Create | `apps/seller/src/components/landing/landing-navbar.tsx` |
| Create | `apps/seller/src/components/landing/hero-section.tsx` |
| Create | `apps/seller/src/components/landing/stats-bar.tsx` |
| Create | `apps/seller/src/components/landing/features-section.tsx` |
| Create | `apps/seller/src/components/landing/how-it-works.tsx` |
| Create | `apps/seller/src/components/landing/testimonials-section.tsx` |
| Create | `apps/seller/src/components/landing/cta-section.tsx` |
| Create | `apps/seller/src/components/landing/landing-footer.tsx` |
| Rewrite | `apps/seller/src/app/page.tsx` (landing page) |
| Create | `apps/seller/src/app/(dashboard)/layout.tsx` |
| Create | `apps/seller/src/app/(dashboard)/page.tsx` (dashboard) |
| Move | All protected routes under `(dashboard)/` |

## Notes

- The landing page is a Server Component — no auth state needed
- CTAs link to `/auth/signup` and `/auth/signin`
- If the user is already authenticated, the navbar can show "Go to Dashboard" instead of "Sign In"
- All sections use shadcn base components (Card, Button, Badge) + Lucide icons
- No premium components needed — everything is custom or from free 21st.dev sections

## Verification

- [ ] Landing page renders at `/` without authentication
- [ ] All sections display correctly (hero, features, stats, testimonials, CTA)
- [ ] "Start Selling" CTA links to `/auth/signup`
- [ ] "Sign In" links to `/auth/signin`
- [ ] Dashboard still works at `/dashboard` (protected)
- [ ] All existing routes still work under the new `(dashboard)/` group
- [ ] Mobile responsive layout for all landing sections
- [ ] Logo appears in navbar and footer
