# Phase 5: Update Seller App Auth Pages to Match Forum Design

## Goal

Replace the seller app's current auth implementation — which uses a completely different split-screen layout and raw HTML elements — with the shared components matching the forum's centered card design. Also fix the non-functional OAuth buttons and incomplete `useAuth` hook.

## Current Issues with Seller Auth

1. **Layout**: Uses split-screen design with gradient branding panel on left — diverges significantly from forum
2. **[`SignInForm`](../../apps/seller/src/components/auth/sign-in-form.tsx)**: Uses raw `<input>`, `<button>`, `<label>` elements instead of `@createconomy/ui` components
3. **[`SignInForm`](../../apps/seller/src/components/auth/sign-in-form.tsx)**: OAuth buttons have no `onClick` handlers (non-functional)
4. **[`SignInForm`](../../apps/seller/src/components/auth/sign-in-form.tsx)**: Includes "Remember me" checkbox not present in forum design
5. **[`SignInForm`](../../apps/seller/src/components/auth/sign-in-form.tsx)**: Contains its own heading/subheading — should be in page layout
6. **[`SignUpForm`](../../apps/seller/src/components/auth/sign-up-form.tsx)**: Multi-step seller application form with store details — very different from standard sign-up
7. **[`useAuth`](../../apps/seller/src/hooks/use-auth.ts)**: Incomplete placeholder with TODOs, doesn't call Convex, no `signIn`/`signUp` methods
8. **[`useAuth`](../../apps/seller/src/hooks/use-auth.ts)**: Uses local `useState` for user instead of Convex queries

## Important Design Decision: Seller Sign-Up

The seller app's current sign-up is a **multi-step seller application form** (3 steps: account → store info → review). This is fundamentally different from the forum's simple sign-up form.

**Decision**: The seller sign-up should use the **standard shared sign-up form** for account creation (matching forum design), and then redirect to a separate **seller application form** page after account creation. This separates concerns:

1. `/auth/signup` — Standard account creation (shared `SharedSignUpForm`)
2. `/auth/apply` — Seller-specific application form (keep existing multi-step, but refactored)

This way, the auth pages are visually identical across apps, while the seller-specific business logic lives in its own page.

## Changes

### 5.1 — Fix `apps/seller/src/hooks/use-auth.ts`

Replace the incomplete placeholder with a proper Convex-backed implementation:

```tsx
"use client";

import { useCallback } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@createconomy/convex";

interface User {
  _id: string;
  email?: string;
  name?: string;
  image?: string;
  profile?: {
    defaultRole?: string;
  } | null;
}

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();

  const user = useQuery(
    api.functions.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  ) as User | null | undefined;

  const signIn = useCallback(
    async (email: string, password: string) => {
      await convexSignIn("password", { email, password, flow: "signIn" });
    },
    [convexSignIn]
  );

  const signUp = useCallback(
    async (email: string, password: string, username: string) => {
      await convexSignIn("password", { email, password, username, flow: "signUp" });
    },
    [convexSignIn]
  );

  const signInWithGoogle = useCallback(async () => {
    await convexSignIn("google");
  }, [convexSignIn]);

  const signInWithGitHub = useCallback(async () => {
    await convexSignIn("github");
  }, [convexSignIn]);

  const signOut = useCallback(async () => {
    await convexSignOut();
  }, [convexSignOut]);

  const role = user?.profile?.defaultRole;

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    isSeller: role === "seller" || role === "admin",
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  };
}
```

Keep the `useRequireAuth` and `useRequireSeller` helper hooks from the existing file but update them to use the new `useAuth` return values.

### 5.2 — Rewrite `apps/seller/src/components/auth/sign-in-form.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { SharedSignInForm } from "@createconomy/ui/components/auth";
import { useAuth } from "@/hooks/use-auth";

interface SignInFormProps {
  callbackUrl?: string;
}

