# Phase 4: Update Marketplace App Auth Pages to Match Forum Design

## Goal

Replace the marketplace's current auth implementation with the shared components, producing pages that look identical to the forum's auth pages.

## Current Issues with Marketplace Auth

1. **[`SignInForm`](../../apps/marketplace/src/components/auth/sign-in-form.tsx)**: OAuth buttons have no `onClick` handlers (non-functional)
2. **[`SignInForm`](../../apps/marketplace/src/components/auth/sign-in-form.tsx)**: Error styling uses `bg-destructive/10` instead of forum's `bg-red-500/10`
3. **[`SignInForm`](../../apps/marketplace/src/components/auth/sign-in-form.tsx)**: Forgot password link is inline with password label, not below the form
4. **[`SignInForm`](../../apps/marketplace/src/components/auth/sign-in-form.tsx)**: Sign up link is inside the form, not outside the card
5. **[`SignUpForm`](../../apps/marketplace/src/components/auth/sign-up-form.tsx)**: Uses "Full Name" field instead of "Username"
6. **[`SignUpForm`](../../apps/marketplace/src/components/auth/sign-up-form.tsx)**: OAuth buttons have no `onClick` handlers (non-functional)
7. **Pages**: Layout uses `min-h-[calc(100vh-16rem)]` instead of forum's `py-16` with no min-height calc
8. **Pages**: No card wrapper (`rounded-lg border bg-card p-6`) around the form
9. **[`useAuth`](../../apps/marketplace/src/hooks/use-auth.ts)**: Has different `signUp` signature — `signUp(name, email, password)` vs forum's `signUp(email, password, username)`

## Changes

### 4.1 — Rewrite `apps/marketplace/src/components/auth/sign-in-form.tsx`

Replace with thin wrapper around `SharedSignInForm`:

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

This fixes:
- Non-functional OAuth buttons (now wired to `signInWithGoogle`/`signInWithGitHub`)
- Inconsistent error styling (now uses shared `AuthErrorAlert`)
- Inconsistent layout (now matches forum exactly)

### 4.2 — Rewrite `apps/marketplace/src/components/auth/sign-up-form.tsx`

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
        // Marketplace signUp uses (name, email, password) signature
        await signUp(data.username ?? "", data.email, data.password);
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

### 4.3 — Rewrite `apps/marketplace/src/app/auth/signin/page.tsx`

Replace current layout with `AuthPageWrapper` to match forum design:

```tsx
import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Createconomy account.",
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

### 4.4 — Rewrite `apps/marketplace/src/app/auth/signup/page.tsx`

```tsx
import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Createconomy account.",
};

export default function SignUpPage() {
  return (
    <AuthPageWrapper
      title="Join the community"
      subtitle="Create an account to discover and purchase digital products"
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

### 4.5 — No changes to `useAuth` hook

The marketplace's [`useAuth`](../../apps/marketplace/src/hooks/use-auth.ts) hook is already well-implemented and functional. The different `signUp` parameter order is handled in the wrapper component (4.2 above).

## Files Changed

| File | Action |
|------|--------|
| `apps/marketplace/src/components/auth/sign-in-form.tsx` | **Rewrite** — thin wrapper around `SharedSignInForm` |
| `apps/marketplace/src/components/auth/sign-up-form.tsx` | **Rewrite** — thin wrapper around `SharedSignUpForm` |
| `apps/marketplace/src/app/auth/signin/page.tsx` | **Rewrite** — use `AuthPageWrapper` |
| `apps/marketplace/src/app/auth/signup/page.tsx` | **Rewrite** — use `AuthPageWrapper` |

## Verification

- Sign-in page must visually match forum's sign-in page
- Sign-up page must visually match forum's sign-up page
- OAuth buttons must be functional (redirect to Google/GitHub)
- Error messages must display using shared styling
- Form validation must enforce same rules as forum
