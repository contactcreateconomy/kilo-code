# Phase 04 — Admin Auth Pages: Login Redesign

## Objective

Redesign the admin sign-in page using the shadcn `login-02` pattern — a two-column layout with the Createconomy logo on a dark cover panel and the sign-in form on the right.

## Current State

[`apps/admin/src/app/auth/signin/page.tsx`](../../apps/admin/src/app/auth/signin/page.tsx) uses the shared `AuthPageWrapper` from `@createconomy/ui/components/auth` with the `SignInForm` component. The current layout is a centered card-style form.

## Target State

Two-column layout inspired by shadcn `login-02`:
- **Left panel (dark):** Full-height dark background with Createconomy logo centered, subtle gradient, tagline text
- **Right panel (light):** Sign-in form with "Admin Dashboard" title, OAuth buttons, admin restriction notice

## Tasks

### 4.1 Create Admin Login Layout

**File:** `apps/admin/src/app/auth/signin/page.tsx`

Replace the `AuthPageWrapper` usage with a custom two-column layout:

```
Layout Structure:
┌──────────────────────┬──────────────────────┐
│                      │                      │
│   Dark Panel         │   Form Panel         │
│                      │                      │
│   [Logo]             │   "Admin Dashboard"  │
│   "Createconomy"     │   "Sign in to..."    │
│   "Admin Dashboard"  │                      │
│                      │   [SignInForm]        │
│   Tagline:           │                      │
│   "Manage your       │   "This is a         │
│   marketplace"       │   restricted area"   │
│                      │                      │
│   © 2026             │   Terms | Privacy    │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

- Left panel: `bg-zinc-950` with the Logo component, gradient overlay
- Right panel: Standard form with existing `SignInForm` component
- Responsive: On mobile, left panel hides, form fills screen

### 4.2 Update `unauthorized` Page

**File:** `apps/admin/src/app/auth/unauthorized/page.tsx`

Style consistently with the new login page design — use the same dark branding panel approach.

## Files Modified

| Action | File |
|--------|------|
| Rewrite | `apps/admin/src/app/auth/signin/page.tsx` |
| Modify | `apps/admin/src/app/auth/unauthorized/page.tsx` |

## Notes

- The actual `SignInForm` component stays unchanged — it handles OAuth and email auth
- The shared `AuthPageWrapper` is still used by other apps, so we don't modify it
- The admin login intentionally doesn't have a signup flow (admin-only access)

## Verification

- [ ] Two-column layout renders on desktop
- [ ] Left panel shows Createconomy logo on dark background
- [ ] Right panel shows sign-in form
- [ ] Mobile view hides left panel, shows form full-width
- [ ] Dark mode works correctly
- [ ] Existing auth flow still functions (OAuth buttons work)
