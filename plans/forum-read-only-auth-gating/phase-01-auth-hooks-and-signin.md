# Phase 1: Auth Hook + Sign-In Redirect Support

## Goal
Create the foundational infrastructure: a reusable `useRequireAuth` hook and update the sign-in flow to support `returnTo` redirect after successful authentication.

---

## Task 1.1: Create `useRequireAuth` Hook

**File**: `apps/forum/src/hooks/use-require-auth.ts` (NEW)

This hook will:
- Use the existing [`useAuth()`](apps/forum/src/hooks/use-auth.ts:57) hook to check authentication state
- Use `useRouter` and `usePathname` from `next/navigation`
- If not authenticated (and not loading), redirect to `/auth/signin?returnTo=<current-path>`
- Return `{ isAuthenticated, isLoading, user }` for use in components
- While loading, return a loading state so the page can show a spinner

```typescript
// Pseudo-code structure
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./use-auth";

export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/auth/signin?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  return { isAuthenticated, isLoading, user };
}
```

---

## Task 1.2: Create `useAuthAction` Helper

**File**: `apps/forum/src/hooks/use-auth-action.ts` (NEW)

For **inline action gating** (upvote, bookmark, report, etc.) where we don't want to guard the entire page, but just a single button click:

```typescript
// Pseudo-code structure
"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./use-auth";

/**
 * Returns a wrapper function that checks auth before executing an action.
 * If not authenticated, redirects to sign-in with returnTo.
 */
export function useAuthAction() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = useCallback(
    (action: () => void | Promise<void>) => {
      if (!isAuthenticated) {
        router.push(`/auth/signin?returnTo=${encodeURIComponent(pathname)}`);
        return;
      }
      action();
    },
    [isAuthenticated, router, pathname]
  );

  return { requireAuth, isAuthenticated };
}
```

---

## Task 1.3: Update Sign-In Page to Read `returnTo` Param

**File**: [`apps/forum/src/app/auth/signin/page.tsx`](apps/forum/src/app/auth/signin/page.tsx) (MODIFY)

The sign-in page is a **server component**. It needs to:
- Read the `returnTo` search param from the URL
- Pass it to the [`SignInForm`](apps/forum/src/components/auth/sign-in-form.tsx) component as a prop

```tsx
// Add searchParams to the page props
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return (
    <AuthPageWrapper ...>
      <SignInForm returnTo={returnTo} />
      ...
    </AuthPageWrapper>
  );
}
```

---

## Task 1.4: Update Sign-In Form to Redirect After Login

**File**: [`apps/forum/src/components/auth/sign-in-form.tsx`](apps/forum/src/components/auth/sign-in-form.tsx) (MODIFY)

Need to examine and update the form to:
- Accept `returnTo?: string` prop
- After successful sign-in, redirect to `returnTo` (or `/` if not provided)
- For OAuth (Google/GitHub), include `returnTo` in the redirect URL

This requires reading the sign-in form first to determine exact changes needed.

---

## Acceptance Criteria

- [ ] `useRequireAuth` redirects unauthenticated users to `/auth/signin?returnTo=...`
- [ ] `useAuthAction` provides a wrapper that gates individual actions
- [ ] Sign-in page reads `returnTo` query param
- [ ] After successful sign-in, user is redirected back to `returnTo` path
- [ ] Loading states are handled (no flash of content before redirect)
