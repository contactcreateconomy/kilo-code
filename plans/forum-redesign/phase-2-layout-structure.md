# Phase 2: Layout Structure

## Overview
Create the three-column layout structure that forms the foundation of the premium forum design.

## Current Status: NOT STARTED

## Prerequisites
- Phase 1 completed (dependencies installed, CSS variables added)

## Layout Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GlassmorphismNavbar                         │
├──────────┬────────────────────────────────┬────────────────────┤
│          │                                │                    │
│  Left    │        Center Feed             │    Right           │
│  Sidebar │        (flex-1)                │    Sidebar         │
│  (250px) │                                │    (320px)         │
│          │                                │                    │
│          │                                │                    │
│          │                                │                    │
└──────────┴────────────────────────────────┴────────────────────┘
```

## Tasks

### 2.1 Create DotGridBackground Component
**File:** `apps/forum/src/components/ui/dot-grid-background.tsx`

```typescript
'use client';

import { cn } from '@/lib/utils';

interface DotGridBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function DotGridBackground({ children, className }: DotGridBackgroundProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Dot Grid Pattern */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle, var(--dot-color) var(--dot-size), transparent var(--dot-size))`,
          backgroundSize: 'var(--dot-spacing) var(--dot-spacing)',
        }}
      />
      {/* Fade Center Mask */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 70%)',
        }}
      />
      {children}
    </div>
  );
}
```

### 2.2 Create ForumLayout Component
**File:** `apps/forum/src/components/layout/forum-layout.tsx`

```typescript
'use client';

import { cn } from '@/lib/utils';

interface ForumLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  className?: string;
}

export function ForumLayout({ 
  children, 
  leftSidebar, 
  rightSidebar,
  className 
}: ForumLayoutProps) {
  return (
    <div className={cn('container mx-auto px-4 py-6', className)}>
      <div className="flex gap-6">
        {/* Left Sidebar - Hidden on mobile/tablet */}
        {leftSidebar && (
          <aside className="hidden lg:block w-[250px] shrink-0">
            <div className="sticky top-20">
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* Center Feed - Flexible width */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Sidebar - Hidden on mobile, shown on desktop */}
        {rightSidebar && (
          <aside className="hidden xl:block w-[320px] shrink-0">
            <div className="sticky top-20">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
```

### 2.3 Create LeftSidebar Placeholder
**File:** `apps/forum/src/components/layout/left-sidebar.tsx`

```typescript
'use client';

export function LeftSidebar() {
  return (
    <div className="space-y-4">
      {/* Placeholder - Will be implemented in Phase 4 */}
      <div className="p-4 rounded-xl border bg-card">
        <p className="text-sm text-muted-foreground">Left Sidebar Placeholder</p>
      </div>
    </div>
  );
}
```

### 2.4 Create RightSidebar Placeholder
**File:** `apps/forum/src/components/layout/right-sidebar.tsx`

```typescript
'use client';

export function RightSidebar() {
  return (
    <div className="space-y-4">
      {/* Placeholder - Will be implemented in Phase 6 */}
      <div className="p-4 rounded-xl border bg-card">
        <p className="text-sm text-muted-foreground">Right Sidebar Placeholder</p>
      </div>
    </div>
  );
}
```

### 2.5 Create MobileNav Placeholder
**File:** `apps/forum/src/components/layout/mobile-nav.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r z-50 lg:hidden"
          >
            <div className="p-4">
              {/* Mobile navigation content - Will be expanded in Phase 8 */}
              <p className="text-sm text-muted-foreground">Mobile Nav Placeholder</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### 2.6 Update Root Layout
**File:** `apps/forum/src/app/layout.tsx`

Update to include DotGridBackground:

```typescript
import { DotGridBackground } from '@/components/ui/dot-grid-background';

// In the return statement, wrap content with DotGridBackground:
<DotGridBackground>
  <div className="relative flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
</DotGridBackground>
```

### 2.7 Update Main Page
**File:** `apps/forum/src/app/page.tsx`

Update to use ForumLayout:

```typescript
import { ForumLayout } from '@/components/layout/forum-layout';
import { LeftSidebar } from '@/components/layout/left-sidebar';
import { RightSidebar } from '@/components/layout/right-sidebar';

export default function ForumHomePage() {
  return (
    <ForumLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
    >
      {/* Center content - Will be updated in Phase 5 */}
      <div className="space-y-6">
        {/* Existing content temporarily */}
      </div>
    </ForumLayout>
  );
}
```

## File Structure After Phase 2

```
apps/forum/src/components/
├── layout/
│   ├── forum-layout.tsx    ✅ NEW
│   ├── left-sidebar.tsx    ✅ NEW (placeholder)
│   ├── right-sidebar.tsx   ✅ NEW (placeholder)
│   ├── mobile-nav.tsx      ✅ NEW (placeholder)
│   ├── header.tsx          (existing)
│   ├── footer.tsx          (existing)
│   └── sidebar.tsx         (existing - can be deprecated later)
├── ui/
│   └── dot-grid-background.tsx  ✅ NEW
```

## Verification Checklist
- [ ] DotGridBackground renders dot pattern correctly
- [ ] Dot pattern respects light/dark mode
- [ ] Three-column layout displays correctly on desktop (>1280px)
- [ ] Two-column layout displays on tablet (768-1280px)
- [ ] Single-column layout displays on mobile (<768px)
- [ ] Sidebars are sticky when scrolling
- [ ] No horizontal overflow issues

## Next Phase
After completing Phase 2, proceed to [Phase 3: Navbar Configuration](./phase-3-navbar.md)
