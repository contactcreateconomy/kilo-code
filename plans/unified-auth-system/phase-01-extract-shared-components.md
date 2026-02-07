# Phase 1: Extract Shared Auth Components into `@createconomy/ui`

## Goal

Create reusable auth UI components in the shared [`packages/ui`](../../packages/ui/package.json) package so all four apps can import identical authentication building blocks. These components must be **presentational only** — they accept callbacks and state as props, keeping auth logic in each app's own hooks.

## Components to Create

### 1.1 — `auth-icons.tsx`

**Path**: [`packages/ui/src/components/auth/auth-icons.tsx`](../../packages/ui/src/components/auth/auth-icons.tsx)

Extract the duplicated SVG icons into named exports:

- `GoogleIcon` — The Google "G" logo SVG (4-color version used in forum [`sign-in-form.tsx`](../../apps/forum/src/components/auth/sign-in-form.tsx:142))
- `GitHubIcon` — The GitHub octocat SVG (used in forum [`sign-in-form.tsx`](../../apps/forum/src/components/auth/sign-in-form.tsx:175))
- `SpinnerIcon` — The loading spinner SVG (used in forum [`sign-in-form.tsx`](../../apps/forum/src/components/auth/sign-in-form.tsx:137))

Each icon should accept `className` props and default to `w-4 h-4`. Use `fill="currentColor"` for GitHub and spinner; keep original multi-color `fill` values for Google icon.

### 1.2 — `auth-error-alert.tsx`

**Path**: [`packages/ui/src/components/auth/auth-error-alert.tsx`](../../packages/ui/src/components/auth/auth-error-alert.tsx)

Standardized error display matching the forum design:

```tsx
interface AuthErrorAlertProps {
  error: string | null;
}
```

- Renders nothing if `error` is null
- Uses: `p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm`
- Supports dark mode with `dark:text-red-400`

### 1.3 — `oauth-divider.tsx`

**Path**: [`packages/ui/src/components/auth/oauth-divider.tsx`](../../packages/ui/src/components/auth/oauth-divider.tsx)

The "Or continue with" divider matching forum design:

```tsx
interface OAuthDividerProps {
  text?: string; // defaults to "Or continue with"
}
```

- Uses the `relative` container with `absolute inset-0 flex items-center` border and centered text
- Background: `bg-card px-2 text-muted-foreground`
- Text: `text-xs uppercase`

### 1.4 — `social-login-grid.tsx`

**Path**: [`packages/ui/src/components/auth/social-login-grid.tsx`](../../packages/ui/src/components/auth/social-login-grid.tsx)

Combined Google + GitHub OAuth buttons in a grid:

```tsx
interface SocialLoginGridProps {
  onGoogleClick: () => void;
  onGitHubClick: () => void;
  isGoogleLoading?: boolean;
  isGitHubLoading?: boolean;
  disabled?: boolean;
}
```

- Layout: `grid grid-cols-2 gap-3`
- Each button uses `Button variant="outline"` from `@createconomy/ui`
- Shows `SpinnerIcon` when loading, otherwise shows `GoogleIcon`/`GitHubIcon`
- Matches forum's button structure exactly

### 1.5 — `sign-in-form.tsx` (shared)

**Path**: [`packages/ui/src/components/auth/sign-in-form.tsx`](../../packages/ui/src/components/auth/sign-in-form.tsx)

Presentational sign-in form matching the forum's [`SignInForm`](../../apps/forum/src/components/auth/sign-in-form.tsx):

```tsx
interface SharedSignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onGitHubSignIn: () => Promise<void>;
  callbackUrl?: string;
  error?: string | null;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  isGitHubLoading?: boolean;
}
```

- Composes: `AuthErrorAlert`, `OAuthDivider`, `SocialLoginGrid`
- Uses shared `Input`, `Label`, `Button` from `@createconomy/ui`
- Internal state for email/password fields only
- All auth logic delegated to callbacks

### 1.6 — `sign-up-form.tsx` (shared)

**Path**: [`packages/ui/src/components/auth/sign-up-form.tsx`](../../packages/ui/src/components/auth/sign-up-form.tsx)

Presentational sign-up form matching the forum's [`SignUpForm`](../../apps/forum/src/components/auth/sign-up-form.tsx):

