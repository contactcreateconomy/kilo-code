# Phase 1: Setup & Foundation

## Overview
This phase establishes the foundation for the premium forum redesign by adding required dependencies and updating CSS variables.

## Current Status: NOT STARTED

## Prerequisites
- Access to the forum app codebase at `apps/forum/`
- Ability to run pnpm commands

## Tasks

### 1.1 Add Dependencies
**File:** `apps/forum/package.json`

Add the following dependencies:
```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "embla-carousel-react": "^8.x",
    "embla-carousel-autoplay": "^8.x"
  }
}
```

**Command:**
```bash
cd apps/forum && pnpm add framer-motion embla-carousel-react embla-carousel-autoplay
```

### 1.2 Update CSS Variables
**File:** `apps/forum/src/app/globals.css`

Add the following CSS variables after the existing imports:

```css
@layer base {
  :root {
    /* Premium Design System */
    --radius: 1.3rem;
    
    /* Primary - Indigo */
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    
    /* Glow Effects */
    --glow-color: rgba(99, 102, 241, 0.4);
    --glow-color-strong: rgba(99, 102, 241, 0.6);
    
    /* Dot Grid Background */
    --dot-color: rgba(0, 0, 0, 0.1);
    --dot-size: 1px;
    --dot-spacing: 24px;
  }

  .dark {
    /* Dark Mode Glow */
    --glow-color: rgba(99, 102, 241, 0.5);
    --glow-color-strong: rgba(99, 102, 241, 0.7);
    
    /* Dark Mode Dots */
    --dot-color: rgba(255, 255, 255, 0.1);
  }
}
```

### 1.3 Add Tailwind Custom Utilities
**File:** `apps/forum/tailwind.config.ts`

Extend the theme with custom utilities:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  // ... existing config
  theme: {
    extend: {
      // ... existing extensions
      boxShadow: {
        'glow': '0 0 20px var(--glow-color)',
        'glow-strong': '0 0 30px var(--glow-color-strong)',
        'glow-sm': '0 0 10px var(--glow-color)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-color)' },
          '50%': { boxShadow: '0 0 30px var(--glow-color-strong)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
};

export default config;
```

### 1.4 Create Types File
**File:** `apps/forum/src/types/forum.ts`

```typescript
export interface Discussion {
  id: string;
  title: string;
  summary: string;
  author: User;
  category: Category;
  upvotes: number;
  comments: number;
  participants: User[];
  createdAt: Date;
  imageUrl?: string;
  isPinned?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  points?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
  isPremium?: boolean;
  pointsRequired?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  prize: string;
  endDate: Date;
  progress: number;
  totalParticipants: number;
}

export interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  engagement: number;
  trend: 'rising' | 'hot' | 'new';
}
```

## Verification Checklist
- [ ] Dependencies installed successfully (check `node_modules`)
- [ ] CSS variables render correctly in browser dev tools
- [ ] Tailwind custom utilities work (test with a simple element)
- [ ] TypeScript types compile without errors
- [ ] No build errors when running `pnpm build`

## Next Phase
After completing Phase 1, proceed to [Phase 2: Layout Structure](./phase-2-layout-structure.md)
