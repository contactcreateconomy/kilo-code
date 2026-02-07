# Phase 02 — Defensive Error Handling in Forum Hooks

## Objective

Add defensive error handling to all Convex query hooks used on the forum landing page so that server-side errors never crash the React render tree. Instead, errors should result in safe empty-state rendering.

## Problem

Currently, when a Convex `useQuery` call encounters a server error, it throws an unhandled exception during React rendering. The Convex React client throws errors from `useQuery` when:
1. The function doesn't exist on the server (the current issue)
2. The function throws an internal error
3. Network connectivity issues

The hooks currently only handle the `undefined` loading state but not thrown errors.

## Approach

Wrap each hook's `useQuery` call in a try/catch pattern using React error boundaries OR, more practically, use Convex's built-in error handling. Since Convex `useQuery` throws synchronously during render, the recommended pattern is to use a React Error Boundary at the component level. However, for maximum resilience, we should **also** add individual hook-level protection.

### Strategy: Convex `useQuery` + ConvexError handling

Convex's `useQuery` returns `undefined` while loading, the result on success, or throws on error. To handle this defensively, we can:

1. **Add a React Error Boundary** around the main page content
2. **Wrap individual widget components** in their own error boundaries so one widget crash doesn't take down the whole page

## Files to Modify

### 1. Create a reusable ErrorBoundary component

**File**: `apps/forum/src/components/ui/error-boundary.tsx`

```tsx
'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
```

### 2. Create a WidgetErrorFallback component

**File**: `apps/forum/src/components/ui/widget-error-fallback.tsx`

```tsx
'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@createconomy/ui';

interface WidgetErrorFallbackProps {
  message?: string;
}

export function WidgetErrorFallback({ message }: WidgetErrorFallbackProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 py-4 text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{message ?? 'Unable to load content'}</span>
      </CardContent>
    </Card>
  );
}
```

### 3. Wrap widgets in the RightSidebar with error boundaries

**File**: [`apps/forum/src/components/layout/right-sidebar.tsx`](../../apps/forum/src/components/layout/right-sidebar.tsx)

Wrap each widget component in `<ErrorBoundary>` with a `<WidgetErrorFallback>` so that if one widget's query fails, the others still render.

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { WidgetErrorFallback } from '@/components/ui/widget-error-fallback';

export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <aside className={cn('flex flex-col gap-4', className)}>
      <ErrorBoundary fallback={<WidgetErrorFallback message="Trending topics unavailable" />}>
        <WhatsVibingWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={<WidgetErrorFallback message="Leaderboard unavailable" />}>
        <LeaderboardWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={<WidgetErrorFallback message="Campaign unavailable" />}>
        <CampaignWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={<WidgetErrorFallback message="Stats unavailable" />}>
        <CommunityStatsWidget />
      </ErrorBoundary>
    </aside>
  );
}
```

### 4. Wrap the DiscussionFeed in an error boundary

**File**: [`apps/forum/src/app/page.tsx`](../../apps/forum/src/app/page.tsx)

Wrap `<DiscussionFeed />` in an `<ErrorBoundary>` with a user-friendly fallback:

```tsx
<ErrorBoundary fallback={
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <p className="text-lg font-medium text-foreground">Unable to load discussions</p>
    <p className="mt-1 text-sm text-muted-foreground">Please try refreshing the page.</p>
  </div>
}>
  <DiscussionFeed />
</ErrorBoundary>
```

### 5. Wrap the LeftSidebar campaign section in an error boundary

**File**: [`apps/forum/src/components/layout/left-sidebar.tsx`](../../apps/forum/src/components/layout/left-sidebar.tsx)

The campaign card section uses `useActiveCampaign()`. Wrap the campaign rendering section in an error boundary. The simplest approach is to wrap the entire `LeftSidebar` at the call site in `page.tsx`.

### 6. Wrap the Navbar in an error boundary

**File**: [`apps/forum/src/app/page.tsx`](../../apps/forum/src/app/page.tsx)

The `<Navbar>` uses `useAuth()` which calls `getCurrentUser`. This should generally be safe since it's already deployed, but wrapping it is good practice.

## Summary of Error Boundary Placement

```
ForumHomePage
├── ErrorBoundary → Navbar
├── ErrorBoundary → LeftSidebar (desktop)
├── ErrorBoundary → LeftSidebar (mobile)
├── ErrorBoundary → DiscussionFeed
└── RightSidebar
    ├── ErrorBoundary → WhatsVibingWidget
    ├── ErrorBoundary → LeaderboardWidget
    ├── ErrorBoundary → CampaignWidget
    └── ErrorBoundary → CommunityStatsWidget
```

## Done Criteria

- Each widget/section can fail independently without crashing the entire page
- When a Convex function throws, the affected widget shows a graceful fallback
- The page still renders navigation, sidebars, and other functioning widgets
- No `undefined` property access errors from post data variables
