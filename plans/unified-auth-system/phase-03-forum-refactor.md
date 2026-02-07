# Phase 3: Refactor Forum App to Use Shared Components

## Goal

Refactor the forum app's existing auth components to import from `@createconomy/ui/components/auth` instead of maintaining local implementations. The forum is the source of truth, so this phase is essentially a **1:1 migration** — the visual output must be identical.

## Approach

The forum's local [`sign-in-form.tsx`](../../apps/forum/src/components/auth/sign-in-form.tsx) and [`sign-up-form.tsx`](../../apps/forum/src/components/auth/sign-up-form.tsx) become thin wrappers that wire the app's [`useAuth`](../../apps/forum/src/hooks/use-auth.ts) hook to the shared presentational components.

## Changes

### 3.1 — Refactor `apps/forum/src/components/auth/sign-in-form.tsx`

**Before**: 184-line component with inline SVGs, local state, and form markup
**After**: ~30-line wrapper that imports `SharedSignInForm` and passes callbacks

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

### 3.2 — Refactor `apps/forum/src/components/auth/sign-up-form.tsx`

**Before**: 265-line component with inline SVGs, validation, and form markup
**After**: ~30-line wrapper

```tsx
"use client";

import { useRouter } from "next/navigation";
import { SharedSignUpForm } from "@createconomy/ui/components/auth";
import { useAuth } from "@/hooks/use-auth";

interface SignUpFormProps {
  callbackUrl?: string;
}

export function SignUpForm({ callbackUrl = "/" }: SignUpFormProps) {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  return (
    <SharedSignUpForm
      onSubmit={async (data) => {
        await signUp(data.email, data.password, data.username ?? "");
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

### 3.3 — Auth pages remain unchanged

The page files themselves don't need changes since they already just render the form components:

- [`apps/forum/src/app/auth/signin/page.tsx`](../../apps/forum/src/app/auth/signin/page.tsx) — imports `SignInForm` from `@/components/auth/sign-in-form` (unchanged local import)
- [`apps/forum/src/app/auth/signup/page.tsx`](../../apps/forum/src/app/auth/signup/page.tsx) — imports `SignUpForm` from `@/components/auth/sign-up-form` (unchanged local import)

The page layout (heading, card wrapper, navigation links, terms text) stays in the page files. However, these pages should also be refactored to use `AuthPageWrapper` from the shared package for consistency. This can be done now or deferred.

**Decision**: Refactor pages to use `AuthPageWrapper` to ensure all apps share the identical layout wrapper.

### 3.4 — Refactor `apps/forum/src/app/auth/signin/page.tsx`

Replace the local layout markup with `AuthPageWrapper`:

```tsx
import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Createconomy Forum account",
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
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href="/auth/signup" className="text-primary hover:underline">Sign up</Link>
      </div>
    </AuthPageWrapper>
  );
}
```

### 3.5 — Refactor `apps/forum/src/app/auth/signup/page.tsx`

```tsx
import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Createconomy Forum account",
};

export default function SignUpPage() {
  return (
    <AuthPageWrapper
      title="Join the community"
      subtitle="Create an account to start participating in discussions"
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

### 3.6 — No changes to `useAuth` hook

The forum's [`useAuth`](../../apps/forum/src/hooks/use-auth.ts) hook stays as-is. It correctly wraps Convex auth.

### 3.7 — No changes to `google-one-tap.tsx`

The [`GoogleOneTap`](../../apps/forum/src/components/auth/google-one-tap.tsx) component is forum-specific and stays local for now. It can be moved to the shared package in a future phase if other apps need it.

## Files Changed

| File | Action |
|------|--------|
| `apps/forum/src/components/auth/sign-in-form.tsx` | **Rewrite** — thin wrapper around `SharedSignInForm` |
| `apps/forum/src/components/auth/sign-up-form.tsx` | **Rewrite** — thin wrapper around `SharedSignUpForm` |
| `apps/forum/src/app/auth/signin/page.tsx` | **Modify** — use `AuthPageWrapper` |
| `apps/forum/src/app/auth/signup/page.tsx` | **Modify** — use `AuthPageWrapper` |

## Verification

After this phase, visually compare the forum's sign-in and sign-up pages before and after the refactor. The output must be pixel-identical:

- Same heading text and size
- Same card border and padding
- Same form field order, labels, and placeholders
- Same OAuth button layout and icons
- Same error message styling
- Same link placements and text
- Same responsive behavior at mobile and desktop widths
