# Phase 1: Digital Product Delivery & Licensing

> Core marketplace functionality that Gumroad is built around — the ability to sell and deliver digital products.

---

## Overview

Gumroad's primary value proposition is **digital product delivery**. Their platform handles file hosting, download links, PDF stamping, license key generation, and streaming. Our marketplace currently only supports browsing and purchasing products but has no mechanism for **delivering digital content to buyers**.

This is the highest-priority gap to close.

---

## Features to Implement

### 1.1 Digital File Management — Backend

**Gumroad reference:** `product_files_utility_controller.rb`, `ProductFile` model, `AssetPreview` model

**What to build:**
- New schema table `productFiles` with fields: `productId`, `fileName`, `fileSize`, `fileType`, `storageUrl`, `sortOrder`, `isDeleted`
- New schema table `productDownloads` for tracking: `userId`, `productFileId`, `orderId`, `downloadedAt`, `ipAddress`
- Convex functions: `uploadProductFile`, `deleteProductFile`, `reorderFiles`, `getProductFiles`
- File storage integration using Convex file storage or external S3
- File type detection and metadata extraction

### 1.2 Digital File Upload — Seller App

**Gumroad reference:** `BundleEdit`, `ProductFilesUtility` components

**What to build:**
- File upload UI on seller product edit page at `apps/seller/src/app/products/[id]/page.tsx`
- Drag-and-drop file upload with progress indicators
- Support for multiple file types: PDF, ZIP, audio, video, images
- File size limits and validation
- File reordering and management

### 1.3 Download Delivery — Buyer Side

**Gumroad reference:** `url_redirects_controller.rb`, `library_controller.rb`

**What to build:**
- New page `apps/marketplace/src/app/account/downloads/page.tsx` - enhance existing stub
- Signed/time-limited download URLs generated server-side
- Download tracking - log every download per user per file
- Download limit enforcement if configured by seller
- Re-download capability from purchase library
- Post-purchase redirect to download page

### 1.4 Purchase Library

**Gumroad reference:** `library_controller.rb`, Library component

**What to build:**
- Complete the existing `apps/marketplace/src/app/account/downloads/page.tsx` page
- Show all purchased products with their downloadable files
- Filter by product, date, file type
- Quick re-download buttons
- Show download count per file

### 1.5 License Key Generation

**Gumroad reference:** `licenses_controller.rb`, `License` model

**What to build:**
- New schema table `licenses` with fields: `productId`, `orderId`, `userId`, `licenseKey`, `maxActivations`, `currentActivations`, `isDisabled`
- Auto-generate license keys on purchase for products flagged as `requiresLicense`
- Display license key on order confirmation and in purchase library
- Seller setting to enable/disable license keys per product
- API endpoint for license key verification - used by sellers software

### 1.6 Asset Previews

**Gumroad reference:** `asset_previews_controller.rb`, `AudioPlayer.tsx`

**What to build:**
- Enhance product detail page to show preview content
- Audio player component for audio products
- Video preview player with limited playback
- PDF preview with page limit
- Preview vs full content distinction in product files

---

## Schema Changes Required

```
productFiles: defineTable({
  productId: v.id("products"),
  fileName: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),
  storageId: v.string(),
  isPreview: v.boolean(),
  sortOrder: v.number(),
  isDeleted: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

productDownloads: defineTable({
  userId: v.id("users"),
  productFileId: v.id("productFiles"),
  orderId: v.id("orders"),
  downloadedAt: v.number(),
  ipAddress: v.optional(v.string()),
})

licenses: defineTable({
  productId: v.id("products"),
  orderId: v.id("orders"),
  userId: v.id("users"),
  licenseKey: v.string(),
  maxActivations: v.number(),
  currentActivations: v.number(),
  isDisabled: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

---

## Files to Create/Modify

### Backend - `packages/convex/convex/`
- [ ] `schema.ts` — Add `productFiles`, `productDownloads`, `licenses` tables
- [ ] `functions/files.ts` — New: upload, delete, reorder, get files
- [ ] `functions/downloads.ts` — New: generate download URLs, track downloads
- [ ] `functions/licenses.ts` — New: generate, verify, manage license keys
- [ ] `functions/orders.ts` — Modify: trigger file delivery + license generation on purchase

### Seller App - `apps/seller/src/`
- [ ] `app/products/[id]/files/page.tsx` — New: file management page
- [ ] `components/products/file-upload.tsx` — New: file upload component
- [ ] `components/products/file-list.tsx` — New: file management list
- [ ] `components/products/license-settings.tsx` — New: license config

### Marketplace App - `apps/marketplace/src/`
- [ ] `app/account/downloads/page.tsx` — Enhance: full purchase library
- [ ] `components/account/my-downloads.tsx` — Enhance: download list + actions
- [ ] `components/products/product-detail-content.tsx` — Modify: show previews
- [ ] `components/products/audio-player.tsx` — New: audio preview player
- [ ] `components/products/video-player.tsx` — New: video preview player
- [ ] `components/checkout/checkout-success-downloads.tsx` — New: post-purchase download

---

## Dependencies

- Convex file storage or S3 integration for file hosting
- Signed URL generation capability
- File type detection library
