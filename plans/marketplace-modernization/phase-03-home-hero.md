# Phase 03: Home Page Hero + Landing Sections

> Enhance the marketplace home page with a modern hero section, improved stats bar, better category/product cards, and trust signals.

## Current State

The home page has 5 sections that work but feel basic:
1. **Hero** — gradient bg, centered text, 2 CTAs
2. **Categories** — 4 cards with overlay text
3. **Featured Products** — 4 product cards
4. **Stats** — 4 plain numbers
5. **CTA** — solid primary bg with button

## Planned Enhancements

### 1. Enhanced Hero Section

**Current:** Simple gradient `bg-gradient-to-b from-primary/5 to-background`
**Target:** More visually striking hero with floating product previews or grid pattern

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│          Discover Premium                           │
│          Digital Products                           │
│                                                     │
│   The marketplace for creators. Find templates,     │
│   courses, graphics, and more.                      │
│                                                     │
│   [Browse Products]  [Start Selling]                │
│                                                     │
│   ⭐ 4.9 rating  •  50K+ products  •  10K+ sellers │
│                                                     │
│   ┌─────┐ ┌─────┐ ┌─────┐  (floating product      │
│   │     │ │     │ │     │   preview cards or        │
│   └─────┘ └─────┘ └─────┘   decorative elements)   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Changes:
- Add subtle dot grid or gradient pattern background
- Add inline trust badges below CTAs: `Star` rating, product count, seller count
- Add `Badge` components for trending categories
- Improve button styling: primary button with `ArrowRight` icon
- Consider adding a `Sparkles` or `Zap` icon next to the headline

### 2. Improved Category Cards

**Current:** Image overlay cards with product count
**Target:** Add subtle hover effects, gradient overlays, and icons

Changes:
- Add category-specific Lucide icons alongside text (e.g., `Layout` for Templates, `GraduationCap` for Courses, `Palette` for Graphics, `Plug` for Plugins)
- Enhance hover animation
- Add `Badge` for product count instead of plain text

### 3. Featured Products Enhancement

**Current:** Basic product cards with Star rating
**Target:** Enhanced cards with proper Badge for price, improved rating display

Changes:
- Use `Badge` variant for product category tag
- Replace the star rating inline SVG with Lucide `Star` icon (already done in Phase 01)
- Add "Featured" badge overlay on product images
- Add seller avatar with `Avatar` component

### 4. Stats Section Upgrade

**Current:** Plain `text-4xl font-bold text-primary` numbers
**Target:** shadcn `Card` components with icons and subtle animations

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  📦 50K+     │ │  🎨 10K+     │ │  👥 500K+    │ │  💰 $10M+    │
│  Products    │ │  Creators    │ │  Customers   │ │  Paid Out    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

- Wrap each stat in shadcn `Card` with `CardContent`
- Add Lucide icons: `Package` (Products), `Palette` (Creators), `Users` (Customers), `DollarSign` (Paid Out)
- Add subtle `bg-primary/5` background

### 5. CTA Section Enhancement

**Current:** Solid `bg-primary` background
**Target:** Dark zinc background matching seller CTA pattern, or gradient

Changes:
- Switch to `bg-zinc-900 text-white` for a more premium feel (matching seller landing CTA)
- Add subtle pattern or gradient
- Add trust badges below button: "No upfront costs", "Secure payments", "30-day guarantee"
- Use `CheckCircle2` icons from Lucide for trust items

### 6. Add "Trending Now" Section (NEW)

Add a new section between Categories and Featured Products:

```
Trending Now
────────────────────────────────────────
[Template]  [React Course]  [Icon Pack]  [UI Kit]  [Font Pack]
```

- Horizontal scrollable on mobile
- Uses `Badge` components or compact product cards
- Shows top 5-8 trending products as smaller cards

### 7. Add "Why Choose Createconomy" Section (NEW)

Add between Featured Products and Stats:

```
Why Choose Createconomy
────────────────────────────────────────
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Curated  │  │ Secure   │  │ Instant  │
│ Quality  │  │ Payments │  │ Download │
│          │  │          │  │          │
│ Every    │  │ Stripe   │  │ Get your │
│ product  │  │ powered  │  │ files    │
│ reviewed │  │ checkout │  │ instantly│
└──────────┘  └──────────┘  └──────────┘
```

- 3-column feature grid
- Lucide icons: `BadgeCheck`, `ShieldCheck`, `Download`
- shadcn `Card` components

## Files Modified

| File | Changes |
|------|---------|
| `app/page.tsx` | Complete rewrite — enhanced hero, improved sections, 2 new sections |

## Design Notes

- Keep the overall structure: vertical sections stacking
- Sections alternate between white and `bg-muted/50` backgrounds
- Generous padding: `py-16 md:py-24`
- All icons from `lucide-react`
- Use shadcn `Card`, `Badge`, `Button`, `Avatar` from `@createconomy/ui`
