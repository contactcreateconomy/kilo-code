# Phase 05 — Seller App: Layout Replacement

## Objective

Replace the seller app's custom layout (156-line sidebar with inline SVGs, manual notification dropdown, manual user menu) with the shadcn Sidebar `sidebar-07` pattern — identical architecture to admin but with seller-specific navigation.

## Current State

| Component | Current | Issues |
|-----------|---------|--------|
| [`seller-sidebar.tsx`](../../apps/seller/src/components/layout/seller-sidebar.tsx) | 156 lines with inline SVGs for 8 nav items | Verbose, not collapsible, no responsive |
| [`seller-header.tsx`](../../apps/seller/src/components/layout/seller-header.tsx) | 172 lines with manual notification dropdown + user menu | State-managed dropdowns, not using shadcn DropdownMenu |
| [`seller-layout.tsx`](../../apps/seller/src/components/layout/seller-layout.tsx) | Flex layout with fixed sidebar | No SidebarProvider, no responsive collapse |

## Target State

Same shadcn Sidebar architecture as admin (Phase 02) but with seller navigation:
- Collapsible sidebar with Lucide icons
- Createconomy Seller Portal branding in sidebar header
- Breadcrumb navigation in header
- Notification and user menus using shadcn DropdownMenu

## Tasks

### 5.1 Create `app-sidebar.tsx` (Seller)

**File:** `apps/seller/src/components/layout/app-sidebar.tsx`

```
Structure:
├── SidebarHeader
│   └── Logo + "Seller Portal" text
├── SidebarContent
│   ├── SidebarGroup "Store"
│   │   ├── Dashboard (LayoutDashboard icon)
│   │   ├── Products (Package icon)
│   │   ├── Orders (ClipboardList icon)
│   │   └── Reviews (Star icon)
│   ├── SidebarGroup "Finance"
│   │   ├── Analytics (BarChart3 icon)
│   │   └── Payouts (Wallet icon)
│   └── SidebarGroup "Account"
│       └── Settings (Settings icon)
└── SidebarFooter
    ├── Help and Support link
    └── Store status indicator
```

Maps from the existing [`seller-sidebar.tsx`](../../apps/seller/src/components/layout/seller-sidebar.tsx:12) `navItems` array.

### 5.2 Rewrite `seller-layout.tsx`

**File:** `apps/seller/src/components/layout/seller-layout.tsx`

Replace:
```tsx
// Current:
<div className="flex h-screen bg-[var(--background)]">
  <SellerSidebar />
  <div className="flex-1 flex flex-col overflow-hidden">
    <SellerHeader />
    <main className="flex-1 overflow-y-auto p-6">{children}</main>
  </div>
</div>

// New:
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <header>...</header>
    <main className="flex-1 p-6">{children}</main>
  </SidebarInset>
</SidebarProvider>
```

### 5.3 Rewrite `seller-header.tsx`

**File:** `apps/seller/src/components/layout/seller-header.tsx`

Major simplification — from 172 lines to ~60 lines:
- Remove manual `useState` for notifications and user menu dropdowns
- Use `SidebarTrigger` for sidebar toggle
- Use `Breadcrumb` for navigation context
- Use shadcn `DropdownMenu` for user menu
- Use shadcn `Button` for "Add Product" CTA
- Keep search input (using shadcn `Input`)
- Keep notification bell (simplified, or use shared `NotificationIcon`)

### 5.4 Update Root Page

**File:** `apps/seller/src/app/page.tsx`

Move the `SellerGuard` wrapping to the layout level instead of page level. Currently it wraps the page content inside `<SellerGuard><SellerLayout>...`. 

The new approach: `SellerGuard` wraps the layout, and individual pages just render content.

### 5.5 Clean Up CSS

**File:** `apps/seller/src/app/globals.css`

The `seller-card` CSS class can stay for now (some pages still use it), but the `var()` inline styles in sidebars/headers are replaced by Tailwind utility classes.

### 5.6 Delete Old Files

After the new layout is working:
- Archive/delete [`seller-sidebar.tsx`](../../apps/seller/src/components/layout/seller-sidebar.tsx:1)

## Files Created/Modified

| Action | File |
|--------|------|
| Create | `apps/seller/src/components/layout/app-sidebar.tsx` |
| Rewrite | `apps/seller/src/components/layout/seller-layout.tsx` |
| Rewrite | `apps/seller/src/components/layout/seller-header.tsx` |
| Modify | `apps/seller/src/app/page.tsx` |
| Delete | `apps/seller/src/components/layout/seller-sidebar.tsx` (old) |

## Verification

- [ ] Sidebar collapses to icons on small screens
- [ ] All seller navigation links work
- [ ] "Add Product" button in header works
- [ ] Notification dropdown works via shadcn DropdownMenu
- [ ] User menu works via shadcn DropdownMenu
- [ ] Breadcrumb shows current route
- [ ] Logo displays correctly
- [ ] `SellerGuard` still protects the layout
