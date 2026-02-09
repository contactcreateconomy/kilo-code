# Phase 02: Header + Footer Modernization

> Replace text-only logo with Logo component, rebuild user menu with shadcn DropdownMenu, add mobile navigation Sheet, modernize footer.

## Tasks

### 1. Modernize Header (`components/layout/header.tsx`)

**Current:** Text-only "Createconomy" logo, basic nav links, search input, UserMenu component
**Target:** Logo + LogoWithText, improved search, mobile hamburger menu

```
┌─────────────────────────────────────────────────────────────┐
│ [C] Createconomy   Products | Categories | Discuss | Sell   │
│                    [════ Search products... ════]   [Avatar] │
└─────────────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────────────────────────────────────┐
│ [☰]  [C] Createconomy                       [🔍] [Avatar]  │
└─────────────────────────────────────────────────────────────┘
```

Changes:
- Replace `<span className="text-xl font-bold text-primary">Createconomy</span>` with `<LogoWithText size={28} />` from `@createconomy/ui/components/logo`
- Keep `Search` icon from `lucide-react` (Phase 01)
- Add mobile hamburger menu using shadcn `Sheet` component:
  - `Menu` icon trigger on left (mobile only)
  - Sheet opens from left with navigation links + search
- Hide desktop nav/search on mobile, show hamburger + compact search icon

### 2. Rebuild User Menu (`components/auth/user-menu.tsx`)

**Current:** Custom `useState` dropdown with manual backdrop, inline SVG icons
**Target:** shadcn `DropdownMenu` with Lucide icons

Replace the entire custom dropdown mechanism with:
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@createconomy/ui/components/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@createconomy/ui/components/avatar';
import { ShoppingCart, User, ClipboardList, Settings, LogOut } from 'lucide-react';
```

Structure:
- `DropdownMenuTrigger` → Avatar button (no manual open/close state)
- `DropdownMenuLabel` → User name + email
- `DropdownMenuGroup` → My Account, My Orders, Settings
- `DropdownMenuSeparator`
- `DropdownMenuItem` → Sign Out (destructive styling)
- Cart icon remains separate (before the dropdown trigger)

### 3. Add Mobile Navigation

Create or enhance header with a `Sheet` component for mobile:

```tsx
import { Sheet, SheetContent, SheetTrigger } from '@createconomy/ui/components/sheet';
import { Menu } from 'lucide-react';
```

The Sheet should contain:
- LogoWithText at top
- Search input
- Navigation links (Products, Categories, Discuss, Sell)
- Sign In / Sign Up buttons (if not authenticated)
- User info + links (if authenticated)

### 4. Modernize Footer (`components/layout/footer.tsx`)

**Current:** Text-only "Createconomy" logo, inline SVG social icons
**Target:** LogoWithText component, Lucide social icons

Changes:
- Replace `<span>Createconomy</span>` with `<LogoWithText size={24} />` or `<Logo size={24} />` + text
- Social icons already replaced with Lucide in Phase 01
- Add more social links if desired (Discord, YouTube)
- Consider adding a newsletter signup section

### 5. Add Sheet component to packages/ui (if not present)

Check if `packages/ui/src/components/sheet.tsx` exists. If not, add the shadcn Sheet component (wraps `@radix-ui/react-dialog` with slide-in animation). Update `packages/ui/package.json` exports.

## Files Modified

| File | Changes |
|------|---------|
| `components/layout/header.tsx` | LogoWithText, mobile Sheet nav, improved layout |
| `components/auth/user-menu.tsx` | shadcn DropdownMenu + Avatar, remove useState pattern |
| `components/layout/footer.tsx` | LogoWithText, improved layout |
| `packages/ui/src/components/sheet.tsx` | Add if missing |
| `packages/ui/package.json` | Add sheet export if missing |

## Design Reference

The marketplace header should feel like a modern e-commerce site (think Gumroad, Lemon Squeezy, Creative Market):
- Clean, minimal
- Search prominently visible on desktop
- Smooth mobile slide-in navigation
- User avatar with clean dropdown menu
