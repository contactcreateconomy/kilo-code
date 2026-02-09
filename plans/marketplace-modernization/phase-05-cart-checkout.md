# Phase 05: Cart + Checkout Pages

> Modernize cart and checkout flow with shadcn Card, Badge, Separator, and proper Lucide icons.

## Tasks

### 1. Enhance Cart Page (`app/cart/page.tsx`)

**Current:** Basic grid layout, empty state with inline SVG
**Target:** Improved empty state with Lucide icon, Breadcrumb, section heading

Changes:
- Add `Breadcrumb`: Home > Shopping Cart
- Empty state: Use `ShoppingCart` from Lucide (done in Phase 01), wrap in `Card` with centered content
- Section heading with cart item count `Badge`

### 2. Modernize Cart Item (`components/cart/cart-item.tsx`)

**Current:** Raw `<div>` with inline SVG buttons for +/-, Trash
**Target:** Lucide icons (done in Phase 01), improved button styling

Changes:
- Lucide icons already replaced in Phase 01 (`Minus`, `Plus`, `Trash2`)
- Wrap entire cart item in shadcn `Card` with horizontal layout
- Add `Separator` between items instead of `border-b`
- Improve quantity control styling with proper button group

### 3. Modernize Cart Summary (`components/cart/cart-summary.tsx`)

**Current:** Raw `<div>` with `rounded-lg border bg-card`, inline SVG trust icons
**Target:** shadcn `Card` + `CardHeader` + `CardContent`, proper form for promo code

Changes:
- Wrap in shadcn `Card`, `CardHeader`, `CardTitle`, `CardContent`
- Promo code section: Replace raw `<input>` with shadcn `Input`
- Trust badges: Lucide `Lock`, `ShieldCheck` icons (done in Phase 01)
- Add `Separator` between price lines and total
- Use `Badge variant="secondary"` for "Free shipping" or promo applied

### 4. Modernize Checkout Page (`app/checkout/page.tsx`)

**Current:** Uses raw `<button>` elements with inline styling, inline SVG spinners
**Target:** shadcn `Button`, `Card`, `Badge` for payment status, `Spinner` component

Changes:
- Replace raw `<button>` with shadcn `Button`
- Wrap order summary in shadcn `Card`
- Loading state: Use `Loader2` from Lucide with proper animation
- Error state: Use `AlertCircle` from Lucide + shadcn `Card` with destructive styling
- Security notice: Use `Lock` icon with `Badge`

### 5. Modernize Checkout Success (`app/checkout/success/page.tsx`)

**Current:** Inline SVG icons for CheckIcon, WarningIcon, LoadingSpinner, raw status badge
**Target:** Lucide icons (done Phase 01), shadcn `Card` for order summary, shadcn `Badge` for status

Changes:
- Icons already replaced in Phase 01
- Wrap order summary in shadcn `Card`, `CardHeader`, `CardContent`
- Payment status: Use shadcn `Badge` (variant="default" for paid, variant="secondary" for processing)
- Line items: Use mini `Table` or styled list with `Separator`
- Actions: shadcn `Button` (already using)

### 6. Modernize Checkout Cancel (`app/checkout/cancel/page.tsx`)

**Current:** Inline SVG XIcon
**Target:** Lucide `XCircle` (done Phase 01), improved layout

Changes:
- Icon replaced in Phase 01
- Wrap content in shadcn `Card` for a more contained feel
- Ensure consistent styling with success page

## Files Modified

| File | Changes |
|------|---------|
| `app/cart/page.tsx` | Breadcrumb, improved empty state |
| `components/cart/cart-item.tsx` | Card wrapping, Separator |
| `components/cart/cart-summary.tsx` | shadcn Card/CardHeader, Input for promo |
| `app/checkout/page.tsx` | Button, Card, proper icons |
| `app/checkout/success/page.tsx` | Card, Badge, Table for items |
| `app/checkout/cancel/page.tsx` | Card wrapping, consistent styling |
