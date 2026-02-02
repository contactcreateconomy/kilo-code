# Phase 7: Animations & Polish

## Overview
Add Framer Motion animations, micro-interactions, loading skeletons, and final polish to all components.

## Current Status: NOT STARTED

## Prerequisites
- Phase 1-6 completed

## Animation Reference Table

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page load | Stagger fade-in | 50ms delay each | easeOut |
| Hover states | Smooth transitions | 200ms | easeInOut |
| Upvote click | Bounce scale 1.2 → 1 | 300ms | spring |
| Card hover | Glow + lift -2px | 200ms | easeOut |
| Search expand | Width 40px → 320px | 300ms | easeInOut |
| Theme toggle | Rotate 180deg | 300ms | easeInOut |
| Notification open | Slide down + bounce | 300ms | spring |
| Slider auto-play | Smooth slide | 500ms | easeInOut |
| Category select | Background slide | 200ms | spring |
| Tab switch | Layout animation | 500ms | spring |

## Tasks

### 7.1 Create Animation Variants File
**File:** `apps/forum/src/lib/animations.ts`

```typescript
import { Variants } from 'framer-motion';

// Page transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Stagger container for lists
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Stagger item for list children
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Card hover effect
export const cardHover: Variants = {
  initial: { y: 0, boxShadow: '0 0 0 rgba(99, 102, 241, 0)' },
  hover: { 
    y: -2, 
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
    transition: { duration: 0.2 },
  },
};

// Scale bounce for buttons
export const scaleBounce: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
  hover: { scale: 1.02 },
};

// Upvote bounce animation
export const upvoteBounce: Variants = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.3, 1],
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Slide in from right
export const slideInRight: Variants = {
  initial: { x: 20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Fade in
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

// Dropdown animation
export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// Drawer animation
export const drawerVariants: Variants = {
  initial: { x: '-100%' },
  animate: { 
    x: 0,
    transition: { type: 'spring', damping: 25, stiffness: 200 },
  },
  exit: { 
    x: '-100%',
    transition: { duration: 0.2 },
  },
};

// Glow pulse animation
export const glowPulse: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(99, 102, 241, 0.4)',
      '0 0 30px rgba(99, 102, 241, 0.6)',
      '0 0 20px rgba(99, 102, 241, 0.4)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Morphing card animation
export const morphCard: Variants = {
  initial: { opacity: 0, y: 20, rotateX: -15 },
  animate: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    rotateX: 15,
    transition: { duration: 0.3 },
  },
};
```

### 7.2 Create AnimatedPage Wrapper
**File:** `apps/forum/src/components/ui/animated-page.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { pageVariants, staggerContainer } from '@/lib/animations';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedList({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### 7.3 Create Loading Skeletons
**File:** `apps/forum/src/components/ui/skeletons.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn('bg-muted rounded-md', className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function DiscussionCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 border-t">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-6 h-6 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeaturedSliderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[280px] w-full rounded-2xl" />
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="w-2 h-2 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-xl" />
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 mb-3" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <Skeleton className="h-5 w-40" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}
```

### 7.4 Create Micro-interaction Hooks
**File:** `apps/forum/src/hooks/use-hover-glow.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';

export function useHoverGlow() {
  const [isHovered, setIsHovered] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return {
    isHovered,
    glowPosition,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}
```

### 7.5 Create GlowEffect Component
**File:** `apps/forum/src/components/ui/glow-effect.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';

interface GlowEffectProps {
  isVisible: boolean;
  position: { x: number; y: number };
  size?: number;
  color?: string;
}

export function GlowEffect({ 
  isVisible, 
  position, 
  size = 200,
  color = 'rgba(99, 102, 241, 0.15)'
}: GlowEffectProps) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full blur-3xl"
      style={{
        width: size,
        height: size,
        left: position.x - size / 2,
        top: position.y - size / 2,
        background: color,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{ duration: 0.2 }}
    />
  );
}
```

### 7.6 Update Components with Animations

#### Update DiscussionCard with Enhanced Animations
Add to [`discussion-card.tsx`](../../apps/forum/src/components/feed/discussion-card.tsx):

```typescript
// Add imports
import { useHoverGlow } from '@/hooks/use-hover-glow';
import { GlowEffect } from '@/components/ui/glow-effect';
import { cardHover, upvoteBounce } from '@/lib/animations';

// In component:
const { isHovered, glowPosition, handlers } = useHoverGlow();

// Wrap card with:
<motion.div
  variants={cardHover}
  initial="initial"
  whileHover="hover"
  {...handlers}
  className="relative overflow-hidden"
>
  <GlowEffect isVisible={isHovered} position={glowPosition} />
  {/* ... rest of card */}
</motion.div>
```

### 7.7 Add Page Transitions
**File:** `apps/forum/src/app/template.tsx`

```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### 7.8 Create Toast Notifications
**File:** `apps/forum/src/components/ui/toast.tsx`

```typescript
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-primary',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`${typeStyles[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer`}
            onClick={() => onRemove(toast.id)}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

## File Structure After Phase 7

```
apps/forum/src/
├── lib/
│   └── animations.ts           ✅ NEW
├── components/
│   └── ui/
│       ├── animated-page.tsx   ✅ NEW
│       ├── skeletons.tsx       ✅ NEW
│       ├── glow-effect.tsx     ✅ NEW
│       └── toast.tsx           ✅ NEW
├── hooks/
│   └── use-hover-glow.ts       ✅ NEW
├── app/
│   └── template.tsx            ✅ NEW
```

## Verification Checklist
- [ ] Page transitions are smooth
- [ ] Cards have hover glow following cursor
- [ ] Upvote animation bounces correctly
- [ ] Loading skeletons pulse smoothly
- [ ] Stagger animations work on lists
- [ ] Dropdown animations are smooth
- [ ] Toast notifications appear/disappear correctly
- [ ] All animations respect reduced motion preferences
- [ ] No janky or stuttering animations
- [ ] Performance is acceptable (60fps)

## Next Phase
After completing Phase 7, proceed to [Phase 8: Responsive & Testing](./phase-8-responsive.md)
