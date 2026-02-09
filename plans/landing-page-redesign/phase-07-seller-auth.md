# Phase 07 — Seller Auth Pages: Login & Signup Redesign

## Objective

Redesign the seller sign-in and sign-up pages using the shadcn `login-04` / `signup-04` pattern — a side-by-side form + image layout that feels more inviting and marketplace-focused than the admin's authoritative dark panel.

## Current State

- [`auth/signin/page.tsx`](../../apps/seller/src/app/auth/signin/page.tsx) — Uses shared `AuthPageWrapper` with `SignInForm`
- [`auth/signup/page.tsx`](../../apps/seller/src/app/auth/signup/page.tsx) — Uses shared `AuthPageWrapper` with `SignUpForm`
- [`auth/pending/page.tsx`](../../apps/seller/src/app/auth/pending/page.tsx) — Pending approval page

## Target State

`login-04` pattern: Form on the left, lifestyle/marketplace image on the right
- **Left panel:** Sign-in form with Createconomy branding
- **Right panel:** Gradient background with marketplace imagery, seller success stats, or testimonial

## Tasks

### 7.1 Redesign Sign-In Page

**File:** `apps/seller/src/app/auth/signin/page.tsx`

```
Layout Structure:
┌──────────────────────┬──────────────────────┐
│                      │                      │
│   Form Panel         │   Image Panel        │
│                      │                      │
│   [Logo]             │   Gradient bg with   │
│   "Welcome back"     │   marketplace stats: │
│   "Sign in to your   │                      │
│   seller account"    │   "10K+ sellers"     │
│                      │   "500K+ products"   │
│   [SignInForm]       │   "$2M+ in sales"    │
│                      │                      │
│   Forgot password?   │   [Testimonial quote │
│   Dont have account? │    from a seller]    │
│   Sign up            │                      │
│                      │                      │
│   Terms | Privacy    │                      │
└──────────────────────┴──────────────────────┘
```

- Left panel: White/neutral bg with form, logo at top
- Right panel: Gradient (using `seller-gradient` CSS or new gradient), marketplace stats, seller testimonial
- Responsive: Right panel hides on mobile

### 7.2 Redesign Sign-Up Page

**File:** `apps/seller/src/app/auth/signup/page.tsx`

Same two-panel layout but with sign-up messaging:
- **Left panel:** "Start selling on Createconomy" + `SignUpForm`
- **Right panel:** Benefits of selling (3-4 bullet points with Lucide icons), marketplace stats

### 7.3 Improve Pending Approval Page

**File:** `apps/seller/src/app/auth/pending/page.tsx`

Design a clean pending state page:
- Createconomy logo
- "Application Under Review" heading
- Status indicator with estimated timeline
- What to expect next
- Contact support link

## Files Modified

| Action | File |
|--------|------|
| Rewrite | `apps/seller/src/app/auth/signin/page.tsx` |
| Rewrite | `apps/seller/src/app/auth/signup/page.tsx` |
| Rewrite | `apps/seller/src/app/auth/pending/page.tsx` |

## Notes

- The actual `SignInForm` and `SignUpForm` components stay unchanged
- The shared `AuthPageWrapper` remains available for other apps
- Right panel stats are static/mock for now — later can be connected to Convex

## Verification

- [ ] Sign-in shows two-panel layout on desktop
- [ ] Sign-up shows two-panel layout with benefits
- [ ] Right panels hide on mobile
- [ ] Logo displays correctly
- [ ] Pending page shows clear status
- [ ] Auth flow still works correctly
- [ ] Links between sign-in/sign-up work
