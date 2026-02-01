/**
 * Product Validation Schemas
 *
 * Zod schemas for product-related data validation.
 */

import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 10000;
const SHORT_DESCRIPTION_MAX_LENGTH = 500;
const MAX_TAGS = 10;
const MAX_IMAGES = 20;

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Product title schema
 */
export const productTitleSchema = z
  .string()
  .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters`)
  .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`)
  .trim();

/**
 * Product description schema
 */
export const productDescriptionSchema = z
  .string()
  .min(DESCRIPTION_MIN_LENGTH, `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`)
  .max(DESCRIPTION_MAX_LENGTH, `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`);

/**
 * Short description schema
 */
export const shortDescriptionSchema = z
  .string()
  .max(SHORT_DESCRIPTION_MAX_LENGTH, `Short description must be at most ${SHORT_DESCRIPTION_MAX_LENGTH} characters`)
  .optional();

/**
 * Price schema (in cents)
 */
export const priceSchema = z
  .number()
  .int("Price must be a whole number")
  .min(0, "Price cannot be negative")
  .max(100000000, "Price is too high"); // Max $1,000,000

/**
 * Price schema (in dollars)
 */
export const priceDollarsSchema = z
  .number()
  .min(0, "Price cannot be negative")
  .max(1000000, "Price is too high")
  .transform((val) => Math.round(val * 100)); // Convert to cents

/**
 * Slug schema
 */
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(200, "Slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
  .toLowerCase();

/**
 * Tag schema
 */
export const tagSchema = z
  .string()
  .min(1, "Tag cannot be empty")
  .max(50, "Tag is too long")
  .regex(/^[a-zA-Z0-9-]+$/, "Tags can only contain letters, numbers, and hyphens")
  .toLowerCase();

/**
 * Tags array schema
 */
export const tagsSchema = z
  .array(tagSchema)
  .max(MAX_TAGS, `Maximum ${MAX_TAGS} tags allowed`)
  .optional();

/**
 * Image URL schema
 */
export const imageUrlSchema = z
  .string()
  .url("Invalid image URL")
  .regex(/\.(jpg|jpeg|png|gif|webp|avif)$/i, "Invalid image format");

/**
 * Images array schema
 */
export const imagesSchema = z
  .array(imageUrlSchema)
  .min(1, "At least one image is required")
  .max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images allowed`);

// ============================================================================
// Product Status
// ============================================================================

export const productStatusSchema = z.enum([
  "draft",
  "pending_review",
  "published",
  "rejected",
  "archived",
]);

export type ProductStatus = z.infer<typeof productStatusSchema>;

// ============================================================================
// Product Type
// ============================================================================

export const productTypeSchema = z.enum([
  "digital_download",
  "template",
  "course",
  "ebook",
  "software",
  "graphics",
  "audio",
  "video",
  "other",
]);

export type ProductType = z.infer<typeof productTypeSchema>;

// ============================================================================
// License Type
// ============================================================================

export const licenseTypeSchema = z.enum([
  "personal",
  "commercial",
  "extended",
  "unlimited",
]);

export type LicenseType = z.infer<typeof licenseTypeSchema>;

// ============================================================================
// Product Creation Schema
// ============================================================================

export const productCreateSchema = z.object({
  title: productTitleSchema,
  description: productDescriptionSchema,
  shortDescription: shortDescriptionSchema,
  price: priceSchema,
  compareAtPrice: priceSchema.optional(),
  categoryId: z.string().min(1, "Category is required"),
  type: productTypeSchema,
  tags: tagsSchema,
  images: imagesSchema,
  thumbnailUrl: imageUrlSchema.optional(),
  downloadUrl: z.string().url("Invalid download URL").optional(),
  previewUrl: z.string().url("Invalid preview URL").optional(),
  licenseType: licenseTypeSchema.default("personal"),
  features: z.array(z.string().max(200)).max(20).optional(),
  requirements: z.array(z.string().max(200)).max(10).optional(),
  fileSize: z.number().positive().optional(),
  fileFormat: z.string().max(50).optional(),
});

export type ProductCreate = z.infer<typeof productCreateSchema>;

// ============================================================================
// Product Update Schema
// ============================================================================

export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().min(1, "Product ID is required"),
});

export type ProductUpdate = z.infer<typeof productUpdateSchema>;

// ============================================================================
// Product Search Schema
// ============================================================================

export const productSearchSchema = z.object({
  query: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  type: productTypeSchema.optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(["relevance", "price_asc", "price_desc", "newest", "popular"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type ProductSearch = z.infer<typeof productSearchSchema>;

// ============================================================================
// Product Filter Schema
// ============================================================================

export const productFilterSchema = z.object({
  status: productStatusSchema.optional(),
  sellerId: z.string().optional(),
  categoryId: z.string().optional(),
  type: productTypeSchema.optional(),
  featured: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

// ============================================================================
// Product Variant Schema
// ============================================================================

export const productVariantSchema = z.object({
  name: z.string().min(1).max(100),
  price: priceSchema,
  description: z.string().max(500).optional(),
  downloadUrl: z.string().url().optional(),
  licenseType: licenseTypeSchema,
});

export type ProductVariant = z.infer<typeof productVariantSchema>;
