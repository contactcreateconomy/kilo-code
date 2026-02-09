# Phase 06 — Seller Dashboard Page: Charts & Data Table

## Objective

Rebuild the seller dashboard using shadcn Chart components and proper Card/Table/Badge components. Same approach as admin Phase 03 but seller-specific widgets.

## Current State

| Component | Current | Issues |
|-----------|---------|--------|
| [`page.tsx`](../../apps/seller/src/app/page.tsx) | SalesCards + RevenueChart + RecentOrders + LowStockAlert + QuickActions | Uses custom `seller-card` CSS, string icons |
| [`sales-card.tsx`](../../apps/seller/src/components/dashboard/sales-card.tsx) | Custom card with `seller-card` class | No shadcn Card, string icon prop |
| [`revenue-chart.tsx`](../../apps/seller/src/components/dashboard/revenue-chart.tsx) | Likely same raw recharts pattern as admin | No ChartContainer |
| [`recent-orders.tsx`](../../apps/seller/src/components/dashboard/recent-orders.tsx) | Table of recent orders | Likely plain HTML table |
| [`low-stock-alert.tsx`](../../apps/seller/src/components/dashboard/low-stock-alert.tsx) | Low stock warnings list | Custom styling |
| [`quick-actions.tsx`](../../apps/seller/src/components/dashboard/quick-actions.tsx) | Dropdown or action buttons | Custom styling |

## Tasks

### 6.1 Rewrite `sales-card.tsx`

**File:** `apps/seller/src/components/dashboard/sales-card.tsx`

Replace `seller-card` CSS class with shadcn `Card` + Lucide icons:

```tsx
import { Card, CardContent } from '@createconomy/ui/components/card';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

const iconMap = {
  dollar: DollarSign,
  'shopping-bag': ShoppingBag,
  package: Package,
  'trending-up': TrendingUp,
};
```

Pattern:
- Icon in a soft-colored circle (using `bg-primary/10 text-primary`)
- Large value with trend indicator
- Use shadcn `Card` with `CardContent`

### 6.2 Rewrite `revenue-chart.tsx`

**File:** `apps/seller/src/components/dashboard/revenue-chart.tsx`

Same approach as admin Phase 03:
- Wrap in shadcn `ChartContainer`
- Use `ChartTooltip` + `ChartTooltipContent`
- Use bar chart for seller (shows daily/weekly sales better)
- Based on shadcn `chart-bar-interactive` pattern

### 6.3 Rewrite `recent-orders.tsx`

**File:** `apps/seller/src/components/dashboard/recent-orders.tsx`

- Use shadcn `Table` + `Badge` components
- Wrap in `Card` with header
- Status badges using `Badge` variants

### 6.4 Rewrite `low-stock-alert.tsx`

**File:** `apps/seller/src/components/dashboard/low-stock-alert.tsx`

- Use shadcn `Card` wrapper
- Use `Badge` for stock levels (red for critical, yellow for low)
- Use `AlertTriangle` Lucide icon
- List format with product name + current stock + status

### 6.5 Rewrite `quick-actions.tsx`

**File:** `apps/seller/src/components/dashboard/quick-actions.tsx`

- Use shadcn `Button` variants
- Lucide icons for each action
- Dropdown or inline button group

### 6.6 Update Dashboard Page

**File:** `apps/seller/src/app/page.tsx`

Update imports and ensure the page structure works with the new components. Remove the `SellerGuard` and `SellerLayout` wrappers if they've been moved to the layout level in Phase 05.

### 6.7 Update Analytics Pages

**Files:**
- `apps/seller/src/app/analytics/page.tsx`
- `apps/seller/src/app/analytics/products/page.tsx`

Apply shadcn Chart and Card patterns to the analytics views.

## Files Modified

| Action | File |
|--------|------|
| Rewrite | `apps/seller/src/components/dashboard/sales-card.tsx` |
| Rewrite | `apps/seller/src/components/dashboard/revenue-chart.tsx` |
| Rewrite | `apps/seller/src/components/dashboard/recent-orders.tsx` |
| Rewrite | `apps/seller/src/components/dashboard/low-stock-alert.tsx` |
| Rewrite | `apps/seller/src/components/dashboard/quick-actions.tsx` |
| Modify | `apps/seller/src/app/page.tsx` |
| Modify | `apps/seller/src/app/analytics/page.tsx` |
| Modify | `apps/seller/src/app/analytics/products/page.tsx` |

## Verification

- [ ] Dashboard renders with shadcn Card components
- [ ] Sales cards show Lucide icons
- [ ] Revenue chart uses ChartContainer with proper theming
- [ ] Recent orders use shadcn Table + Badge
- [ ] Low stock alerts show proper warning badges
- [ ] Light/dark mode works correctly
- [ ] No more `seller-card` CSS usage on dashboard
