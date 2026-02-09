# Phase 6: Create Shared NotificationIcon + Spinner Components

> Extract duplicated patterns into shared, reusable components.

## Prerequisites

- Phase 1 (shadcn install for Spinner)
- Phase 3 (forum color tokens applied — so icons use tokens)

## Components to Create

### 6.1 Create `Spinner` component

**File:** `packages/ui/src/components/spinner.tsx`

If shadcn `spinner` was installed in Phase 1, this step is already done. If not, create a simple wrapper:

```tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return <Loader2 className={cn('animate-spin', sizes[size], className)} />;
}
```

**Export from `packages/ui/src/index.ts`:**
```typescript
export { Spinner } from "./components/spinner";
```

### 6.2 Replace all `Loader2` + `animate-spin` usages

**Files to update (~20 files):**

Search pattern: `<Loader2 className="...animate-spin..."` or `<Loader2 className="h-* w-* animate-spin"`

Replace with:
```tsx
import { Spinner } from '@createconomy/ui';

// Instead of: <Loader2 className="h-4 w-4 animate-spin" />
<Spinner size="sm" />

// Instead of: <Loader2 className="h-6 w-6 animate-spin" />
<Spinner />

// Instead of: <Loader2 className="h-8 w-8 animate-spin" />
<Spinner size="lg" />
```

**Forum files with Loader2:**
- `apps/forum/src/components/auth/auth-guard.tsx`
- `apps/forum/src/components/comments/comment-form.tsx`
- `apps/forum/src/components/comments/comment-tree.tsx`
- `apps/forum/src/components/discussion/community-dropdown.tsx`
- `apps/forum/src/components/discussion/discussion-form.tsx`
- `apps/forum/src/components/feed/discussion-feed.tsx`
- `apps/forum/src/components/layout/sidebar.tsx`
- `apps/forum/src/components/layout/left-sidebar.tsx`
- `apps/forum/src/components/widgets/active-campaign.tsx`
- `apps/forum/src/components/widgets/whats-vibing.tsx`
- `apps/forum/src/components/widgets/leaderboard.tsx`
- `apps/forum/src/components/widgets/community-stats.tsx`
- `apps/forum/src/components/widgets/campaign-widget.tsx`
- `apps/forum/src/app/t/[id]/page.tsx`
- `apps/forum/src/app/t/new/page.tsx`
- `apps/forum/src/app/c/[slug]/page.tsx`
- `apps/forum/src/app/u/[username]/page.tsx`
- `apps/forum/src/app/u/[username]/followers/page.tsx`
- `apps/forum/src/app/u/[username]/following/page.tsx`
- `apps/forum/src/app/account/flair/page.tsx`
- `apps/forum/src/components/forum/reply-form.tsx`

### 6.3 Create `NotificationIcon` component

**File:** `packages/ui/src/components/notification-icon.tsx`

This component is currently duplicated in two places:
- `apps/forum/src/components/navbar/navbar.tsx` (lines ~179-194)
- `apps/forum/src/app/account/notifications/inbox/page.tsx` (lines ~96-112)

```tsx
import {
  MessageSquare,
  Heart,
  AtSign,
  Users,
  Trophy,
  Pin,
  Lock,
  Shield,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType =
  | 'reply'
  | 'upvote'
  | 'mention'
  | 'follow'
  | 'campaign'
  | 'thread_pin'
  | 'thread_lock'
  | 'mod_action';

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

const iconMap: Record<NotificationType, { icon: typeof Bell; colorClass: string }> = {
  reply: { icon: MessageSquare, colorClass: 'text-primary' },
  upvote: { icon: Heart, colorClass: 'text-destructive' },
  mention: { icon: AtSign, colorClass: 'text-primary' },
  follow: { icon: Users, colorClass: 'text-success' },
  campaign: { icon: Trophy, colorClass: 'text-warning' },
  thread_pin: { icon: Pin, colorClass: 'text-upvote' },
  thread_lock: { icon: Lock, colorClass: 'text-upvote' },
  mod_action: { icon: Shield, colorClass: 'text-upvote' },
};

export function NotificationIcon({ type, className }: NotificationIconProps) {
  const config = iconMap[type] ?? { icon: Bell, colorClass: 'text-muted-foreground' };
  const Icon = config.icon;
  return <Icon className={cn('h-4 w-4', config.colorClass, className)} />;
}
```

**Export from `packages/ui/src/index.ts`:**
```typescript
export { NotificationIcon, type NotificationType } from "./components/notification-icon";
```

### 6.4 Replace duplicated notification icon logic

**File 1:** `apps/forum/src/components/navbar/navbar.tsx`

Replace the switch statement (lines ~179-194) with:
```tsx
import { NotificationIcon } from '@createconomy/ui';

// Instead of the switch:
<NotificationIcon type={notification.type} />
```

**File 2:** `apps/forum/src/app/account/notifications/inbox/page.tsx`

Replace the switch statement (lines ~96-112) with:
```tsx
import { NotificationIcon } from '@createconomy/ui';

<NotificationIcon type={notification.type} />
```

## Acceptance Criteria

- [ ] `Spinner` component created and exported from `@createconomy/ui`
- [ ] All `Loader2 + animate-spin` replaced with `<Spinner />` across ~20 files
- [ ] `NotificationIcon` component created and exported from `@createconomy/ui`
- [ ] Both notification icon switch statements replaced with `<NotificationIcon />`
- [ ] No direct `lucide-react` Loader2 imports remain (except in the Spinner component itself)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
