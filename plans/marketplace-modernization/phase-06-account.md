# Phase 06: Account Pages

> Modernize the account dashboard, orders, and settings pages with shadcn components, proper active navigation, and consistent styling.

## Tasks

### 1. Improve Account Layout (`app/account/layout.tsx`)

**Current:** Basic sidebar nav with raw `<Link>` and hover styles, no active state detection
**Target:** Proper active NavLink with `usePathname()`, Lucide icons, improved styling

Changes:
- Make `NavLink` a client component using `usePathname()` for active state
- Add Lucide icons for each nav item:
  - Dashboard → `LayoutDashboard`
  - Orders → `Package`
  - Settings → `Settings`
- Active state: `bg-muted text-foreground font-medium` (or `bg-primary/10 text-primary`)
- Consider using shadcn `Button variant="ghost"` for nav items
- Mobile: Convert sidebar to horizontal tab bar or dropdown

### 2. Enhance Account Dashboard (`app/account/page.tsx`)

**Current:** 3 stat cards using shadcn Card (already good), 2 quick link cards with inline SVG icons
**Target:** Lucide icons (done in Phase 01), improved stat cards with icons

Changes:
- Icons already replaced in Phase 01 (`Package`, `Settings`)
- Add Lucide icons to stat cards:
  - Total Orders → `ShoppingBag`
  - Total Spent → `DollarSign`
  - Wishlist Items → `Heart`
- Add trend or recent activity section below stats
- Quick links: Add `ChevronRight` arrow on each card for visual affordance

### 3. Enhance Orders Page (`app/account/orders/page.tsx`)

Read this file to determine current state. Expected improvements:
- Use shadcn `Table` for order list
- Use `Badge` for order status (Completed, Processing, Shipped, Cancelled)
- Add `Breadcrumb`: Account > Orders
- Add empty state with `Package` icon
- Add date formatting and proper price display

### 4. Enhance Order Detail Page (`app/account/orders/[id]/page.tsx`)

Read this file to determine current state. Expected improvements:
- Use shadcn `Card` for order info sections
- Use `Badge` for status
- Use `Table` for line items
- Use `Separator` between sections
- Add `Breadcrumb`: Account > Orders > Order #xxx

### 5. Enhance Settings Page (`app/account/settings/page.tsx`)

Read this file to determine current state. Expected improvements:
- Use shadcn form components: `Input`, `Label`, `Button`, `Select`
- Use `Card` sections for different settings groups (Profile, Notifications, Security)
- Use `Separator` between sections
- Use `Avatar` for profile picture display
- Add `Switch` toggle for notification preferences

## New shadcn Components Needed

Check `packages/ui` for these — add if missing:
- `Switch` (for toggle settings)

## Files Modified

| File | Changes |
|------|---------|
| `app/account/layout.tsx` | Active NavLink with usePathname, Lucide icons |
| `app/account/page.tsx` | Enhanced stat cards with icons, improved quick links |
| `app/account/orders/page.tsx` | Table, Badge, empty state |
| `app/account/orders/[id]/page.tsx` | Card, Badge, Table, Breadcrumb |
| `app/account/settings/page.tsx` | Form components, Card sections, Switch |
