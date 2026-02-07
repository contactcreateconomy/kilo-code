# Phase 7: Testing and Verification Across All Apps

## Goal

Verify that all four applications render their auth pages correctly with consistent design, functional OAuth, and no regressions.

## Verification Checklist

### 7.1 — TypeScript Type Checking

Run type checking on each app sequentially per the project's [TypeScript check rules](../../.kilocode/rules/typescript-check.md):

1. `pnpm --filter @createconomy/config typecheck`
2. `pnpm --filter @createconomy/convex typecheck`
3. `pnpm --filter @createconomy/ui typecheck`
4. `pnpm --filter @createconomy/forum typecheck`
5. `pnpm --filter @createconomy/marketplace typecheck`
6. `pnpm --filter @createconomy/seller typecheck`
7. `pnpm --filter @createconomy/admin typecheck`

All must pass with zero errors.

### 7.2 — Lint Check

Run `pnpm lint` across all apps to ensure no lint violations were introduced.

### 7.3 — Build Verification

Build each app sequentially per the project's [local build rules](../../.kilocode/rules/local-build.md):

1. Build packages first: `@createconomy/config` → `@createconomy/convex` → `@createconomy/ui`
2. Build apps: `@createconomy/admin` → `@createconomy/forum` → `@createconomy/marketplace` → `@createconomy/seller`

All must build without errors.

### 7.4 — Visual Verification Matrix

Launch each app and verify the auth pages visually:

| Page | Forum | Marketplace | Seller | Admin |
|------|-------|-------------|--------|-------|
| **Sign In - Layout** | Centered `max-w-md` card | Same as Forum | Same as Forum | Same as Forum |
| **Sign In - Heading** | "Welcome back" / `text-3xl font-bold` | Same | Same | "Admin Dashboard" |
| **Sign In - Email field** | `Input` with `you@example.com` placeholder | Same | Same | N/A |
| **Sign In - Password field** | `Input` with `••••••••` placeholder | Same | Same | N/A |
| **Sign In - Submit button** | "Sign In" full-width `Button` | Same | Same | N/A |
| **Sign In - OAuth divider** | "Or continue with" | Same | Same | "Secure Admin Access" |
| **Sign In - Google button** | Outline button with Google icon | Same | Same | Full-width "Continue with Google" |
| **Sign In - GitHub button** | Outline button with GitHub icon | Same | Same | N/A |
| **Sign In - Forgot password** | Link below form | Same | Same | N/A |
| **Sign In - Sign up link** | Below card | Same | "Apply to sell" | N/A |
| **Sign In - Terms footer** | Below card | Same | Same | Restricted area notice |
| **Sign In - Error display** | Red alert with border | Same | Same | Same |
| **Sign Up - Layout** | Centered `max-w-md` card | Same | Same | N/A |
| **Sign Up - Username field** | Present | Present | Present | N/A |
| **Sign Up - Confirm password** | Present | Present | Present | N/A |
| **Sign Up - Terms checkbox** | Present | Present | Present | N/A |
| **Sign Up - OAuth buttons** | Google + GitHub grid | Same | Same | N/A |

### 7.5 — Functional Testing

For each app, verify these interactions:

1. **Form validation**: Submit empty form → error messages appear
2. **Password validation**: Enter < 8 chars → error on sign-up
3. **Password mismatch**: Confirm password doesn't match → error on sign-up
4. **Terms required**: Don't check terms → error on sign-up
5. **Google OAuth**: Click Google button → redirect to Google
6. **GitHub OAuth**: Click GitHub button → redirect to GitHub
7. **Loading states**: All buttons disable and show loading indicator during auth
8. **Error handling**: Invalid credentials → error message displayed
9. **Navigation**: Sign in ↔ Sign up links work correctly

### 7.6 — Responsive Testing

Check at these breakpoints:

| Breakpoint | Expected |
|-----------|----------|
| Mobile (375px) | Full-width card with `px-4` padding |
| Tablet (768px) | Centered `max-w-md` card |
| Desktop (1024px+) | Same as tablet — centered card |

### 7.7 — Dark Mode Testing

Toggle dark mode and verify:
- Card background switches correctly (`bg-card`)
- Text colors switch (`text-foreground`, `text-muted-foreground`)
- Error alert background works in dark mode
- OAuth buttons outline visible in dark mode
- Input focus rings visible in dark mode

## Rollback Plan

If any app has regressions:
1. The old component implementations are preserved in git history
2. Revert the specific app's changes while keeping the shared components
3. The thin wrapper pattern means only the app-level wrapper file needs reverting

## Files to Verify (no changes in this phase)

This phase performs verification only. No files are created or modified.

## Success Criteria

- All 4 apps type-check clean
- All 4 apps build successfully
- Forum, marketplace, and seller sign-in pages are visually identical
- Forum, marketplace, and seller sign-up pages are visually identical
- Admin sign-in page shows only Google button
- All OAuth buttons are functional across all apps
- No console errors on any auth page
- Dark mode works on all auth pages
- Responsive layout works at all breakpoints
