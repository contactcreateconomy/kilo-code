# Phase 07: Auth Pages

> Redesign marketplace auth pages with the two-column login-02 pattern, matching admin and seller apps for consistent branding across all Createconomy apps.

## Tasks

### 1. Rewrite Sign In Page (`app/auth/signin/page.tsx`)

**Current:** Uses shared `AuthPageWrapper` (centered card layout)
**Target:** Two-column layout matching admin/seller pattern

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│   Dark Panel         │   Form Panel         │
│   (hidden on mobile) │                      │
│                      │   Logo (small)        │
│   Logo (large)       │   "Welcome Back"     │
│   "Createconomy"     │   "Sign in to your   │
│                      │    account"          │
│   Marketplace stats: │                      │
│   "50K+ products     │   [SignInForm]        │
│   from 10K+          │                      │
│   creators"          │   Forgot password?   │
│                      │   Don't have account?│
│   © 2026             │   [Sign Up]          │
│   Createconomy       │                      │
│                      │   Terms | Privacy    │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

Changes:
- Remove `AuthPageWrapper` import
- Build two-column `grid min-h-svh lg:grid-cols-2` layout
- Left panel: Dark bg, `Logo variant="light"`, marketplace tagline/stats
- Right panel: `LogoWithText` (mobile only), heading, `SignInForm`, footer links
- Keep existing `SignInForm` component unchanged

### 2. Rewrite Sign Up Page (`app/auth/signup/page.tsx`)

**Current:** Uses shared `AuthPageWrapper`
**Target:** Two-column layout with marketplace benefits

```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│   Dark Panel         │   Form Panel         │
│   (hidden on mobile) │                      │
│                      │   Logo (small)        │
│   Logo (large)       │   "Join Createconomy"│
│   "Createconomy"     │   "Create an account │
│                      │    to start buying"  │
│   Benefits:          │                      │
│   ✓ Access 50K+      │   [SignUpForm]        │
│     digital products │                      │
│   ✓ Instant delivery │   Already have an    │
│   ✓ Secure payments  │   account?           │
│   ✓ 30-day guarantee │   [Sign In]          │
│                      │                      │
│   © 2026             │   Terms | Privacy    │
│   Createconomy       │                      │
└──────────────────────┴──────────────────────┘
```

Changes:
- Same two-column pattern as sign in
- Left panel: Benefits list with `CheckCircle2` icons
- Keep existing `SignUpForm` component unchanged

### 3. Check Sign Out Page (`app/auth/signout/page.tsx`)

Read this file and ensure consistent styling:
- Use `Logo` component
- Use shadcn `Card` for confirmation card
- Use shadcn `Button` for actions

## Design Consistency

All three Createconomy apps now share the same auth page pattern:
- **Admin:** Dark left panel with "Powering the creator economy" tagline
- **Seller:** Dark left panel with creator community stats / benefits
- **Marketplace:** Dark left panel with marketplace stats / buyer benefits

This creates a unified brand experience when users navigate between apps.

## Files Modified

| File | Changes |
|------|---------|
| `app/auth/signin/page.tsx` | Two-column layout, Logo, remove AuthPageWrapper |
| `app/auth/signup/page.tsx` | Two-column layout, benefits, remove AuthPageWrapper |
| `app/auth/signout/page.tsx` | Consistent styling with Card, Logo |
