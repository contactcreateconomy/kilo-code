# Phase 2: Create Shared `useAuthForm` Hook

## Goal

Create a shared form-state management hook in [`@createconomy/ui`](../../packages/ui/package.json) that encapsulates common auth form patterns (loading states per provider, error handling, form submission). This hook is **not** the Convex `useAuth` hook — each app retains its own [`useAuth`](../../apps/forum/src/hooks/use-auth.ts) that wraps Convex. Instead, `useAuthForm` manages UI state for auth forms.

## Why Not Unify `useAuth` Across Apps?

Each app's [`useAuth`](../../apps/forum/src/hooks/use-auth.ts) hook has app-specific concerns:
- **Forum**: Returns `signUp(email, password, username)` — username field
- **Marketplace**: Returns `signUp(name, email, password)` — name field
- **Seller**: Incomplete placeholder, needs seller-specific role checks like `isSeller`
- **Admin**: Returns `isAdmin`, `isModerator`, `hasAdminAccess` role checks

These differences are by design. The **form state** management, however, is identical and can be shared.

## Hook to Create

### 2.1 — `use-auth-form.ts`

**Path**: [`packages/ui/src/hooks/use-auth-form.ts`](../../packages/ui/src/hooks/use-auth-form.ts)

```tsx
interface UseAuthFormOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseAuthFormReturn {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isGitHubLoading: boolean;
  isAnyLoading: boolean;
  handleSubmit: (submitFn: () => Promise<void>) => Promise<void>;
  handleGoogleAuth: (authFn: () => Promise<void>) => Promise<void>;
  handleGitHubAuth: (authFn: () => Promise<void>) => Promise<void>;
}
```

**Behavior**:
- Wraps any async auth operation with try/catch, loading state, and error extraction
- `handleSubmit` sets `isLoading`, catches errors, calls `onError` callback
- `handleGoogleAuth` sets `isGoogleLoading`, catches errors with "Google sign-in failed" fallback
- `handleGitHubAuth` sets `isGitHubLoading`, catches errors with "GitHub sign-in failed" fallback
- `isAnyLoading` computed as `isLoading || isGoogleLoading || isGitHubLoading`
- All handlers clear error state before starting
- Calls `onSuccess` on successful completion

### 2.2 — `use-auth-validation.ts`

**Path**: [`packages/ui/src/hooks/use-auth-validation.ts`](../../packages/ui/src/hooks/use-auth-validation.ts)

Shared validation logic extracted from the forum's [`SignUpForm`](../../apps/forum/src/components/auth/sign-up-form.tsx:37):

```tsx
interface ValidationRules {
  minUsernameLength?: number; // default 3
  minPasswordLength?: number; // default 8
  requireTermsAgreement?: boolean; // default true
}

interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

function validateSignUpForm(data: {
  username?: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}, rules?: ValidationRules): ValidationResult;

function validateSignInForm(data: {
  email: string;
  password: string;
}): ValidationResult;
```

**Validation rules** (matching forum behavior):
- Username: minimum 3 characters (if present)
- Password: minimum 8 characters
- Confirm password: must match password
- Terms: must be agreed to (if required)
- Email: uses HTML5 native validation via `required` + `type="email"`

## Changes to Export Maps

### `packages/ui/src/hooks/` — add files

| File | Action |
|------|--------|
| `packages/ui/src/hooks/use-auth-form.ts` | **Create** |
| `packages/ui/src/hooks/use-auth-validation.ts` | **Create** |

### `packages/ui/package.json` — verify hooks export

The existing export `"./hooks/*": "./src/hooks/*.ts"` already covers new hook files via wildcard, so no change needed.

### `packages/ui/src/index.ts` — add exports

```typescript
// Auth Form Hooks
export { useAuthForm, type UseAuthFormOptions, type UseAuthFormReturn } from "./hooks/use-auth-form";
export { validateSignUpForm, validateSignInForm, type ValidationRules, type ValidationResult } from "./hooks/use-auth-validation";
```

## Integration Pattern

Each app's auth page will wire these together:

```tsx
// Example: forum/src/components/auth/sign-in-form.tsx (after refactor)
import { SharedSignInForm } from "@createconomy/ui/components/auth";
import { useAuth } from "@/hooks/use-auth";

export function SignInForm({ callbackUrl = "/" }) {
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

The shared `SharedSignInForm` internally uses `useAuthForm` to manage loading/error states, so the consuming app only provides the async auth functions.

## Files Changed

| File | Action |
|------|--------|
| `packages/ui/src/hooks/use-auth-form.ts` | **Create** |
| `packages/ui/src/hooks/use-auth-validation.ts` | **Create** |
| `packages/ui/src/index.ts` | **Modify** — add hook exports |
