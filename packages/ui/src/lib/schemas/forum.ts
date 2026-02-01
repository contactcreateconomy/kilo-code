/**
 * Forum Validation Schemas
 *
 * Zod schemas for forum-related data validation.
 */

import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================

const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 200;
const CONTENT_MIN_LENGTH = 10;
const CONTENT_MAX_LENGTH = 50000;
const CATEGORY_NAME_MAX_LENGTH = 100;
const MAX_TAGS = 5;

// ============================================================================
// Thread Creation Schema
// ============================================================================

export const threadCreateSchema = z.object({
  title: z
    .string()
    .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters`)
    .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters`)
    .trim(),
  content: z
    .string()
    .min(CONTENT_MIN_LENGTH, `Content must be at least ${CONTENT_MIN_LENGTH} characters`)
    .max(CONTENT_MAX_LENGTH, `Content must be at most ${CONTENT_MAX_LENGTH} characters`),
  categoryId: z.string().min(1, "Category is required"),
  tags: z
    .array(z.string().max(50))
    .max(MAX_TAGS, `Maximum ${MAX_TAGS} tags allowed`)
    .optional(),
  isPinned: z.boolean().default(false),
  isLocked: z.boolean().default(false),
});

export type ThreadCreate = z.infer<typeof threadCreateSchema>;

// ============================================================================
// Thread Update Schema
// ============================================================================

export const threadUpdateSchema = z.object({
  id: z.string().min(1, "Thread ID is required"),
  title: z
    .string()
    .min(TITLE_MIN_LENGTH)
    .max(TITLE_MAX_LENGTH)
    .trim()
    .optional(),
  content: z
    .string()
    .min(CONTENT_MIN_LENGTH)
    .max(CONTENT_MAX_LENGTH)
    .optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(MAX_TAGS).optional(),
});

export type ThreadUpdate = z.infer<typeof threadUpdateSchema>;

// ============================================================================
// Post/Reply Creation Schema
// ============================================================================

export const postCreateSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(CONTENT_MAX_LENGTH, `Content must be at most ${CONTENT_MAX_LENGTH} characters`),
  parentId: z.string().optional(), // For nested replies
  quotedPostId: z.string().optional(),
});

export type PostCreate = z.infer<typeof postCreateSchema>;

// ============================================================================
// Post Update Schema
// ============================================================================

export const postUpdateSchema = z.object({
  id: z.string().min(1, "Post ID is required"),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(CONTENT_MAX_LENGTH),
});

export type PostUpdate = z.infer<typeof postUpdateSchema>;

// ============================================================================
// Category Schema
// ============================================================================

export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(CATEGORY_NAME_MAX_LENGTH),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPrivate: z.boolean().default(false),
});

export type CategoryCreate = z.infer<typeof categoryCreateSchema>;

// ============================================================================
// Thread Search Schema
// ============================================================================

export const threadSearchSchema = z.object({
  query: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["open", "closed", "pinned", "all"]).optional(),
  sortBy: z.enum(["newest", "oldest", "most_replies", "most_views", "last_activity"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type ThreadSearch = z.infer<typeof threadSearchSchema>;

// ============================================================================
// Thread Moderation Schema
// ============================================================================

export const threadModerationSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  action: z.enum([
    "pin",
    "unpin",
    "lock",
    "unlock",
    "move",
    "delete",
    "merge",
    "split",
  ]),
  targetCategoryId: z.string().optional(), // For move action
  targetThreadId: z.string().optional(), // For merge action
  reason: z.string().max(500).optional(),
});

export type ThreadModeration = z.infer<typeof threadModerationSchema>;

// ============================================================================
// Post Report Schema
// ============================================================================

export const postReportSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  reason: z.enum([
    "spam",
    "harassment",
    "inappropriate",
    "off_topic",
    "misinformation",
    "other",
  ]),
  description: z.string().max(1000).optional(),
});

export type PostReport = z.infer<typeof postReportSchema>;

// ============================================================================
// User Mention Schema
// ============================================================================

export const mentionSchema = z.object({
  username: z.string().min(1).max(30),
  userId: z.string().min(1),
});

export type Mention = z.infer<typeof mentionSchema>;

// ============================================================================
// Poll Schema
// ============================================================================

export const pollCreateSchema = z.object({
  question: z.string().min(5).max(200),
  options: z
    .array(z.string().min(1).max(100))
    .min(2, "At least 2 options required")
    .max(10, "Maximum 10 options allowed"),
  allowMultiple: z.boolean().default(false),
  endsAt: z.string().datetime().optional(),
});

export type PollCreate = z.infer<typeof pollCreateSchema>;

export const pollVoteSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
  optionIds: z.array(z.string()).min(1, "Select at least one option"),
});

export type PollVote = z.infer<typeof pollVoteSchema>;

// ============================================================================
// Private Message Schema
// ============================================================================

export const privateMessageSchema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  subject: z.string().min(1).max(200).optional(),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(10000, "Message is too long"),
});

export type PrivateMessage = z.infer<typeof privateMessageSchema>;
