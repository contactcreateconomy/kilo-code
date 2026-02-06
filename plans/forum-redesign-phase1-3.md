# Forum App Redesign - Phase 1-3 Implementation Guide

## Phase 1: Setup & Foundation

### 1.1 Add Dependencies

**File:** [`apps/forum/package.json`](apps/forum/package.json)

Add the following dependencies:

```json
{
  "dependencies": {
    "framer-motion": "^11.15.0",
    "embla-carousel-react": "^8.5.1",
    "embla-carousel-autoplay": "^8.5.1",
    "lucide-react": "^0.469.0"
  }
}
```

Run: `pnpm install` from the root directory.

### 1.2 Update CSS Variables

**File:** [`apps/forum/src/app/globals.css`](apps/forum/src/app/globals.css)

Add these forum-specific CSS variables after the existing imports:

```css
@import "tailwindcss";
@import "@createconomy/ui/globals.css";

/* Forum Premium Design System */
@layer base {
  :root {
    /* Override radius for premium feel */
    --radius: 1.3rem;
    
    /* Primary Indigo */
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    
    /* Glow effects */
    --glow-color: 239 84% 67% / 0.4;
    --glow-color-strong: 239 84% 67% / 0.6;
    
    /* Dot grid background */
    --dot-color: 0 0% 85%;
    --dot-size: 1px;
    --dot-spacing: 24px;
  }

  .dark {
    /* Dark mode glow - more visible */
    --glow-color: 239 84% 67% / 0.5;
    --glow-color-strong: 239 84% 67% / 0.7;
    
    /* Dark mode dots */
    --dot-color: 0 0% 20%;
  }
}

/* Dot Grid Background Pattern */
@layer components {
  .dot-grid-background {
    background-image: radial-gradient(
      circle,
      hsl(var(--dot-color)) var(--dot-size),
      transparent var(--dot-size)
    );
    background-size: var(--dot-spacing) var(--dot-spacing);
    background-position: center center;
  }

  .dot-grid-fade {
    mask-image: radial-gradient(
      ellipse 80% 60% at 50% 50%,
      black 20%,
      transparent 100%
    );
    -webkit-mask-image: radial-gradient(
      ellipse 80% 60% at 50% 50%,
      black 20%,
      transparent 100%
    );
  }

  /* Glassmorphism utilities */
  .glass {
    background: hsl(var(--background) / 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .glass-strong {
    background: hsl(var(--background) / 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  /* Glow effects */
  .glow {
    box-shadow: 0 0 20px hsl(var(--glow-color));
  }

  .glow-strong {
    box-shadow: 0 0 30px hsl(var(--glow-color-strong));
  }

  .glow-hover:hover {
    box-shadow: 0 0 25px hsl(var(--glow-color));
  }

  /* Card with premium styling */
  .premium-card {
    border-radius: var(--radius);
    border: 1px solid hsl(var(--border));
    background: hsl(var(--card));
    transition: all 0.2s ease;
  }

  .premium-card:hover {
    border-color: hsl(var(--primary) / 0.5);
    box-shadow: 0 0 20px hsl(var(--glow-color));
    transform: translateY(-2px);
  }
}
```

### 1.3 Update Tailwind Config

**File:** [`apps/forum/tailwind.config.ts`](apps/forum/tailwind.config.ts)

```typescript
import type { Config } from "tailwindcss";
import sharedConfig from "@createconomy/config/tailwind.config";

const config: Config = {
  ...sharedConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme?.extend,
      // Forum-specific animations
      keyframes: {
        ...sharedConfig.theme?.extend?.keyframes,
        "bounce-subtle": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--glow-color))" },
          "50%": { boxShadow: "0 0 30px hsl(var(--glow-color-strong))" },
        },
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        ...sharedConfig.theme?.extend?.animation,
        "bounce-subtle": "bounce-subtle 0.3s ease-in-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
};

export default config;
```

### 1.4 Create Forum Types

**File:** [`apps/forum/src/types/forum.ts`](apps/forum/src/types/forum.ts)

