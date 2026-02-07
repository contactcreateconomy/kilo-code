# Createconomy Design System

> Single source of truth for visual consistency across all Createconomy applications.
> Extracted from the forum app's established design language.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Quick Start](#quick-start)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Shadows & Glow Effects](#shadows--glow-effects)
7. [Animations](#animations)
8. [Components](#components)
9. [Theme Provider](#theme-provider)
10. [Visual Effects](#visual-effects)
11. [Design Tokens](#design-tokens)
12. [App Migration Guide](#app-migration-guide)

---

## Architecture

```
packages/ui/
├── src/
│   ├── globals.css              ← Single source of truth (OKLCH colors, effects, animations)
│   ├── index.ts                 ← Barrel exports for all components
│   ├── lib/
│   │   ├── utils.ts             ← cn() utility (clsx + tailwind-merge)
│   │   └── animations.ts        ← Framer Motion variant presets
│   ├── providers/
│   │   └── theme-provider.tsx   ← ThemeProvider + useTheme hook
│   ├── tokens/
│   │   ├── colors.ts            ← OKLCH color token constants
│   │   ├── typography.ts        ← Font families, sizes, weights
│   │   ├── shadows.ts           ← Shadow scale + glow properties
│   │   ├── animations.ts        ← Transition durations, easings
│   │   ├── layout.ts            ← Radius, breakpoints, dimensions
│   │   └── index.ts             ← Barrel export
│   └── components/
│       ├── button.tsx            ← Shadcn Button (6 variants)
│       ├── card.tsx              ← Card + CardHeader/Footer/Title/Description/Content
│       ├── input.tsx             ← Input field
│       ├── label.tsx             ← Label
│       ├── skeleton.tsx          ← Skeleton loader
│       ├── avatar.tsx            ← Avatar + Image + Fallback
│       ├── dropdown-menu.tsx     ← DropdownMenu (14 sub-components)
│       ├── badge.tsx             ← Badge (variants)
│       ├── separator.tsx         ← Separator
│       ├── glow-button.tsx       ← GlowButton (3 variants, glow shadow)
│       ├── glow-card.tsx         ← GlowCard (hover lift + glow)
│       ├── dot-grid-background.tsx ← DotGridBackground pattern
│       └── toast.tsx             ← ToastProvider + useToast (4 types)

packages/config/
└── tailwind.config.ts           ← Shared Tailwind config (OKLCH colors, glow shadows)
```

Each consuming app's `globals.css` follows this pattern:

```css
@import "tailwindcss";
@import "@createconomy/ui/globals.css";
@custom-variant dark (&:is(.dark *));

/* App-specific overrides below */
```

---

## Quick Start

### 1. Import shared CSS in your app's `globals.css`

```css
@import "tailwindcss";
@import "@createconomy/ui/globals.css";
@custom-variant dark (&:is(.dark *));
```

### 2. Use the ThemeProvider in your layout

```tsx
import { ThemeProvider } from '@createconomy/ui/providers/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3. Use components

```tsx
import { Button, GlowButton, GlowCard } from '@createconomy/ui';
```

---

## Color System

All colors use the **OKLCH color space** for perceptual uniformity.

### Primary Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `oklch(0.585 0.233 264)` | `oklch(0.585 0.233 264)` | Indigo — brand actions, links, accents |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | Text on primary |
| `--secondary` | `oklch(0.965 0.015 285)` | `oklch(0.269 0.01 285)` | Secondary actions |
| `--accent` | `oklch(0.92 0.04 285)` | `oklch(0.269 0.02 285)` | Highlights, hover states |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.396 0.141 25.723)` | Errors, delete actions |

### Surface Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `oklch(0.985 0.002 285)` | `oklch(0.145 0.01 285)` | Page background |
| `--card` | `oklch(1 0 0)` | `oklch(0.18 0.01 285)` | Card/panel surface |
| `--muted` | `oklch(0.955 0.01 285)` | `oklch(0.269 0.01 285)` | Disabled, subtle bg |
| `--border` | `oklch(0.91 0.015 285)` | `oklch(0.3 0.015 285)` | Borders, dividers |

### Semantic Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--success` | `oklch(0.723 0.191 142.5)` | `oklch(0.627 0.194 145)` | Success states |
| `--warning` | `oklch(0.795 0.184 86.047)` | `oklch(0.75 0.183 55.934)` | Warning states |
| `--info` | `oklch(0.585 0.233 264)` | `oklch(0.488 0.243 264.376)` | Info states |

### Using Colors in CSS

```css
/* Direct variable access */
color: var(--primary);
background: var(--card);
border-color: var(--border);

/* Tailwind utility classes */
className="bg-primary text-primary-foreground"
className="bg-card text-card-foreground"
className="border-border"
```

### Using Colors in TypeScript

```ts
import { colors } from '@createconomy/ui/tokens/colors';

colors.light.primary   // "oklch(0.585 0.233 264)"
colors.dark.background  // "oklch(0.145 0.01 285)"
colors.semantic.success // "oklch(0.723 0.191 142.5)"
```

---

## Typography

| Property | Value |
|----------|-------|
| **Primary font** | `'Inter', 'Inter Fallback', system-ui, sans-serif` |
| **Monospace font** | `'JetBrains Mono', 'JetBrains Mono Fallback', monospace` |
| **Base size** | `1rem` (16px) |

### Font Sizes

| Token | Size | Use Case |
|-------|------|----------|
| `text-xs` | 0.75rem | Badges, captions |
| `text-sm` | 0.875rem | Body small, buttons |
| `text-base` | 1rem | Body default |
| `text-lg` | 1.125rem | Subtitles |
| `text-xl` | 1.25rem | Section headings |
| `text-2xl` | 1.5rem | Page headings |

### Font Weights

| Token | Weight | Use Case |
|-------|--------|----------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Buttons, labels |
| `font-semibold` | 600 | Headings, emphasis |
| `font-bold` | 700 | Strong emphasis |

---

## Spacing & Layout

### Border Radius

| Token | Value | CSS Variable |
|-------|-------|-------------|
| `rounded-sm` | `calc(0.5rem - 4px)` = 4px | `--radius-sm` |
| `rounded-md` | `calc(0.5rem - 2px)` = 6px | `--radius-md` |
| `rounded-lg` | `0.5rem` = 8px | `--radius-lg` |
| `rounded-xl` | `calc(0.5rem + 4px)` = 12px | `--radius-xl` |

### Container

```
max-width: 1400px
padding: 2rem
center: true
```

### Breakpoints

| Name | Min Width |
|------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

---

## Shadows & Glow Effects

### Standard Shadows

Use Tailwind's built-in `shadow-sm`, `shadow-md`, `shadow-lg`.

### Glow Shadows

| Class | CSS | Usage |
|-------|-----|-------|
| `shadow-glow` | `0 0 20px var(--glow-color)` | Default glow |
| `shadow-glow-strong` | `0 0 30px var(--glow-color-strong)` | Hover state glow |
| `shadow-glow-sm` | `0 0 10px var(--glow-color-sm)` | Subtle glow |

Glow color is indigo (`rgba(99, 102, 241, ...)`), defined via `--glow-color` CSS variables.

```tsx
// Usage
<div className="shadow-glow hover:shadow-glow-strong transition-shadow" />
```

---

## Animations

### CSS Animation Utilities

| Class | Duration | Easing |
|-------|----------|--------|
| `.animate-fade-in-up` | 0.5s | ease-out |
| `.animate-fade-in-right` | 0.4s | ease-out |
| `.animate-fade-in` | 0.3s | ease-out |
| `.animate-scale-in` | 0.3s | ease-out |
| `.animate-slide-down` | 0.2s | ease-out |
| `.animate-slide-up` | 0.2s | ease-out |

### Stagger Delays

```html
<div class="animate-fade-in-up animation-delay-50">Item 1</div>
<div class="animate-fade-in-up animation-delay-100">Item 2</div>
<div class="animate-fade-in-up animation-delay-150">Item 3</div>
<!-- ...up to animation-delay-500 (in 50ms increments) -->
```

### Framer Motion Presets

```ts
import {
  pageVariants,
  staggerContainerVariants,
  staggerItemVariants,
  cardHoverVariants,
  glowVariants,
  bounceVariants,
  slideInLeftVariants,
  slideInRightVariants,
  fadeInVariants,
  scaleInVariants,
  dropdownVariants,
  drawerVariants,
  overlayVariants,
  rotateVariants,
  pulseVariants,
  shimmerVariants,
} from '@createconomy/ui/lib/animations';
```

**Usage example:**

```tsx
<motion.div
  variants={staggerContainerVariants}
  initial="initial"
  animate="animate"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## Components

### GlowButton

```tsx
import { GlowButton } from '@createconomy/ui';

<GlowButton variant="primary" size="md" glow>
  Click me
</GlowButton>

<GlowButton variant="secondary" size="sm">
  Secondary
</GlowButton>

<GlowButton variant="ghost" size="lg">
  Ghost
</GlowButton>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `glow` | `boolean` | `true` | Enable glow shadow (primary only) |

### GlowCard

```tsx
import { GlowCard } from '@createconomy/ui';

<GlowCard hover>
  <h3>Card Title</h3>
  <p>Card content...</p>
</GlowCard>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hover` | `boolean` | `true` | Enable hover lift + glow border |

### DotGridBackground

```tsx
import { DotGridBackground } from '@createconomy/ui';

<DotGridBackground>
  <main>Your page content</main>
</DotGridBackground>
```

### Toast System

```tsx
// In layout.tsx — wrap with ToastProvider
import { ToastProvider } from '@createconomy/ui';

<ToastProvider>
  {children}
</ToastProvider>

// In any component
import { useToast } from '@createconomy/ui';

function MyComponent() {
  const { addToast } = useToast();

  return (
    <button onClick={() => addToast('Saved!', 'success')}>
      Save
    </button>
  );
}
```

| Type | Color | Icon |
|------|-------|------|
| `'success'` | Green | ✓ |
| `'error'` | Red | ✕ |
| `'warning'` | Yellow | ⚠ |
| `'info'` | Primary (indigo) | ℹ |

---

## Theme Provider

### Setup

```tsx
import { ThemeProvider, useTheme } from '@createconomy/ui';

// In your root layout
<ThemeProvider
  defaultTheme="system"    // "light" | "dark" | "system"
  storageKey="my-app-theme" // localStorage key
>
  {children}
</ThemeProvider>
```

### Usage

```tsx
const { theme, setTheme, resolvedTheme } = useTheme();

// theme: "light" | "dark" | "system"
// resolvedTheme: "light" | "dark" (actual applied theme)
// setTheme: (theme) => void
```

### How it works

1. Reads stored preference from `localStorage`
2. Applies `.dark` or `.light` class on `<html>` element
3. Listens for system `prefers-color-scheme` changes when in `"system"` mode
4. Uses React 19 `use()` hook (not deprecated `useContext`)

---

## Visual Effects

### Glassmorphism

```html
<!-- Navbar glass effect -->
<nav class="glassmorphism-navbar">...</nav>

<!-- Card glass effect -->
<div class="glassmorphism-card">...</div>
```

### Dot Grid Background

```html
<!-- CSS class approach -->
<div class="dot-grid-background">...</div>

<!-- Component approach -->
<DotGridBackground>...</DotGridBackground>
```

### Discussion Card Glow

Mouse-tracking glow effect for cards:

```html
<div class="discussion-card-glow rounded-xl border bg-card p-4">
  Content
</div>
```

Set `--mouse-x` and `--mouse-y` CSS variables via JavaScript for tracking.

### Status Badges

```html
<span class="badge-success">Active</span>
<span class="badge-warning">Pending</span>
<span class="badge-error">Failed</span>
<span class="badge-info">New</span>
```

---

## Design Tokens

TypeScript constants for programmatic access:

```ts
// Colors
import { colors } from '@createconomy/ui/tokens/colors';
colors.light.primary      // "oklch(0.585 0.233 264)"
colors.semantic.success    // "oklch(0.723 0.191 142.5)"
colors.glow.color          // "rgba(99, 102, 241, 0.15)"

// Typography
import { typography } from '@createconomy/ui/tokens/typography';
typography.fontFamily.sans // "'Inter', 'Inter Fallback', system-ui, sans-serif"
typography.fontSize.sm     // "0.875rem"

// Shadows
import { shadows, glowVars } from '@createconomy/ui/tokens/shadows';
shadows.glow              // "0 0 20px var(--glow-color)"

// Animations
import { transitions, staggerDelays } from '@createconomy/ui/tokens/animations';
transitions.duration.normal  // "200ms"
transitions.easing.easeOut   // "cubic-bezier(0, 0, 0.2, 1)"

// Layout
import { layout } from '@createconomy/ui/tokens/layout';
layout.radius.lg           // "var(--radius)"
layout.breakpoints.md      // "768px"
```

---

## App Migration Guide

### For a new app

1. Add `@createconomy/ui` and `@createconomy/config` as dependencies
2. Import shared CSS in your `globals.css`:
   ```css
   @import "tailwindcss";
   @import "@createconomy/ui/globals.css";
   @custom-variant dark (&:is(.dark *));
   ```
3. Extend the shared Tailwind config in your `tailwind.config.ts`:
   ```ts
   import sharedConfig from "@createconomy/config/tailwind.config";
   const config = { ...sharedConfig, content: [...] };
   ```
4. Wrap your layout with `<ThemeProvider>`
5. Use Inter font from Google Fonts

### For existing apps (already migrated)

| App | Status | Notes |
|-----|--------|-------|
| **Forum** | ✅ Reference | Imports shared CSS then overrides with its own OKLCH variables |
| **Admin** | ✅ Migrated | Imports shared CSS, admin-specific layout classes preserved |
| **Seller** | ✅ Migrated | Switched from `prefers-color-scheme` to class-based dark mode |
| **Marketplace** | ✅ Migrated | Added `@custom-variant dark` directive |

### Critical Notes

- **Never modify `apps/forum/`** — it is the design reference
- All color overrides must use OKLCH format
- Dark mode uses class-based approach (`.dark` on `<html>`) — never `@media (prefers-color-scheme)`
- The forum app already imports `@createconomy/ui/globals.css` and then overrides all variables, so changes to the shared CSS propagate to other apps without affecting the forum
