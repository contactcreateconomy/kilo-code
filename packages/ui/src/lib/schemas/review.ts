/**
 * Review Validation Schemas
 *
 * Zod schemas for review-related data validation.
 */

import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================

const REVIEW_MIN_LENGTH = 10;
const REVIEW_MAX_LENGTH = 5000;
const TITLE_MAX_LENGTH = 200;

// ============================================================================
// Rating Schema
// ============================================================================

export const ratingSchema = z
  .number()
  .int("Rating must be a whole number")
  .min(1, "Rating must be at least 1")
  .max(5, "Rating must be at most 5");

// ============================================================================
// Review Creation Schema
// ============================================================================

export const reviewCreateSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: ratingSchema,
  title: z.string().max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`).optional(),
  content: z
    .string()
    .min(REVIEW_MIN_LENGTH, `Review must be at least ${REVIEW_MIN_LENGTH} characters`)
    .max(REVIEW_MAX_LENGTH, `Review must be at most ${REVIEW_MAX_LENGTH} characters`),
  pros: z.array(z.string().max(200)).max(10).optional(),
  cons: z.array(z.string().max(200)).max(10).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  isVerifiedPurchase: z.boolean().default(false),
});

export type ReviewCreate = z.infer<typeof reviewCreateSchema>;

// ============================================================================
// Review Update Schema
// ============================================================================

export const reviewUpdateSchema = z.object({
  id: z.string().min(1, "Review ID is required"),
  rating: ratingSchema.optional(),
  title: z.string().max(TITLE_MAX_LENGTH).optional(),
  content: z
    .string()
    .min(REVIEW_MIN_LENGTH)
    .max(REVIEW_MAX_LENGTH)
    .optional(),
  pros: z.array(z.string().max(200)).max(10).optional(),
  cons: z.array(z.string().max(200)).max(10).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

export type ReviewUpdate = z.infer<typeof reviewUpdateSchema>;

// ============================================================================
// Review Response Schema (Seller)
// ============================================================================

export const reviewResponseSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  content: z
    .string()
    .min(1, "Response cannot be empty")
    .max(2000, "Response must be at most 2000 characters"),
});

export type ReviewResponse = z.infer<typeof reviewResponseSchema>;

// ============================================================================
// Review Report Schema
// ============================================================================

export const reviewReportSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  reason: z.enum([
    "spam",
    "inappropriate",
    "fake",
    "harassment",
    "off_topic",
    "other",
  ]),
  description: z.string().max(1000).optional(),
});

export type ReviewReport = z.infer<typeof reviewReportSchema>;

// ============================================================================
// Review Moderation Schema (Admin)
// ============================================================================

export const reviewModerationSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  action: z.enum(["approve", "reject", "flag", "remove"]),
  reason: z.string().max(500).optional(),
  notifyUser: z.boolean().default(true),
});

export type ReviewModeration = z.infer<typeof reviewModerationSchema>;

// ============================================================================
// Review Search Schema
// ============================================================================

export const reviewSearchSchema = z.object({
  productId: z.string().optional(),
  userId: z.string().optional(),
  minRating: ratingSchema.optional(),
  maxRating: ratingSchema.optional(),
  verifiedOnly: z.boolean().optional(),
  hasImages: z.boolean().optional(),
  sortBy: z.enum(["newest", "oldest", "highest", "lowest", "helpful"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

export type ReviewSearch = z.infer<typeof reviewSearchSchema>;

// ============================================================================
// Review Helpful Vote Schema
// ============================================================================

export const reviewVoteSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  helpful: z.boolean(),
});

export type ReviewVote = z.infer<typeof reviewVoteSchema>;