```typescript
// Forum-specific types for the redesign

export interface ForumUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  points?: number;
  role?: "admin" | "moderator" | "creator" | "member";
  isOnline?: boolean;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  count: number;
  color?: string;
  isPremium?: boolean;
  pointsRequired?: number;
}

export interface Discussion {
  id: string;
  title: string;
  summary: string;
  content?: string;
  author: ForumUser;
  category: ForumCategory;
  upvotes: number;
  downvotes?: number;
  comments: number;
  views: number;
  participants: ForumUser[];
  createdAt: Date | string;
  updatedAt?: Date | string;
  imageUrl?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isHot?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface LeaderboardEntry {
  rank: number;
  user: ForumUser;
  points: number;
  trend: "up" | "down" | "stable";
  weeklyChange?: number;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  prize: string;
  prizeValue?: number;
  daysLeft: number;
  entries: number;
  maxEntries: number;
  imageUrl?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface TrendingTopic {
  id: string;
  title: string;
  discussionCount: number;
  trend: "rising" | "hot" | "new";
  category?: ForumCategory;
}

export type FeedFilter = "top" | "hot" | "new" | "favorites";

export interface FeedState {
  filter: FeedFilter;
  discussions: Discussion[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
}
```

### 1.5 Create Mock Data

**File:** [`apps/forum/src/data/mock-data.ts`](apps/forum/src/data/mock-data.ts)

```typescript
import type {
  ForumUser,
  ForumCategory,
  Discussion,
  LeaderboardEntry,
  Campaign,
  TrendingTopic,
} from "@/types/forum";

// Mock Users
export const mockUsers: ForumUser[] = [
  {
    id: "1",
    name: "Alex Chen",
    username: "alexchen",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    points: 12500,
    role: "creator",
    isOnline: true,
  },
  {
    id: "2",
    name: "Sarah Miller",
    username: "sarahm",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    points: 8900,
    role: "moderator",
    isOnline: true,
  },
  {
    id: "3",
    name: "James Wilson",
    username: "jwilson",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
    points: 6200,
    role: "member",
    isOnline: false,
  },
  // Add more users as needed
];

// Mock Categories
export const mockCategories: ForumCategory[] = [
  { id: "1", name: "News", slug: "news", icon: "📰", count: 234, color: "blue" },
  { id: "2", name: "Review", slug: "review", icon: "⭐", count: 189, color: "yellow" },
  { id: "3", name: "Compare", slug: "compare", icon: "⚖️", count: 156, color: "purple" },
  { id: "4", name: "List", slug: "list", icon: "📋", count: 98, color: "green" },
  { id: "5", name: "Help", slug: "help", icon: "🆘", count: 312, color: "red" },
  { id: "6", name: "Showcase", slug: "showcase", icon: "✨", count: 267, color: "pink" },
  { id: "7", name: "Tutorial", slug: "tutorial", icon: "📚", count: 145, color: "orange" },
  // Premium categories
  { id: "8", name: "Debate", slug: "debate", icon: "🎭", count: 45, color: "indigo", isPremium: true, pointsRequired: 500 },
  { id: "9", name: "Launch", slug: "launch", icon: "🚀", count: 23, color: "cyan", isPremium: true, pointsRequired: 1000 },
];

// Mock Discussions
export const mockDiscussions: Discussion[] = [
  {
    id: "1",
    title: "The Future of AI in Creative Tools: What to Expect in 2025",
    summary: "AI is revolutionizing how creators work. Here's what the next wave of tools will bring.",
    author: mockUsers[0],
    category: mockCategories[0],
    upvotes: 342,
    comments: 89,
    views: 2341,
    participants: mockUsers.slice(0, 5),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
    isPinned: true,
    isFeatured: true,
    tags: ["ai", "creative-tools", "future"],
  },
  {
    id: "2",
    title: "Best Practices for Selling Digital Products in 2025",
    summary: "Learn the strategies top creators use to maximize their digital product sales.",
    author: mockUsers[1],
    category: mockCategories[5],
    upvotes: 256,
    comments: 67,
    views: 1890,
    participants: mockUsers.slice(1, 4),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isHot: true,
    tags: ["selling", "tips", "digital-products"],
  },
  // Add more discussions
];

// Mock Leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user: mockUsers[0], points: 12500, trend: "up", weeklyChange: 450 },
  { rank: 2, user: mockUsers[1], points: 8900, trend: "stable", weeklyChange: 120 },
  { rank: 3, user: mockUsers[2], points: 6200, trend: "down", weeklyChange: -80 },
];

// Mock Campaign
export const mockCampaign: Campaign = {
  id: "1",
  title: "Creator Challenge 2025",
  description: "Share your best creation and win amazing prizes!",
  prize: "$5,000 + Premium Features",
  prizeValue: 5000,
  daysLeft: 12,
  entries: 847,
  maxEntries: 1000,
  gradientFrom: "#6366f1",
  gradientTo: "#8b5cf6",
};

// Mock Trending Topics
export const mockTrendingTopics: TrendingTopic[] = [
  { id: "1", title: "AI Art Generation", discussionCount: 156, trend: "hot" },
  { id: "2", title: "NFT Marketplace Updates", discussionCount: 89, trend: "rising" },
  { id: "3", title: "New Creator Tools", discussionCount: 234, trend: "hot" },
];
```

