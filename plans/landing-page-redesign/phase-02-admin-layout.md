# Phase 02 — Admin App: Layout Replacement

## Objective

Replace the custom admin layout (sidebar with emoji icons, fixed-width aside, plain header) with the shadcn Sidebar `sidebar-07` pattern — a collapsible sidebar with Lucide icons, breadcrumb navigation, and responsive behavior.

## Current State

| Component | Current | Issues |
|-----------|---------|--------|
| [`admin-sidebar.tsx`](../../apps/admin/src/components/layout/admin-sidebar.tsx) | Custom `<aside>` with emoji icons | Not collapsible, not responsive, emoji icons |
| [`admin-header.tsx`](../../apps/admin/src/components/layout/admin-header.tsx) | Custom header with manual search/notifications | No breadcrumbs, plain `<input>` search |
| [`admin-layout.tsx`](../../apps/admin/src/components/layout/admin-layout.tsx) | Wraps sidebar + header + `<main>` with fixed `pl-64` | Breaks on mobile, no responsive |

## Target State

Based on shadcn `sidebar-07` block pattern:
- `SidebarProvider` wrapping the entire layout
- Collapsible sidebar (full ↔ icon-only) with `data-collapsible="icon"`
- `SidebarInset` as main content area
- Sticky header inside `SidebarInset` with `SidebarTrigger` + `Breadcrumb`
- Lucide icons for all navigation items
- Createconomy logo in `SidebarHeader`

## Tasks

### 2.1 Create `app-sidebar.tsx` (Admin)

**File:** `apps/admin/src/components/layout/app-sidebar.tsx`

New sidebar using shadcn Sidebar primitives:

```
Structure:
├── SidebarHeader
│   └── Logo + "Createconomy Admin" text
├── SidebarContent
│   ├── SidebarGroup "Overview"
│   │   ├── Dashboard (LayoutDashboard icon)
│   │   └── Analytics (BarChart3 icon)
│   ├── SidebarGroup "Commerce"
│   │   ├── Products (Package icon)
│   │   ├── Categories (FolderTree icon)
│   │   ├── Orders (ShoppingCart icon)
│   │   └── Sellers (Store icon)
│   ├── SidebarGroup "Moderation"
│   │   ├── Overview (Shield icon)
│   │   ├── Reports (Flag icon)
│   │   ├── Reviews (Star icon)
│   │   └── Bans (Ban icon)
│   └── SidebarGroup "System"
│       ├── Users (Users icon)
│       └── Settings (Settings icon)
└── SidebarFooter
    └── User info + help link
```

Navigation items map directly from the existing [`admin-sidebar.tsx`](../../apps/admin/src/components/layout/admin-sidebar.tsx:6) `navigation` array.

### 2.2 Rewrite `admin-layout.tsx`

**File:** `apps/admin/src/components/layout/admin-layout.tsx`

Replace the current layout:

```tsx
// Current (custom):
<AdminGuard>
  <div className="min-h-screen bg-background">
    <AdminHeader />
    <AdminSidebar />
    <main className="pl-64 pt-14">...</main>
  </div>
</AdminGuard>

// New (shadcn Sidebar pattern):
<AdminGuard>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header>
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <Breadcrumb>...</Breadcrumb>
        {/* Search + notifications + user menu */}
      </header>
      <main>{children}</main>
    </SidebarInset>
  </SidebarProvider>
</AdminGuard>
```

### 2.3 Rewrite `admin-header.tsx`

**File:** `apps/admin/src/components/layout/admin-header.tsx`

The header becomes simpler — it sits inside `SidebarInset` and contains:
- `SidebarTrigger` (hamburger/collapse button)
- `Breadcrumb` with dynamic route segments
- Search input (using shadcn `Input` from `@createconomy/ui`)
- Notification bell (using shared `NotificationIcon` component)
- User menu (using shadcn `DropdownMenu` from `@createconomy/ui`)
- Links to Marketplace and Forum

Replace:
- The emoji `🛠️` logo with the `Logo` component
- The plain `<input>` with shadcn `Input`
- The manual dropdown with shadcn `DropdownMenu`

### 2.4 Update `(dashboard)/layout.tsx`

**File:** `apps/admin/src/app/(dashboard)/layout.tsx`

Current:
```tsx
<AdminLayout>{children}</AdminLayout>
```

This stays the same — the AdminLayout now uses SidebarProvider internally.

### 2.5 Clean Up CSS

**File:** `apps/admin/src/app/globals.css`

Remove the custom admin layout CSS classes (lines 17-49) since they're replaced by shadcn Sidebar:
- Remove `.admin-layout`, `.admin-sidebar`, `.admin-main`, `.admin-header`, `.admin-content`
- Keep the `--sidebar-width` and `--header-height` CSS variables (shadcn Sidebar uses its own CSS variables)

### 2.6 Delete Old Files

After the new layout is working:
- Archive/delete the old [`admin-sidebar.tsx`](../../apps/admin/src/components/layout/admin-sidebar.tsx:1) (replaced by `app-sidebar.tsx`)

## Files Created/Modified

| Action | File |
|--------|------|
| Create | `apps/admin/src/components/layout/app-sidebar.tsx` |
| Rewrite | `apps/admin/src/components/layout/admin-layout.tsx` |
| Rewrite | `apps/admin/src/components/layout/admin-header.tsx` |
| Modify | `apps/admin/src/app/globals.css` |
| Delete | `apps/admin/src/components/layout/admin-sidebar.tsx` (old) |

## Verification

- [ ] Sidebar collapses to icons on small screens
- [ ] `SidebarTrigger` toggles sidebar open/closed
- [ ] All navigation links work (Dashboard, Users, Products, etc.)
- [ ] Breadcrumb shows current route
- [ ] Logo displays correctly in sidebar header
- [ ] Light/dark mode works
- [ ] `AdminGuard` still protects the layout
