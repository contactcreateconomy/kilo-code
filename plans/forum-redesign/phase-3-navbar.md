# Phase 3: Navbar Configuration

## Overview
Configure the glassmorphism navbar with premium design elements including animated search, theme toggle, notifications, and profile dropdown.

## Current Status: NOT STARTED

## Prerequisites
- Phase 1 completed (dependencies installed)
- Phase 2 completed (layout structure in place)

## Current Header Analysis
The existing [`header.tsx`](../../apps/forum/src/components/layout/header.tsx) has:
- Basic navigation links
- Simple search bar
- User menu
- Mobile menu button
- Back to main site banner

## Tasks

### 3.1 Create GlassmorphismNavbar Component
**File:** `apps/forum/src/components/navbar/glassmorphism-navbar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedSearch } from './animated-search';
import { ThemeToggle } from './theme-toggle';
import { NotificationsDropdown } from './notifications-dropdown';
import { ProfileDropdown } from './profile-dropdown';
import { cn } from '@/lib/utils';

export function GlassmorphismNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-border/50" />
      
      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="relative container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="text-lg">💬</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              Createconomy
            </span>
          </Link>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <AnimatedSearch />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationsDropdown />
            <ProfileDropdown />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              <motion.svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen 
                    ? "M6 18L18 6M6 6l12 12" 
                    : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </motion.svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### 3.2 Create AnimatedSearch Component
**File:** `apps/forum/src/components/navbar/animated-search.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function AnimatedSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    if (!query) {
      setIsExpanded(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ width: isExpanded ? 320 : 40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <form onSubmit={handleSubmit}>
        <motion.div
          className={cn(
            'flex items-center rounded-full border transition-all',
            isExpanded 
              ? 'bg-background border-border shadow-glow-sm' 
              : 'bg-transparent border-transparent hover:bg-accent cursor-pointer'
          )}
          onClick={!isExpanded ? handleExpand : undefined}
        >
          {/* Search Icon */}
          <div className="flex items-center justify-center w-10 h-10">
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input Field */}
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={handleCollapse}
                placeholder="Search discussions..."
                className="flex-1 bg-transparent border-none outline-none text-sm pr-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </form>
    </motion.div>
  );
}
```

### 3.3 Create ThemeToggle Component
**File:** `apps/forum/src/components/navbar/theme-toggle.tsx`

```typescript
'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </motion.div>
    </button>
  );
}
```

### 3.4 Create NotificationsDropdown Component
**File:** `apps/forum/src/components/navbar/notifications-dropdown.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications - will be replaced with real data
const mockNotifications: Notification[] = [
  { id: '1', title: 'New reply', message: 'Someone replied to your thread', time: '2m ago', read: false },
  { id: '2', title: 'Upvote', message: 'Your post received 10 upvotes', time: '1h ago', read: false },
  { id: '3', title: 'Mention', message: 'You were mentioned in a discussion', time: '3h ago', read: true },
];

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-80 bg-card border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 border-b last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors',
                      !notification.read && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-t">
                <button className="w-full text-sm text-primary hover:underline">
                  View all notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 3.5 Create ProfileDropdown Component
**File:** `apps/forum/src/components/navbar/profile-dropdown.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@createconomy/ui';

// This will be replaced with actual auth state
const useAuth = () => {
  return {
    user: null, // or { name: 'John', avatarUrl: '...' }
    isAuthenticated: false,
  };
};

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Button asChild size="sm" className="shadow-glow-sm hover:shadow-glow">
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary/50 transition-colors"
      >
        <img
          src={user?.avatarUrl || '/default-avatar.png'}
          alt={user?.name || 'User'}
          className="w-full h-full object-cover"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-56 bg-card border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div className="p-4 border-b">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
              </div>
              
              <nav className="p-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/account/notifications"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors"
                >
                  Settings
                </Link>
                <hr className="my-2" />
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-sm text-destructive transition-colors"
                >
                  Sign Out
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 3.6 Create Navbar Index Export
**File:** `apps/forum/src/components/navbar/index.ts`

```typescript
export { GlassmorphismNavbar } from './glassmorphism-navbar';
export { AnimatedSearch } from './animated-search';
export { ThemeToggle } from './theme-toggle';
export { NotificationsDropdown } from './notifications-dropdown';
export { ProfileDropdown } from './profile-dropdown';
```

### 3.7 Update Layout to Use New Navbar
**File:** `apps/forum/src/app/layout.tsx`

Replace Header import with GlassmorphismNavbar:

```typescript
import { GlassmorphismNavbar } from '@/components/navbar';

// In the return:
<GlassmorphismNavbar />
```

## File Structure After Phase 3

```
apps/forum/src/components/
├── navbar/
│   ├── index.ts                    ✅ NEW
│   ├── glassmorphism-navbar.tsx    ✅ NEW
│   ├── animated-search.tsx         ✅ NEW
│   ├── theme-toggle.tsx            ✅ NEW
│   ├── notifications-dropdown.tsx  ✅ NEW
│   └── profile-dropdown.tsx        ✅ NEW
```

## Verification Checklist
- [ ] Navbar has glassmorphism effect (blur + transparency)
- [ ] Gradient border visible at bottom
- [ ] Search expands/collapses smoothly (40px → 320px)
- [ ] Theme toggle rotates on click
- [ ] Notifications dropdown opens with animation
- [ ] Badge shows unread count
- [ ] Profile dropdown shows user info or Sign In button
- [ ] All dropdowns close when clicking outside
- [ ] Mobile menu button visible on small screens

## Next Phase
After completing Phase 3, proceed to [Phase 4: Left Sidebar](./phase-4-left-sidebar.md)
