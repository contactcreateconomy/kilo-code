# Phase 01: Foundation + Lucide Icons

> Add `lucide-react` dependency and replace ALL inline SVG icon functions across the entire marketplace app.

## Why This Phase First

Every component in the marketplace app defines its own inline SVG icon functions (`StarIcon`, `CartIcon`, `SearchIcon`, `HeartIcon`, `CheckIcon`, `LoadingIcon`, `ErrorIcon`, `LockIcon`, `WarningIcon`, `XIcon`, `PackageIcon`, `SettingsIcon`, `TwitterIcon`, `GitHubIcon`). This is ~15+ duplicate SVG functions across 10+ files. Replacing them all with `lucide-react` in one pass eliminates this technical debt cleanly.

## Tasks

### 1. Add `lucide-react` dependency

In `apps/marketplace/package.json`, add to `dependencies`:
```json
"lucide-react": "^0.563.0"
```

Run `pnpm install` from root.

### 2. Replace inline SVGs — File by file

#### `components/products/product-card.tsx`
- Remove `StarIcon` function (lines 44-58)
- Import `Star` from `lucide-react`
- Replace `<StarIcon className="h-4 w-4 fill-warning text-warning" />` with `<Star className="h-4 w-4 fill-amber-400 text-amber-400" />`

#### `components/products/add-to-cart-button.tsx`
- Remove `CartIcon`, `CheckIcon`, `LoadingIcon` functions (lines 98-148)
- Import `ShoppingCart`, `Check`, `Loader2` from `lucide-react`
- Replace usages: `<CartIcon>` → `<ShoppingCart>`, `<CheckIcon>` → `<Check>`, `<LoadingIcon>` → `<Loader2>`

#### `components/auth/user-menu.tsx`
- Remove `CartIcon` function (lines 182-198)
- Remove all inline SVGs in dropdown items (User, ClipboardList, Settings, LogOut, ChevronDown icons)
- Import `ShoppingCart`, `User`, `ClipboardList`, `Settings`, `LogOut`, `ChevronDown` from `lucide-react`

#### `components/layout/header.tsx`
- Remove `SearchIcon` function (lines 58-73)
- Import `Search` from `lucide-react`

#### `components/layout/footer.tsx`
- Remove `TwitterIcon`, `GitHubIcon` functions (lines 158-182)
- Import `Twitter` (or use X icon since it's now X), `Github` from `lucide-react`
- Note: Lucide has `Twitter` icon — but the current SVG uses the X/Twitter logo. Use the Lucide icon and adjust if needed.

#### `app/page.tsx` (home page)
- Remove `StarIcon` function (lines 243-257)
- Import `Star` from `lucide-react`

#### `app/cart/page.tsx`
- Remove `ShoppingCartIcon` function (lines 71-87)
- Import `ShoppingCart` from `lucide-react`

#### `components/cart/cart-item.tsx`
- Remove all 3 inline SVG functions for Minus, Plus, Trash icons (embedded in JSX)
- Import `Minus`, `Plus`, `Trash2` from `lucide-react`

#### `components/cart/cart-summary.tsx`
- Remove inline SVGs for Lock and ShieldCheck (lines 66-98)
- Import `Lock`, `ShieldCheck` from `lucide-react`

#### `app/checkout/page.tsx`
- Remove `LoadingSpinner`, `ErrorIcon`, `LockIcon` functions (lines 159-210)
- Import `Loader2`, `AlertCircle`, `Lock` from `lucide-react`
- Replace raw `<button>` elements with shadcn `Button`

#### `app/checkout/success/page.tsx`
- Remove `LoadingSpinner`, `CheckIcon`, `WarningIcon` functions (lines 210-260)
- Import `Loader2`, `CheckCircle2`, `AlertTriangle` from `lucide-react`

#### `app/checkout/cancel/page.tsx`
- Remove `XIcon` function (lines 38-53)
- Import `XCircle` from `lucide-react`

#### `app/account/page.tsx`
- Remove `PackageIcon`, `SettingsIcon` functions (lines 102-137)
- Import `Package`, `Settings` from `lucide-react`

#### `app/products/[slug]/page.tsx`
- Remove `StarIcon`, `HeartIcon` functions (lines 271-302)
- Import `Star`, `Heart` from `lucide-react`

### 3. Verification

After all replacements:
- No file in `apps/marketplace/src/` should contain `function *Icon(` pattern (custom SVG icon components)
- All icons come from `lucide-react` imports
- Visual appearance should be identical or improved (Lucide icons are 24x24 by default, properly stroked)

## Files Modified

| File | Changes |
|------|---------|
| `apps/marketplace/package.json` | Add `lucide-react` |
| `components/products/product-card.tsx` | Star icon |
| `components/products/add-to-cart-button.tsx` | ShoppingCart, Check, Loader2 |
| `components/auth/user-menu.tsx` | Multiple icons |
| `components/layout/header.tsx` | Search icon |
| `components/layout/footer.tsx` | Twitter/X, Github |
| `app/page.tsx` | Star icon |
| `app/cart/page.tsx` | ShoppingCart |
| `components/cart/cart-item.tsx` | Minus, Plus, Trash2 |
| `components/cart/cart-summary.tsx` | Lock, ShieldCheck |
| `app/checkout/page.tsx` | Loader2, AlertCircle, Lock + Button |
| `app/checkout/success/page.tsx` | Loader2, CheckCircle2, AlertTriangle |
| `app/checkout/cancel/page.tsx` | XCircle |
| `app/account/page.tsx` | Package, Settings |
| `app/products/[slug]/page.tsx` | Star, Heart |
