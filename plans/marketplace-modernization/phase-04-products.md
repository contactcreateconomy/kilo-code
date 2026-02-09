# Phase 04: Products + Product Detail Pages

> Modernize the product browsing and product detail pages with shadcn components, proper filters, and improved UX.

## Tasks

### 1. Enhance Product Card (`components/products/product-card.tsx`)

**Current:** Basic Card with image, name, seller, price, star rating
**Target:** Enhanced card with category Badge, Avatar for seller, improved rating

Changes:
- Add `Badge` for product category (top of card or overlaying image)
- Replace star rating SVG with Lucide `Star` (done in Phase 01)
- Add seller `Avatar` (small, beside seller name)
- Add "Add to Cart" hover overlay or quick-add button
- Improve price display formatting

### 2. Modernize Product Filters (`components/products/product-filters.tsx`)

**Current:** Raw `<button>` elements for categories, plain `<Input>` for price
**Target:** shadcn components for all form elements

Changes:
- Category filter: Use shadcn `RadioGroup` or styled button group with proper active states
- Price range: Use shadcn `Input` with `Label` (already using these) + add a `Slider` component if available
- Sort options: Add a `Select` component for sort order (Price Low→High, High→Low, Newest, Rating)
- Add a "Rating" filter using star buttons
- Wrap filter groups in `Collapsible` components for mobile accordion behavior
- Add filter count `Badge` on mobile filter trigger button

### 3. Improve Products Page (`app/products/page.tsx`)

**Current:** Side-by-side layout with filters sidebar and grid
**Target:** Enhanced with sort controls, view toggle, result count

Changes:
- Add toolbar above product grid with:
  - Result count text ("Showing 24 products")
  - Sort `Select` dropdown
  - Grid/List view toggle using `ToggleGroup`
- Add `Breadcrumb` for navigation context
- Improve skeleton loading with shadcn `Skeleton`
- Mobile: Add filter Sheet trigger button (filter icon)

### 4. Enhance Product Detail Page (`app/products/[slug]/page.tsx`)

**Current:** Two-column layout with image gallery, product info, seller card, related products
**Target:** Improved with Breadcrumb, Tabs for description/reviews, Badge for category, proper Avatar

Changes:
- Add `Breadcrumb`: Home > Categories > {category} > {product name}
- Product images: Add thumbnail selector with active state border
- Category link: Use `Badge variant="secondary"` instead of plain text link
- Rating display: Use `Star` Lucide icons filled/unfilled
- Seller card: Add `Avatar` with `AvatarFallback`, enhance with verified badge
- Add `Tabs` component below product info:
  - Tab 1: Description (full product description, formatted)
  - Tab 2: Reviews (star breakdown + review list)
  - Tab 3: Details (file type, size, compatibility info)
- "Add to Cart" button: Already uses `AddToCartButton` — just ensure Lucide icons from Phase 01
- Wishlist button: Style with `Button variant="outline" size="icon"` + Lucide `Heart`
- Related products section: Add horizontal scroll on mobile

### 5. Improve Categories Page (`app/categories/page.tsx`)

**Current:** Grid of category cards with image overlays
**Target:** Enhanced with icons, better descriptions, product count Badges

Changes:
- Add Lucide icons for each category
- Use `Badge` for product count
- Add `Breadcrumb`: Home > Categories
- Consider adding featured/popular category highlight

### 6. Ensure Breadcrumb in packages/ui

Verify that `Breadcrumb` component is already exported from `packages/ui` (added in Phase 01 of admin/seller). If not, add it.

## Files Modified

| File | Changes |
|------|---------|
| `components/products/product-card.tsx` | Badge, Avatar, improved layout |
| `components/products/product-filters.tsx` | RadioGroup/Collapsible, Select for sort |
| `app/products/page.tsx` | Toolbar, Breadcrumb, mobile filter Sheet |
| `app/products/[slug]/page.tsx` | Breadcrumb, Tabs, Avatar, Badge |
| `app/categories/page.tsx` | Icons, Badge, Breadcrumb |
| `app/categories/[slug]/page.tsx` | Breadcrumb, improved layout |

## New shadcn Components Needed

Check `packages/ui` for these — add if missing:
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `RadioGroup`, `RadioGroupItem`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` (already added)
- `ToggleGroup`, `ToggleGroupItem` (optional — for grid/list view toggle)
