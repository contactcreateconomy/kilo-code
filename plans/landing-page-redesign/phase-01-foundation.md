# Phase 01 — Foundation: shadcn Init, Shared Components & Logo

## Objective

Set up the shadcn infrastructure across the monorepo and add the missing shared components (Sidebar, Chart, Breadcrumb, Collapsible) to `packages/ui`. Create a reusable Logo component from the Createconomy brand mark.

## Prerequisites

- Node.js 24+, pnpm 10+
- `packages/ui` already has: Card, Button, Badge, Dialog, Input, etc. (shadcn-style components without `components.json`)

## Tasks

### 1.1 Initialize shadcn in `packages/ui`

Since there is no `components.json` anywhere in the project, we need to initialize shadcn CLI support. However, since components live in `packages/ui` (not in an app), we'll create the config there.

**Create `packages/ui/components.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

> **Note:** The `tailwind.config` is empty string because Tailwind v4 uses CSS-based config, not JS. Adjust path aliases to match the existing `@/` pattern used in `packages/ui`.

### 1.2 Add Missing Radix Dependencies

The Sidebar component requires additional Radix primitives not yet in `packages/ui`:

```bash
cd packages/ui && pnpm add @radix-ui/react-collapsible
```

The Chart component requires recharts (already a dep in both apps but not in packages/ui — we'll wrap it):

```bash
cd packages/ui && pnpm add recharts
```

### 1.3 Add shadcn Sidebar Component

Add the official shadcn Sidebar component to `packages/ui/src/components/sidebar.tsx`.

This is a large component (~400 lines) that provides:
- `SidebarProvider` — context for open/closed state
- `Sidebar` — the sidebar container
- `SidebarHeader`, `SidebarContent`, `SidebarFooter` — layout sections
- `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent` — nav groups
- `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton` — nav items
- `SidebarTrigger` — toggle button
- `SidebarInset` — main content wrapper
- `useSidebar` — hook for programmatic control

**Source:** `npx shadcn add sidebar` or copy from https://ui.shadcn.com/docs/components/sidebar

**File:** `packages/ui/src/components/sidebar.tsx`

### 1.4 Add shadcn Chart Component

Add the shadcn Chart wrapper that provides automatic theming for recharts.

**Source:** `npx shadcn add chart` or copy from https://ui.shadcn.com/docs/components/chart

**File:** `packages/ui/src/components/chart.tsx`

This provides:
- `ChartContainer` — responsive container with CSS variable-based theming
- `ChartTooltip`, `ChartTooltipContent` — themed tooltips
- `ChartLegend`, `ChartLegendContent` — themed legends
- `ChartConfig` type — typed chart configuration

### 1.5 Add Breadcrumb Component

Already exists in shadcn but not in `packages/ui`.

**Source:** `npx shadcn add breadcrumb`

**File:** `packages/ui/src/components/breadcrumb.tsx`

### 1.6 Add Collapsible Component

Required by Sidebar for collapsible nav sections.

**Source:** `npx shadcn add collapsible`

**File:** `packages/ui/src/components/collapsible.tsx`

### 1.7 Create Logo Component

Create a reusable SVG Logo component from the Createconomy brand mark (dark geometric "C" — half-circle + quarter-circle + square).

**File:** `packages/ui/src/components/logo.tsx`

```tsx
interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'light' | 'dark';
}

export function Logo({ className, size = 32, variant = 'default' }: LogoProps) {
  // SVG version of the geometric "C" logo
  // Supports light/dark variants for different backgrounds
}

export function LogoWithText({ className, size = 32 }: LogoProps) {
  // Logo + "Createconomy" text
}
```

### 1.8 Export New Components from `packages/ui`

Update `packages/ui/src/index.ts` and add exports to `package.json` exports map:

```json
{
  "exports": {
    "./components/sidebar": "./src/components/sidebar.tsx",
    "./components/chart": "./src/components/chart.tsx",
    "./components/breadcrumb": "./src/components/breadcrumb.tsx",
    "./components/collapsible": "./src/components/collapsible.tsx",
    "./components/logo": "./src/components/logo.tsx"
  }
}
```

### 1.9 Add `use-mobile` Hook

The Sidebar component uses a `useMobile` hook for responsive behavior.

**File:** `packages/ui/src/hooks/use-mobile.ts`

**Source:** `npx shadcn add use-mobile`

## Files Created/Modified

| Action | File |
|--------|------|
| Create | `packages/ui/components.json` |
| Create | `packages/ui/src/components/sidebar.tsx` |
| Create | `packages/ui/src/components/chart.tsx` |
| Create | `packages/ui/src/components/breadcrumb.tsx` |
| Create | `packages/ui/src/components/collapsible.tsx` |
| Create | `packages/ui/src/components/logo.tsx` |
| Create | `packages/ui/src/hooks/use-mobile.ts` |
| Modify | `packages/ui/package.json` (add deps + exports) |
| Modify | `packages/ui/src/index.ts` (add exports) |

## Verification

- [ ] `pnpm typecheck` passes in `packages/ui`
- [ ] New components import correctly in both `apps/admin` and `apps/seller`
- [ ] Logo renders in both light and dark mode variants
