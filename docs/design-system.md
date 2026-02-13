# Design System

> Visual consistency across all Createconomy apps. Source: `packages/ui/`.

---

## Architecture

```
packages/ui/src/
├── globals.css           ← OKLCH colors, effects, animations (source of truth)
├── index.ts              ← Barrel exports
├── lib/
│   ├── utils.ts          ← cn() utility (clsx + tailwind-merge)
│   └── animations.ts     ← Framer Motion variant presets
├── providers/
│   └── theme-provider.tsx ← ThemeProvider + useTheme
├── tokens/               ← TypeScript design token constants
│   ├── colors.ts, typography.ts, shadows.ts, animations.ts, layout.ts
└── components/
    ├── button.tsx, card.tsx, input.tsx, label.tsx, skeleton.tsx
    ├── avatar.tsx, dropdown-menu.tsx, badge.tsx, separator.tsx
    ├── glow-button.tsx, glow-card.tsx, dot-grid-background.tsx, toast.tsx
    └── auth/             ← AuthProvider, ProtectedRoute, useAuthGuard
```

---

## Quick Start (new app)

1. Add `@createconomy/ui` and `@createconomy/config` as dependencies
2. Import in `globals.css`:
   ```css
   @import "tailwindcss";
   @import "@createconomy/ui/globals.css";
   @custom-variant dark (&:is(.dark *));
   ```
3. Wrap layout with `<ThemeProvider defaultTheme="system" storageKey="my-app-theme">`
4. Import components: `import { Button, GlowCard } from '@createconomy/ui'`

---

## Color System (OKLCH)

### Primary

| Token | Usage |
|-------|-------|
| `--primary` | Indigo — brand actions, links, accents |
| `--secondary` | Secondary actions |
| `--accent` | Highlights, hover states |
| `--destructive` | Errors, delete actions |

### Surfaces

| Token | Usage |
|-------|-------|
| `--background` | Page background |
| `--card` | Card/panel surface |
| `--muted` | Disabled, subtle bg |
| `--border` | Borders, dividers |

### Semantic: `--success`, `--warning`, `--info`

Usage: `className="bg-primary text-primary-foreground"` or `color: var(--primary)` in CSS.

TypeScript: `import { colors } from '@createconomy/ui/tokens/colors'`

---

## Typography

- Primary: `Inter`, fallback `system-ui, sans-serif`
- Mono: `JetBrains Mono`
- Base: `1rem` (16px)
- Weights: `normal` (400), `medium` (500), `semibold` (600), `bold` (700)

---

## Shadows & Glow

| Class | Usage |
|-------|-------|
| `shadow-glow` | Default indigo glow |
| `shadow-glow-strong` | Hover state glow |
| `shadow-glow-sm` | Subtle glow |

---

## Animations

### CSS classes
`animate-fade-in-up`, `animate-fade-in-right`, `animate-fade-in`, `animate-scale-in`, `animate-slide-down`, `animate-slide-up`

Stagger: `animation-delay-50` through `animation-delay-500` (50ms increments)

### Framer Motion presets
```ts
import { pageVariants, staggerContainerVariants, staggerItemVariants, cardHoverVariants } from '@createconomy/ui/lib/animations';
```

---

## Key Components

### GlowButton
```tsx
<GlowButton variant="primary" size="md" glow>Click me</GlowButton>
```
Variants: `primary`, `secondary`, `ghost`. Sizes: `sm`, `md`, `lg`.

### GlowCard
```tsx
<GlowCard hover>Card content</GlowCard>
```

### Toast
```tsx
const { addToast } = useToast();
addToast('Saved!', 'success'); // types: success, error, warning, info
```

### ThemeProvider
```tsx
const { theme, setTheme, resolvedTheme } = useTheme();
```

---

## Visual Effects

- **Glassmorphism**: `className="glassmorphism-navbar"` / `"glassmorphism-card"`
- **Dot grid**: `<DotGridBackground>` component or `.dot-grid-background` class
- **Discussion card glow**: `.discussion-card-glow` with `--mouse-x`/`--mouse-y` CSS vars

---

## Design Tokens (TypeScript)

```ts
import { colors } from '@createconomy/ui/tokens/colors';
import { typography } from '@createconomy/ui/tokens/typography';
import { shadows } from '@createconomy/ui/tokens/shadows';
import { transitions } from '@createconomy/ui/tokens/animations';
import { layout } from '@createconomy/ui/tokens/layout';
```

---

## App Status

| App | Status |
|-----|--------|
| Forum | Reference implementation |
| Admin | Migrated |
| Seller | Migrated |
| Marketplace | Migrated |

Dark mode: class-based (`.dark` on `<html>`), never `@media (prefers-color-scheme)`. All color overrides must use OKLCH format.
