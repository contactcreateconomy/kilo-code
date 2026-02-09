# Phase 03 — Admin Dashboard Page: Charts & Data Table

## Objective

Rebuild the admin dashboard page using shadcn Chart components (replacing raw recharts) and shadcn-style stats cards (replacing custom `StatsCard`). Improve the recent orders table with proper shadcn table styling and the quick actions panel.

## Current State

| Component | Current | Issues |
|-----------|---------|--------|
| [`(dashboard)/page.tsx`](../../apps/admin/src/app/(dashboard)/page.tsx) | Grid of StatsCard + RevenueChart + QuickActions + RecentOrders | Good structure, but uses custom components |
| [`stats-card.tsx`](../../apps/admin/src/components/dashboard/stats-card.tsx) | Custom card with emoji string icons | No Lucide icons, no shadcn Card |
| [`revenue-chart.tsx`](../../apps/admin/src/components/dashboard/revenue-chart.tsx) | Raw recharts LineChart | Manual theming, no ChartContainer |
| [`recent-orders.tsx`](../../apps/admin/src/components/dashboard/recent-orders.tsx) | Plain `<table>` with custom CSS | No shadcn Table, no sorting |
| [`quick-actions.tsx`](../../apps/admin/src/components/dashboard/quick-actions.tsx) | Grid of link cards with emojis | Works but needs Lucide icons |
| [`analytics/page.tsx`](../../apps/admin/src/app/analytics/page.tsx) | Full analytics page with stats + charts + rankings | Same issues as dashboard |

## Tasks

### 3.1 Rewrite `stats-card.tsx`

**File:** `apps/admin/src/components/dashboard/stats-card.tsx`

Replace custom card with shadcn `Card` + Lucide icons:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@createconomy/ui/components/card';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from 'lucide-react';

const iconMap = {
  dollar: DollarSign,
  'shopping-cart': ShoppingCart,
  users: Users,
  package: Package,
};
```

Follow the Origin UI stats card pattern:
- Icon in a colored circle (top-right)
- Large value text
- Trend indicator with color (green up, red down)
- Use `CardHeader` + `CardContent` properly

### 3.2 Rewrite `revenue-chart.tsx`

**File:** `apps/admin/src/components/dashboard/revenue-chart.tsx`

Replace raw recharts with shadcn `ChartContainer`:

```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@createconomy/ui/components/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  orders: { label: 'Orders', color: 'var(--chart-2)' },
};
```

Based on shadcn `chart-area-interactive` block:
- Use `ChartContainer` with `chartConfig` for automatic theming
- Use `ChartTooltip` with `ChartTooltipContent` for themed tooltips
- Area chart with gradient fill (more visually appealing than line)
- Keep the same mock data structure

### 3.3 Rewrite `recent-orders.tsx`

**File:** `apps/admin/src/components/dashboard/recent-orders.tsx`

Replace plain `<table>` with shadcn `Table` component:

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@createconomy/ui/components/table';
import { Badge } from '@createconomy/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@createconomy/ui/components/card';
```

- Wrap in `Card` component
- Use `Badge` for status (with variant: `default`/`destructive`/`secondary`)
- Use shadcn `Table` sub-components for proper styling
- Keep the existing mock data

### 3.4 Rewrite `quick-actions.tsx`

**File:** `apps/admin/src/components/dashboard/quick-actions.tsx`

Replace emoji icons with Lucide:

```tsx
import { Plus, ClipboardList, Star, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@createconomy/ui/components/card';

const quickActions = [
  { name: 'Add Product', href: '/products/new', icon: Plus, description: 'Create a new product listing' },
  { name: 'View Orders', href: '/orders', icon: ClipboardList, description: 'Manage customer orders' },
  { name: 'Pending Reviews', href: '/moderation/reviews', icon: Star, description: 'Approve product reviews' },
  { name: 'Seller Applications', href: '/sellers/pending', icon: Store, description: 'Review new sellers' },
];
```

### 3.5 Update Dashboard Page

**File:** `apps/admin/src/app/(dashboard)/page.tsx`

Minimal changes to the page itself — mostly updating imports since the component APIs stay similar. Wrap the revenue chart section in a `Card` component.

### 3.6 Update Analytics Page

**File:** `apps/admin/src/app/analytics/page.tsx`

Apply same patterns:
- Stats cards → new `StatsCard` with Lucide icons
- Revenue chart → new `RevenueChart` with `ChartContainer`
- Top Products/Sellers/Categories lists → wrap in `Card`
- Traffic Sources → use shadcn `Progress` component instead of custom progress bar
- Additional Metrics → use new `StatsCard`

## Files Modified

| Action | File |
|--------|------|
| Rewrite | `apps/admin/src/components/dashboard/stats-card.tsx` |
| Rewrite | `apps/admin/src/components/dashboard/revenue-chart.tsx` |
| Rewrite | `apps/admin/src/components/dashboard/recent-orders.tsx` |
| Rewrite | `apps/admin/src/components/dashboard/quick-actions.tsx` |
| Modify | `apps/admin/src/app/(dashboard)/page.tsx` |
| Modify | `apps/admin/src/app/analytics/page.tsx` |

## Verification

- [ ] Dashboard page renders with proper shadcn Card styling
- [ ] Stats cards show Lucide icons (no emojis)
- [ ] Revenue chart uses `ChartContainer` with automatic theme colors
- [ ] Chart tooltip is styled with shadcn theme
- [ ] Recent orders table uses shadcn Table + Badge components
- [ ] Quick actions show Lucide icons
- [ ] Analytics page charts and stats are updated
- [ ] Light/dark mode works for all chart and card components
