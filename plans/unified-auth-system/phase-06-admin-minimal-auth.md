# Phase 6: Update Admin App to Minimal Google-Only Sign-In Page

## Goal

Refactor the admin app's authentication page to use the shared `AdminSignInForm` component from `@createconomy/ui`, styled identically to the Google sign-in button in the forum app, with a clean and minimal presentation.

## Current State

The admin app's [`sign-in-form.tsx`](../../apps/admin/src/components/auth/sign-in-form.tsx) already has a Google-only implementation, but it uses:
- Raw `<button>` elements instead of `@createconomy/ui` `Button` component
- A custom colored Google icon (with brand colors `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) instead of `currentColor`
- A custom loading spinner instead of the shared one
- Different error styling (`bg-red-50` / `dark:bg-red-900/20`) vs the forum's `bg-red-500/10`
- A "Secure Admin Access" divider and info text
- The page at [`signin/page.tsx`](../../apps/admin/src/app/auth/signin/page.tsx) uses `bg-muted/50` background

## Target Design

A clean, centered page with:
- Createconomy branding/logo area
- "Admin Dashboard" title
- "Sign in to access the admin console" subtitle
- Single Google sign-in button (styled like forum's Google button in [`sign-in-form.tsx`](../../apps/forum/src/components/auth/sign-in-form.tsx:130))
- Error display using shared `AuthErrorAlert`
- "Only authorized administrators can access this dashboard" footer text
- No form fields, no GitHub, no registration links

## Changes

### 6.1 — Rewrite `apps/admin/src/components/auth/sign-in-form.tsx`

Replace with the shared `AdminSignInForm`:

```tsx
"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { AdminSignInForm as SharedAdminSignInForm } from "@createconomy/ui/components/auth";

export function SignInForm() {
  const { signIn } = useAuthActions();

  const handleGoogleSignIn = async () => {
    await signIn("google", { redirectTo: "/" });
  };

  return <SharedAdminSignInForm onGoogleSignIn={handleGoogleSignIn} />;
}
```

The shared `AdminSignInForm` handles loading state and error display internally.

### 6.2 — Update `apps/admin/src/app/auth/signin/page.tsx`

Use `AuthPageWrapper` for consistent layout but with admin-specific content:

```tsx
import type { Metadata } from "next";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to the Createconomy Admin Dashboard",
};

export default function SignInPage() {
  return (
    <AuthPageWrapper
      title="Admin Dashboard"
      subtitle="Sign in to access the admin console"
      footer={
        <p>
          This is a restricted area. Only authorized administrators can access this dashboard.
        </p>
      }
    >
      <SignInForm />
    </AuthPageWrapper>
  );
}
```

### 6.3 — Shared `AdminSignInForm` Design Spec

The `AdminSignInForm` component created in Phase 1 should render:

```
[Error alert if present]

[------- Google Sign In Button -------]
  - Full width
  - Uses Button variant="outline" from @createconomy/ui  
  - Google icon (same 4-path SVG as forum)
  - Text: "Continue with Google"
  - Loading state: spinner icon + "Signing in..."
  - py-3 for taller button than standard

[---- Secure Admin Access divider ----]

[Informational text]
  "Google authentication only for enhanced security."
  "Only authorized administrators with approved Google accounts can access this dashboard."
```

### 6.4 — No changes needed to `useAuth` hook

The admin's [`useAuth`](../../apps/admin/src/hooks/use-auth.ts) hook is already well-implemented and returns admin-specific role checks. No changes needed.

### 6.5 — No changes to `admin-guard.tsx`

The [`admin-guard.tsx`](../../apps/admin/src/components/auth/admin-guard.tsx) component continues to work as-is.

## Files Changed

| File | Action |
|------|--------|
| `apps/admin/src/components/auth/sign-in-form.tsx` | **Rewrite** — thin wrapper around shared `AdminSignInForm` |
| `apps/admin/src/app/auth/signin/page.tsx` | **Modify** — use `AuthPageWrapper` |

## Verification

- Page renders a single centered Google sign-in button
- Button matches the forum's Google button styling exactly (same icon, same outline variant)
- Error messages display using the shared error alert component
- No email/password fields, no GitHub button, no sign-up links
- "Secure Admin Access" divider and info text present
- Layout uses the same `AuthPageWrapper` as other apps
- Clicking the Google button triggers the Convex Google OAuth flow