---

## Phase 2: Layout Structure

### 2.1 Create DotGridBackground Component

**File:** [`apps/forum/src/components/ui/dot-grid-background.tsx`](apps/forum/src/components/ui/dot-grid-background.tsx)

```typescript
"use client";

import { cn } from "@/lib/utils";

interface DotGridBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  fade?: boolean;
}

export function DotGridBackground({
  className,
  children,
  fade = true,
}: DotGridBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Dot grid layer */}
      <div
        className={cn(
          "fixed inset-0 -z-10 dot-grid-background",
          fade && "dot-grid-fade"
        )}
        aria-hidden="true"
      />
      {/* Content */}
      {children}
    </div>
  );
}
```

### 2.2 Create ForumLayout Component

**File:** [`apps/forum/src/components/layout/forum-layout.tsx`](apps/forum/src/components/layout/forum-layout.tsx)

```typescript
"use client";

import { cn } from "@/lib/utils";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";

interface ForumLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ForumLayout({ children, className }: ForumLayoutProps) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="flex gap-6">
        {/* Left Sidebar - Hidden on mobile/tablet */}
        <aside className="hidden lg:block w-[250px] shrink-0">
          <div className="sticky top-20">
            <LeftSidebar />
          </div>
        </aside>

        {/* Main Content - Flexible width */}
        <main className="flex-1 min-w-0">{children}</main>

        {/* Right Sidebar - Hidden on mobile/tablet */}
        <aside className="hidden xl:block w-[320px] shrink-0">
          <div className="sticky top-20">
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
```

### 2.3 Create Placeholder Sidebars

**File:** [`apps/forum/src/components/layout/left-sidebar.tsx`](apps/forum/src/components/layout/left-sidebar.tsx)