```tsx
interface SharedSignUpFormProps {
  onSubmit: (data: SignUpData) => Promise<void>;
  onGoogleSignUp: () => Promise<void>;
  onGitHubSignUp: () => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  isGitHubLoading?: boolean;
  /** Field config - some apps may not need username */
  fields?: {
    showUsername?: boolean; // default true
    usernameLabel?: string; // default "Username"
    usernamePlaceholder?: string; // default "johndoe"
  };
  /** Links config for terms and privacy */
  termsUrl?: string; // default "/terms"
  privacyUrl?: string; // default "/privacy"
}

interface SignUpData {
  username?: string;
  email: string;
  password: string;
}
```

- Includes client-side validation matching forum: username ≥ 3 chars, password ≥ 8 chars, password confirmation match, terms agreement
- Composes: `AuthErrorAlert`, `OAuthDivider`, `SocialLoginGrid`

### 1.7 — `admin-sign-in-form.tsx`

**Path**: [`packages/ui/src/components/auth/admin-sign-in-form.tsx`](../../packages/ui/src/components/auth/admin-sign-in-form.tsx)

Minimal Google-only sign-in form for the admin app:

```tsx
interface AdminSignInFormProps {
  onGoogleSignIn: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}
```

- Single Google sign-in button styled identically to the forum's Google button
- Uses `AuthErrorAlert` for error display
- Includes the "Secure Admin Access" divider and informational text

### 1.8 — `auth-page-wrapper.tsx`

**Path**: [`packages/ui/src/components/auth/auth-page-wrapper.tsx`](../../packages/ui/src/components/auth/auth-page-wrapper.tsx)

Shared page layout wrapper matching the forum's auth page structure:

```tsx
interface AuthPageWrapperProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer?: ReactNode;
}
```

- Renders: `container mx-auto px-4 py-16` → `max-w-md` centered
- Heading area with `text-3xl font-bold tracking-tight mb-2`
- Card wrapper with `rounded-lg border bg-card p-6`
- Optional footer for terms/privacy text

## Changes to `packages/ui/src/components/auth/index.ts`

Add exports for all new components:

```typescript
// Existing exports remain...

// Auth Form Components (new)
export { AuthErrorAlert, type AuthErrorAlertProps } from "./auth-error-alert";
export { OAuthDivider, type OAuthDividerProps } from "./oauth-divider";
export { SocialLoginGrid, type SocialLoginGridProps } from "./social-login-grid";
export { GoogleIcon, GitHubIcon, SpinnerIcon } from "./auth-icons";
export { SharedSignInForm, type SharedSignInFormProps } from "./sign-in-form";
export { SharedSignUpForm, type SharedSignUpFormProps, type SignUpData } from "./sign-up-form";
export { AdminSignInForm, type AdminSignInFormProps } from "./admin-sign-in-form";
export { AuthPageWrapper, type AuthPageWrapperProps } from "./auth-page-wrapper";
```

## Changes to `packages/ui/src/index.ts`

Add a top-level re-export comment pointing to the auth sub-module:

```typescript
// Auth components available via "@createconomy/ui/components/auth"
// See packages/ui/src/components/auth/index.ts for full list
```

No need to re-export from main index since auth components are accessed via the subpath export `@createconomy/ui/components/auth`.

## Files Changed

| File | Action |
|------|--------|
| `packages/ui/src/components/auth/auth-icons.tsx` | **Create** |
| `packages/ui/src/components/auth/auth-error-alert.tsx` | **Create** |
| `packages/ui/src/components/auth/oauth-divider.tsx` | **Create** |
| `packages/ui/src/components/auth/social-login-grid.tsx` | **Create** |
| `packages/ui/src/components/auth/sign-in-form.tsx` | **Create** |
| `packages/ui/src/components/auth/sign-up-form.tsx` | **Create** |
| `packages/ui/src/components/auth/admin-sign-in-form.tsx` | **Create** |
| `packages/ui/src/components/auth/auth-page-wrapper.tsx` | **Create** |
| `packages/ui/src/components/auth/index.ts` | **Modify** — add new exports |
| `packages/ui/src/index.ts` | **Modify** — add comment about auth subpath |

## Important Notes

- All new components are `"use client"` since they use React state and event handlers
- Components must use `@createconomy/ui` primitives (`Button`, `Input`, `Label`) not raw HTML
- The shared forms do NOT import `useAuth` or any Convex hooks — they receive auth callbacks as props
- This keeps the components framework-agnostic within the auth boundary (each app wires its own Convex auth)
- `next/link` is used for navigation links — since all apps are Next.js, this is acceptable in the shared package (Next.js is already a peer dependency pattern in this monorepo)