export function SignInForm({ callbackUrl = "/" }: SignInFormProps) {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();

  return (
    <SharedSignInForm
      onSubmit={async (email, password) => {
        await signIn(email, password);
        router.push(callbackUrl);
      }}
      onGoogleSignIn={async () => {
        await signInWithGoogle();
        router.push(callbackUrl);
      }}
      onGitHubSignIn={async () => {
        await signInWithGitHub();
        router.push(callbackUrl);
      }}
    />
  );
}
```

### 5.3 — Rewrite `apps/seller/src/components/auth/sign-up-form.tsx`

Replace the multi-step seller application form with the standard shared sign-up form:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { SharedSignUpForm } from "@createconomy/ui/components/auth";
import { useAuth } from "@/hooks/use-auth";

interface SignUpFormProps {
  callbackUrl?: string;
}

export function SignUpForm({ callbackUrl = "/auth/apply" }: SignUpFormProps) {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  return (
    <SharedSignUpForm
      onSubmit={async (data) => {
        await signUp(data.email, data.password, data.username ?? "");
        // Redirect to seller application form after account creation
        router.push(callbackUrl);
      }}
      onGoogleSignUp={async () => {
        await signInWithGoogle();
        router.push(callbackUrl);
      }}
      onGitHubSignUp={async () => {
        await signInWithGitHub();
        router.push(callbackUrl);
      }}
      fields={{
        showUsername: true,
        usernameLabel: "Username",
        usernamePlaceholder: "johndoe",
      }}
    />
  );
}
```

Note: After sign-up, the user is redirected to `/auth/apply` to complete the seller application.

### 5.4 — Rewrite `apps/seller/src/app/auth/signin/page.tsx`

Replace the split-screen layout with `AuthPageWrapper`:

```tsx
import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your seller account",
};

export default function SignInPage() {
  return (
    <AuthPageWrapper
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footer={
        <p>
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      }
    >
      <SignInForm />
      <div className="mt-4 text-center">
        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
          Forgot your password?
        </Link>
      </div>
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">Don't have a seller account? </span>
        <Link href="/auth/signup" className="text-primary hover:underline">Apply to sell</Link>
      </div>
    </AuthPageWrapper>
  );
}
```

### 5.5 — Rewrite `apps/seller/src/app/auth/signup/page.tsx`

```tsx
import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an account to start selling on Createconomy",
};

export default function SignUpPage() {
  return (
    <AuthPageWrapper
      title="Join the community"
      subtitle="Create an account to start your seller journey"
    >
      <SignUpForm />
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/auth/signin" className="text-primary hover:underline">Sign in</Link>
      </div>
    </AuthPageWrapper>
  );
}
```

### 5.6 — Move seller application form to `/auth/apply`

Create a new page at `apps/seller/src/app/auth/apply/page.tsx` that contains the refactored multi-step seller application form from the old [`sign-up-form.tsx`](../../apps/seller/src/components/auth/sign-up-form.tsx). This page is for authenticated users who want to become sellers.

This is a separate task from the auth unification — it preserves the existing seller-specific business logic in a new location. The multi-step form can keep its current design since it's not an auth page.

### 5.7 — Verify `seller-guard.tsx` still works

The existing [`seller-guard.tsx`](../../apps/seller/src/components/auth/seller-guard.tsx) component should continue to work since we're updating the `useAuth` hook to return the same interface shape.

## Files Changed

| File | Action |
|------|--------|
| `apps/seller/src/hooks/use-auth.ts` | **Rewrite** — proper Convex implementation |
| `apps/seller/src/components/auth/sign-in-form.tsx` | **Rewrite** — thin wrapper around `SharedSignInForm` |
| `apps/seller/src/components/auth/sign-up-form.tsx` | **Rewrite** — thin wrapper around `SharedSignUpForm` |
| `apps/seller/src/app/auth/signin/page.tsx` | **Rewrite** — use `AuthPageWrapper` |
| `apps/seller/src/app/auth/signup/page.tsx` | **Rewrite** — use `AuthPageWrapper` |
| `apps/seller/src/app/auth/apply/page.tsx` | **Create** — relocated seller application form |
| `apps/seller/src/components/auth/seller-application-form.tsx` | **Create** — extracted from old `sign-up-form.tsx` |

## Verification

- Sign-in page must visually match forum's sign-in page exactly
- Sign-up page must visually match forum's sign-up page exactly
- OAuth buttons must be functional
- After sign-up, user should be redirected to `/auth/apply`
- Seller application form at `/auth/apply` must retain all existing fields and multi-step behavior
- `seller-guard.tsx` must continue to function correctly
