# Phase 2: Page-Level Auth Guards

## Goal
Protect pages that require authentication: **Create Discussion** (`/t/new`) and **Account Settings** (`/account/*`). Unauthenticated users visiting these pages should be redirected to sign-in.

---

## Task 2.1: Guard `/t/new` (New Discussion Page)

**File**: [`apps/forum/src/app/t/new/page.tsx`](apps/forum/src/app/t/new/page.tsx) (MODIFY)

Current state: No auth check. Any visitor can access the create discussion form.

Changes:
- Import and call `useRequireAuth()` at the top of the component
- While `isLoading`, show a centered spinner
- If `useRequireAuth` triggers a redirect, the component won't render further
- The [`DiscussionForm`](apps/forum/src/components/discussion/discussion-form.tsx) already calls Convex mutations which would fail server-side for unauthenticated users, but we want to prevent the UI from even showing

```tsx
export default function NewDiscussionPage() {
  const { isLoading } = useRequireAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ... rest of the existing component
}
```

---

## Task 2.2: Guard `/account/*` (Account Settings)

**File**: [`apps/forum/src/app/account/layout.tsx`](apps/forum/src/app/account/layout.tsx) (MODIFY)

Current state: Server component with no auth check. Shows account settings UI to anyone.

**Approach**: Convert to a client-side wrapper pattern since auth state is client-side via Convex:

Option A — Create a client wrapper component:

**New file**: `apps/forum/src/components/auth/auth-guard.tsx`

```tsx
"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // useRequireAuth already triggered redirect
  }

  return <>{children}</>;
}
```

Then update the account layout to wrap children:

```tsx
// apps/forum/src/app/account/layout.tsx
// Keep it as a server component for metadata, but wrap content
import { AccountContent } from "./account-content"; // new client component

export default function AccountLayout({ children }) {
  return <AccountContent>{children}</AccountContent>;
}
```

**New file**: `apps/forum/src/app/account/account-content.tsx`

This client component uses `AuthGuard` + renders the sidebar navigation and child content.

---

## Acceptance Criteria

- [ ] Visiting `/t/new` while not authenticated redirects to `/auth/signin?returnTo=/t/new`
- [ ] Visiting `/account` while not authenticated redirects to `/auth/signin?returnTo=/account`
- [ ] Visiting `/account/notifications` while not authenticated redirects appropriately
- [ ] Loading spinner shown during auth state resolution (no flash of protected content)
- [ ] Authenticated users see pages as normal with no behavior change