```typescript
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@createconomy/ui";
import { mockCategories } from "@/data/mock-data";

export function LeftSidebar() {
  const discoverCategories = mockCategories.filter((c) => !c.isPremium);
  const premiumCategories = mockCategories.filter((c) => c.isPremium);

  return (
    <div className="space-y-6">
      {/* Start Discussion Button */}
      <Button
        asChild
        className="w-full glow-hover transition-all duration-200"
        size="lg"
      >
        <Link href="/t/new">
          <Plus className="w-4 h-4 mr-2" />
          Start Discussion
        </Link>
      </Button>

      {/* Discover Categories */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
          Discover
        </h3>
        <nav className="space-y-1">
          {discoverCategories.map((category) => (
            <Link
              key={category.id}
              href={`/c/${category.slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors group"
            >
              <span className="text-lg">{category.icon}</span>
              <span className="flex-1">{category.name}</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">
                {category.count}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Premium Categories */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
          Premium
        </h3>
        <nav className="space-y-1">
          {premiumCategories.map((category) => (
            <Link
              key={category.id}
              href={`/c/${category.slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors group"
            >
              <span className="text-lg">{category.icon}</span>
              <span className="flex-1">{category.name}</span>
              <span className="text-xs text-primary">
                {category.pointsRequired}pts
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
```

**File:** [`apps/forum/src/components/layout/right-sidebar.tsx`](apps/forum/src/components/layout/right-sidebar.tsx)

```typescript
"use client";

// Placeholder - will be implemented in Phase 6
export function RightSidebar() {
  return (
    <div className="space-y-6">
      {/* Placeholder for widgets */}
      <div className="premium-card p-4">
        <h3 className="font-semibold mb-2">What&apos;s Vibing</h3>
        <p className="text-sm text-muted-foreground">Coming soon...</p>
      </div>
      
      <div className="premium-card p-4">
        <h3 className="font-semibold mb-2">🏆 Weekly Top Creators</h3>
        <p className="text-sm text-muted-foreground">Coming soon...</p>
      </div>
      
      <div className="premium-card p-4 bg-gradient-to-br from-primary/10 to-purple-500/10">
        <h3 className="font-semibold mb-2">Active Campaign</h3>
        <p className="text-sm text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
```

### 2.4 Update Root Layout

**File:** [`apps/forum/src/app/layout.tsx`](apps/forum/src/app/layout.tsx)

Update to include DotGridBackground:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DotGridBackground } from "@/components/ui/dot-grid-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// ... metadata stays the same ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexProvider>
            <DotGridBackground>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </DotGridBackground>
          </ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Phase 3: Navbar Updates

### 3.1 Create Forum Navbar

**File:** [`apps/forum/src/components/navbar/forum-navbar.tsx`](apps/forum/src/components/navbar/forum-navbar.tsx)

```typescript
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@createconomy/ui";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

export function ForumNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">
              Createconomy
            </span>
          </Link>

          {/* Animated Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <AnimatedSearch
              isOpen={isSearchOpen}
              onToggle={() => setIsSearchOpen(!isSearchOpen)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </motion.div>
            </Button>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* User Menu */}
            <UserMenu />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3">
              <input
                type="search"
                placeholder="Search discussions..."
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Animated Search Component
function AnimatedSearch({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ width: isOpen ? "100%" : "40px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {isOpen ? (
        <input
          type="search"
          placeholder="Search discussions..."
          className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
          onBlur={onToggle}
        />
      ) : (
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <Search className="h-5 w-5" />
        </Button>
      )}
    </motion.div>
  );
}

// Notifications Dropdown
function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const hasUnread = true; // Mock

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-card shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {/* Mock notifications */}
              <div className="p-4 hover:bg-accent cursor-pointer border-b">
                <p className="text-sm font-medium">New reply to your thread</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <div className="p-4 hover:bg-accent cursor-pointer">
                <p className="text-sm font-medium">Your post was upvoted</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="p-3 border-t">
              <Link
                href="/account/notifications"
                className="text-sm text-primary hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 3.2 Update Header to Use Forum Navbar

**File:** [`apps/forum/src/components/layout/header.tsx`](apps/forum/src/components/layout/header.tsx)

Replace the existing header with the new ForumNavbar or integrate the glassmorphism styling:

```typescript
"use client";

import { ForumNavbar } from "@/components/navbar/forum-navbar";

export function Header() {
  return <ForumNavbar />;
}
```

---

## Next Steps

After completing Phase 1-3:
1. Run `pnpm install` to install new dependencies
2. Test the dot grid background in both light and dark modes
3. Verify the three-column layout renders correctly
4. Test the animated search and theme toggle
5. Proceed to Phase 4-5 (Left Sidebar & Center Feed)

See [forum-redesign-phase4-6.md](forum-redesign-phase4-6.md) for the next phases.
