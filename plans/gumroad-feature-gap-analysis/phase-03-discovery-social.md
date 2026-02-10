# Phase 3: Discovery, Social & Engagement

> Features that help buyers discover products and engage with sellers: curated discovery, wishlists, following, seller profiles, and product tagging.

---

## Overview

Gumroad has a full-featured Discover page that drives organic traffic to creators. They also have rich seller profiles, follower systems, product tagging, and seller blog posts. Our marketplace has basic category browsing and search but lacks the social and discovery layer that drives engagement and repeat visits.

---

## Features to Implement

### 3.1 Discover Page — Curated Browse

**Gumroad reference:** `discover_controller.rb`, Discover component directory

**What to build:**
- New page `apps/marketplace/src/app/discover/page.tsx`
- Curated sections: trending products, new arrivals, staff picks, top rated
- Category-based browsing with visual cards
- Personalized recommendations based on purchase history
- Infinite scroll or pagination
- Sorting: trending, newest, highest rated, most sold

### 3.2 Product Tags

**Gumroad reference:** `tags_controller.rb`, Tag model

**What to build:**
- Schema: `productTags` table with `productId`, `tag` — normalized lowercase string
- Seller UI: tag input on product edit — autocomplete from existing tags
- Tag display on product cards and detail pages
- Tag-based filtering on browse and search pages
- Tag cloud or popular tags widget
- URL: `/products?tag=design-templates`

### 3.3 Enhanced Seller Profiles

**Gumroad reference:** `profile_sections_controller.rb`, rich seller page with bio, links, products, posts

**What to build:**
- Enhance `apps/marketplace/src/app/sellers/[id]/page.tsx`
- Profile sections: about, featured products, all products, reviews
- Seller avatar, banner image, bio, social links
- Product grid with sorting and filtering
- Seller stats: products count, total sales, avg rating
- Schema: add fields to sellers — `bannerImage`, `bio`, `socialLinks`, `websiteUrl`

### 3.4 Follow Sellers

**Gumroad reference:** `followers_controller.rb`, Follower model

**What to build:**
- Schema: `sellerFollows` table with `userId`, `sellerId`, `followedAt`
- Follow/unfollow button on seller profile
- Following list in buyer account
- Follower count on seller profile
- Optional: notification when followed seller adds new product
- Backend: `functions/follows.ts` — follow, unfollow, getFollowing, getFollowers

### 3.5 Seller Blog Posts

**Gumroad reference:** `posts_controller.rb`, Post model, PostPage component

**What to build:**
- Schema: `sellerPosts` table with `sellerId`, `title`, `content`, `isPublished`, `publishedAt`
- Seller UI: rich text editor for writing posts
- Display on seller profile page
- Individual post pages: `/sellers/[id]/posts/[postId]`
- RSS feed potential
- Posts show on Discover page feed

### 3.6 Wishlist Completion

**Gumroad reference:** `wishlists_controller.rb`, Wishlist components

**What to build:**
- Verify and complete `apps/marketplace/src/app/account/wishlist/page.tsx`
- Schema: `wishlists` table — if not already present — with `userId`, `productId`, `addedAt`
- Add to wishlist button on product cards and detail pages
- Wishlist page with remove and add-to-cart actions
- Wishlist count indicator in header/nav
- Backend: `functions/wishlists.ts`

### 3.7 Activity Feed

**Gumroad reference:** `ActivityFeed.tsx` component

**What to build:**
- Homepage or dashboard widget showing recent activity
- New products from followed sellers
- Recent purchases — anonymized
- Trending products
- New reviews on purchased products

### 3.8 Embeddable Checkout Widgets

**Gumroad reference:** `embedded_javascripts_controller.rb`, Overlay/Embed components

**What to build:**
- JavaScript embed snippet for external websites
- Overlay checkout that pops up without leaving the host site
- Product card embed widget
- Buy button embed
- Seller UI: generate embed codes per product

---

## Schema Changes Required

```
productTags: defineTable({
  productId: v.id("products"),
  tag: v.string(),
  createdAt: v.number(),
})

sellerFollows: defineTable({
  userId: v.id("users"),
  sellerId: v.id("users"),
  followedAt: v.number(),
})

sellerPosts: defineTable({
  sellerId: v.id("users"),
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  isPublished: v.boolean(),
  publishedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})

wishlists: defineTable({
  userId: v.id("users"),
  productId: v.id("products"),
  addedAt: v.number(),
})
```

---

## Files to Create/Modify

### Backend - `packages/convex/convex/`
- [ ] `schema.ts` — Add `productTags`, `sellerFollows`, `sellerPosts`, `wishlists`
- [ ] `functions/tags.ts` — Modify: add product tag functions
- [ ] `functions/follows.ts` — New: follow/unfollow, get followers
- [ ] `functions/sellerPosts.ts` — New: CRUD for seller blog posts
- [ ] `functions/wishlists.ts` — New: add, remove, get wishlist
- [ ] `functions/discover.ts` — New: curated discovery queries

### Marketplace App - `apps/marketplace/src/`
- [ ] `app/discover/page.tsx` — New: curated discover page
- [ ] `app/discover/loading.tsx` — New: loading skeleton
- [ ] `components/discover/trending-section.tsx` — New
- [ ] `components/discover/category-showcase.tsx` — New
- [ ] `components/discover/new-arrivals.tsx` — New
- [ ] `components/discover/recommended-for-you.tsx` — New
- [ ] `app/sellers/[id]/page.tsx` — Enhance: rich seller profile
- [ ] `app/sellers/[id]/posts/page.tsx` — New: seller blog listing
- [ ] `app/sellers/[id]/posts/[postId]/page.tsx` — New: individual post
- [ ] `components/sellers/follow-button.tsx` — New
- [ ] `components/sellers/seller-stats.tsx` — New
- [ ] `components/products/product-tags.tsx` — New: tag display
- [ ] `components/products/tag-filter.tsx` — New: tag-based filtering
- [ ] `components/wishlist/wishlist-button.tsx` — New: add to wishlist
- [ ] `app/account/wishlist/page.tsx` — Enhance: complete wishlist
- [ ] `components/account/wishlist-list.tsx` — New
- [ ] `components/home/activity-feed.tsx` — New

### Seller App - `apps/seller/src/`
- [ ] `app/posts/page.tsx` — New: blog post management
- [ ] `app/posts/new/page.tsx` — New: create post
- [ ] `app/posts/[id]/page.tsx` — New: edit post
- [ ] `components/posts/post-editor.tsx` — New: rich text editor
- [ ] `app/products/[id]/page.tsx` — Modify: add tag input
- [ ] `components/products/tag-input.tsx` — New
- [ ] `app/settings/page.tsx` — Modify: add profile enhancement fields

---

## Dependencies

- Rich text editor for seller blog posts — potentially shared with forum
- Image upload for seller banners
