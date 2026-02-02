# Testing Plan: Background and Navbar Changes

## Overview
This document outlines the testing plan for verifying the recent background and navbar changes across all 4 apps in the Createconomy monorepo.

## Apps to Test

| App | Port | Background Component | Navbar Component |
|-----|------|---------------------|------------------|
| Marketplace | 3000 | `DotGridBackground` | `GlassmorphismNavbar` |
| Forum | 3001 | `DotGridBackground` | `GlassmorphismNavbar` |
| Admin | 3002 | None (sidebar layout) | `GlassmorphismNavbar` |
| Seller | 3003 | None (sidebar layout) | `GlassmorphismNavbar` |

## Shared UI Components

### GlassmorphismNavbar
- **Location**: `packages/ui/src/components/layout/glassmorphism-navbar.tsx`
- **Features**:
  - Glass effect with `backdrop-blur-md`
  - Semi-transparent background using CSS variable `--navbar-bg`
  - Subtle border bottom with `border-border/50`
  - Height: 64px (h-16)
  - Sticky positioning at top

### DotGridBackground
- **Location**: `packages/ui/src/components/layout/dot-grid-background.tsx`
- **Features**:
  - Full-page dot grid pattern
  - Optional fade-center mask effect
  - Customizable dot color and spacing
  - Fixed positioning for background layer

## Test Cases

### 1. Marketplace App (localhost:3000)
- [ ] Verify DotGridBackground renders correctly
- [ ] Verify dot pattern is visible in both light and dark modes
- [ ] Verify GlassmorphismNavbar has glass effect
- [ ] Verify navbar is sticky at top
- [ ] Verify search bar is centered
- [ ] Verify theme toggle works
- [ ] Verify notifications dropdown works
- [ ] Verify cart icon is visible
- [ ] Verify user menu works

### 2. Forum App (localhost:3001)
- [ ] Verify DotGridBackground renders correctly
- [ ] Verify dot pattern is visible in both light and dark modes
- [ ] Verify GlassmorphismNavbar has glass effect
- [ ] Verify navbar is sticky at top
- [ ] Verify navigation links work (Home, Categories, Search)
- [ ] Verify search bar is centered
- [ ] Verify theme toggle works
- [ ] Verify notifications dropdown works
- [ ] Verify New Thread button is visible
- [ ] Verify Back to Createconomy banner is visible below navbar

### 3. Admin App (localhost:3002)
- [ ] Verify GlassmorphismNavbar has glass effect
- [ ] Verify navbar is positioned correctly (left: 64px for sidebar)
- [ ] Verify search bar works
- [ ] Verify theme toggle works
- [ ] Verify notifications dropdown works
- [ ] Verify profile dropdown works
- [ ] Verify quick links (Marketplace, Forum) are visible

### 4. Seller App (localhost:3003)
- [ ] Verify GlassmorphismNavbar has glass effect
- [ ] Verify search bar is expanded by default
- [ ] Verify Add Product button is visible
- [ ] Verify theme toggle works
- [ ] Verify notifications dropdown works
- [ ] Verify profile dropdown works

## Dark Mode Testing
For each app, verify:
- [ ] Theme toggle switches between light and dark modes
- [ ] Navbar background adapts to theme
- [ ] Dot grid pattern (if applicable) adapts to theme
- [ ] All text remains readable in both modes
- [ ] No visual glitches during theme transition

## Responsive Testing
For each app, verify at different viewport sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## How to Run Tests

1. Start all development servers:
   ```bash
   pnpm dev
   ```

2. Open each app in browser:
   - Marketplace: http://localhost:3000
   - Forum: http://localhost:3001
   - Admin: http://localhost:3002
   - Seller: http://localhost:3003

3. For each app, go through the test cases above

## Issues Found

### Critical Issues Fixed During Testing

1. **Missing `next-themes` dependency** in Marketplace and Forum apps
   - **Error**: `Module not found: Can't resolve 'next-themes'`
   - **Fix**: Added `next-themes` package to both apps via `pnpm add next-themes`

2. **Path alias resolution issues** in UI package components
   - **Error**: `Module not found: Can't resolve '@/components/...'`
   - **Cause**: The `@/` path aliases in the UI package don't resolve correctly when consumed by apps
   - **Fix**: Changed all `@/` imports to relative imports (`../../lib/utils`, `../button`, etc.) in:
     - `packages/ui/src/components/layout/glassmorphism-navbar.tsx`
     - `packages/ui/src/components/layout/dot-grid-background.tsx`
     - `packages/ui/src/components/navbar/login-button.tsx`
     - `packages/ui/src/components/navbar/logo.tsx`
     - `packages/ui/src/components/navbar/animated-search.tsx`
     - `packages/ui/src/components/navbar/theme-toggle.tsx`
     - `packages/ui/src/components/navbar/notifications-dropdown.tsx`
     - `packages/ui/src/components/navbar/profile-dropdown.tsx`

### Minor Issues Observed

1. **Duplicate "Welcome back" text** on Seller sign-in page (cosmetic issue)
2. **Image warnings** - Missing `sizes` prop on Next.js Image components (performance warning)
3. **Theme toggle** - Clicking doesn't visually change the theme (may need investigation)

### Test Results Summary

| App | Status | Background | Navbar | Notes |
|-----|--------|------------|--------|-------|
| Marketplace | ✅ Working | DotGridBackground visible | GlassmorphismNavbar working | Hero section, categories rendering |
| Forum | ✅ Working | DotGridBackground visible | GlassmorphismNavbar working | Welcome page, search, navigation working |
| Admin | ✅ Working | Dark theme | Sign-in page only | Requires auth to see dashboard navbar |
| Seller | ✅ Working | Dark theme | Sign-in page only | Requires auth to see dashboard navbar |

---

## Implementation Details

### Marketplace Layout
```tsx
// apps/marketplace/src/app/layout.tsx
<DotGridBackground>
  <div className="relative flex min-h-screen flex-col">
    <Header />  // Uses GlassmorphismNavbar
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
</DotGridBackground>
```

### Forum Layout
```tsx
// apps/forum/src/app/layout.tsx
<DotGridBackground>
  <div className="relative flex min-h-screen flex-col">
    <Header />  // Uses GlassmorphismNavbar
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
</DotGridBackground>
```

### Admin Header
```tsx
// apps/admin/src/components/layout/admin-header.tsx
<GlassmorphismNavbar className="fixed left-64 right-0 top-0">
  // Logo, Search, Theme Toggle, Notifications, Profile
</GlassmorphismNavbar>
```

### Seller Header
```tsx
// apps/seller/src/components/layout/seller-header.tsx
<GlassmorphismNavbar className="border-b">
  // Search, Add Product, Theme Toggle, Notifications, Profile
</GlassmorphismNavbar>
```
