# Phase 8: Responsive Design & Testing

## Overview
Implement responsive layouts for tablet and mobile, create mobile navigation drawer, and perform comprehensive testing.

## Current Status: NOT STARTED

## Prerequisites
- Phase 1-7 completed

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop XL | >1280px | Three-column: 250px + flex + 320px |
| Desktop | 1024-1280px | Three-column: 220px + flex + 280px |
| Tablet | 768-1024px | Two-column: hide right sidebar |
| Mobile | <768px | Single column + drawer navigation |

## Tasks

### 8.1 Update ForumLayout for Responsive
**File:** `apps/forum/src/components/layout/forum-layout.tsx`

```typescript
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MobileNav } from './mobile-nav';

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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      {/* Mobile Navigation Drawer */}
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)}
        sidebar={leftSidebar}
      />

      <div className={cn('container mx-auto px-4 py-6', className)}>
        <div className="flex gap-6">
          {/* Left Sidebar - Hidden on mobile/tablet */}
          {leftSidebar && (
            <aside className="hidden lg:block w-[220px] xl:w-[250px] shrink-0">
              <div className="sticky top-20">
                {leftSidebar}
              </div>
            </aside>
          )}

          {/* Center Feed - Flexible width */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Right Sidebar - Hidden on mobile/tablet, shown on desktop */}
          {rightSidebar && (
            <aside className="hidden xl:block w-[280px] 2xl:w-[320px] shrink-0">
              <div className="sticky top-20">
                {rightSidebar}
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
```

### 8.2 Create Complete MobileNav Component
**File:** `apps/forum/src/components/layout/mobile-nav.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { drawerVariants } from '@/lib/animations';
import { ThemeToggle } from '@/components/navbar/theme-toggle';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  sidebar?: React.ReactNode;
}

export function MobileNav({ isOpen, onClose, sidebar }: MobileNavProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed left-0 top-0 bottom-0 w-[300px] bg-background border-r z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="flex items-center gap-2" onClick={onClose}>
                <span className="text-xl">💬</span>
                <span className="font-bold">Createconomy</span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full px-4 py-2 pl-10 rounded-lg border bg-background"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="p-4">
              {sidebar}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### 8.3 Update Navbar for Mobile
**File:** `apps/forum/src/components/navbar/glassmorphism-navbar.tsx`

Add mobile menu trigger:

```typescript
'use client';

import { useState, createContext, useContext } from 'react';
// ... other imports

// Create context for mobile nav state
export const MobileNavContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) throw new Error('useMobileNav must be used within MobileNavProvider');
  return context;
}

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function GlassmorphismNavbar() {
  const { setIsOpen } = useMobileNav();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ... existing code ... */}
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
}
```

### 8.4 Create Mobile-Optimized Components

#### Mobile Feed Tabs
**File:** `apps/forum/src/components/feed/mobile-feed-tabs.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type TabType = 'top' | 'hot' | 'new' | 'fav';

interface MobileFeedTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; icon: string }[] = [
  { id: 'top', icon: '🏆' },
  { id: 'hot', icon: '🔥' },
  { id: 'new', icon: '🆕' },
  { id: 'fav', icon: '⭐' },
];

export function MobileFeedTabs({ activeTab, onTabChange }: MobileFeedTabsProps) {
  return (
    <div className="flex items-center justify-around p-2 bg-muted/50 rounded-xl md:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative p-3 text-xl rounded-lg transition-colors',
            activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="mobileActiveTab"
              className="absolute inset-0 bg-primary/10 rounded-lg"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          <span className="relative">{tab.icon}</span>
        </button>
      ))}
    </div>
  );
}
```

#### Mobile Bottom Navigation
**File:** `apps/forum/src/components/layout/mobile-bottom-nav.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMobileNav } from '@/components/navbar/glassmorphism-navbar';

const navItems = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/c', icon: '📂', label: 'Categories' },
  { href: '/t/new', icon: '➕', label: 'New', isAction: true },
  { href: '/search', icon: '🔍', label: 'Search' },
  { href: '/account', icon: '👤', label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setIsOpen } = useMobileNav();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-40 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl shadow-glow"
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 8.5 Add Safe Area Styles
**File:** `apps/forum/src/app/globals.css` (append)

```css
@layer utilities {
  /* Safe area for mobile devices */
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  
  .safe-area-top {
    padding-top: env(safe-area-inset-top, 0);
  }

  /* Hide scrollbar but keep functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Touch-friendly tap targets */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  /* Add bottom padding for fixed nav */
  main {
    padding-bottom: 5rem;
  }

  /* Larger touch targets */
  button, a {
    min-height: 44px;
  }

  /* Prevent text selection on interactive elements */
  .no-select {
    -webkit-user-select: none;
    user-select: none;
  }
}
```

### 8.6 Update Layout with Mobile Components
**File:** `apps/forum/src/app/layout.tsx`

```typescript
import { MobileNavProvider } from '@/components/navbar/glassmorphism-navbar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ConvexProvider>
            <MobileNavProvider>
              <DotGridBackground>
                <div className="relative flex min-h-screen flex-col">
                  <GlassmorphismNavbar />
                  <main className="flex-1">{children}</main>
                  <Footer className="hidden md:block" />
                  <MobileBottomNav />
                </div>
              </DotGridBackground>
            </MobileNavProvider>
          </ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 8.7 Testing Checklist

#### Desktop Testing (>1024px)
- [ ] Three-column layout displays correctly
- [ ] All sidebars are visible
- [ ] Hover effects work on all interactive elements
- [ ] Animations are smooth at 60fps
- [ ] No horizontal overflow

#### Tablet Testing (768-1024px)
- [ ] Two-column layout displays correctly
- [ ] Right sidebar is hidden
- [ ] Left sidebar is hidden, accessible via menu
- [ ] Touch interactions work properly
- [ ] Featured slider is swipeable

#### Mobile Testing (<768px)
- [ ] Single-column layout displays correctly
- [ ] Mobile navigation drawer works
- [ ] Bottom navigation is visible
- [ ] Safe areas are respected on notched devices
- [ ] Touch targets are at least 44px
- [ ] No horizontal overflow
- [ ] Keyboard doesn't cover inputs

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Safari iOS
- [ ] Chrome Android

#### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion is respected

#### Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No layout shifts (CLS < 0.1)
- [ ] Images are optimized

## File Structure After Phase 8

```
apps/forum/src/
├── components/
│   ├── layout/
│   │   ├── forum-layout.tsx      ✅ UPDATED
│   │   ├── mobile-nav.tsx        ✅ UPDATED
│   │   └── mobile-bottom-nav.tsx ✅ NEW
│   ├── feed/
│   │   └── mobile-feed-tabs.tsx  ✅ NEW
│   └── navbar/
│       └── glassmorphism-navbar.tsx ✅ UPDATED
├── app/
│   ├── globals.css               ✅ UPDATED
│   └── layout.tsx                ✅ UPDATED
```

## Final Verification

After completing all phases, perform a final review:

1. **Visual Review**: Compare implementation with design mockups
2. **Interaction Review**: Test all animations and micro-interactions
3. **Responsive Review**: Test on multiple device sizes
4. **Performance Review**: Run Lighthouse audit
5. **Accessibility Review**: Run axe DevTools audit
6. **Code Review**: Check for unused code, proper typing, and best practices

## Deployment Checklist

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build succeeds
- [ ] Environment variables are set
- [ ] Preview deployment works
- [ ] Production deployment works
