/**
 * Forum Domain Service
 *
 * Pure business-logic functions for the forum domain.
 * No DB access — all data is received as parameters.
 */

// ---------------------------------------------------------------------------
// Slug generation
// ---------------------------------------------------------------------------

/**
 * Generate a URL-safe slug from a thread title.
 * Appends a timestamp suffix for uniqueness.
 */
export function generateThreadSlug(title: string, now?: number): string {
  const ts = now ?? Date.now();
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100) + `-${ts}`
  );
}

// ---------------------------------------------------------------------------
// Thread input validation
// ---------------------------------------------------------------------------

export function validateThreadTitle(title: string): void {
  if (title.length < 5) {
    throw new Error("Title must be at least 5 characters");
  }
  if (title.length > 200) {
    throw new Error("Title must be less than 200 characters");
  }
}

export function validatePostContent(content: string): void {
  if (content.length < 10) {
    throw new Error("Content must be at least 10 characters");
  }
}

export function validateCommentContent(content: string): void {
  if (content.length < 1) {
    throw new Error("Content is required");
  }
  if (content.length > 2000) {
    throw new Error("Content must be less than 2000 characters");
  }
}

/**
 * Validate type-specific fields for thread creation.
 */
export function validatePostTypeFields(
  postType: string,
  args: {
    content?: string;
    linkUrl?: string;
    images?: Array<{ url: string }>;
    pollOptions?: string[];
  }
): void {
  if (postType === "text") {
    if (!args.content || args.content.length < 10) {
      throw new Error("Content must be at least 10 characters");
    }
  } else if (postType === "link") {
    if (!args.linkUrl) {
      throw new Error("URL is required for link posts");
    }
    try {
      const parsed = new URL(args.linkUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("URL must use http or https protocol");
      }
    } catch {
      throw new Error("Invalid URL");
    }
  } else if (postType === "image") {
    if (!args.images || args.images.length === 0) {
      throw new Error("At least one image is required for image posts");
    }
    if (args.images.length > 20) {
      throw new Error("Maximum 20 images per post");
    }
  } else if (postType === "poll") {
    if (!args.pollOptions || args.pollOptions.length < 2) {
      throw new Error("At least 2 options are required for polls");
    }
    if (args.pollOptions.length > 10) {
      throw new Error("Maximum 10 poll options");
    }
    for (const option of args.pollOptions) {
      if (option.trim().length === 0) {
        throw new Error("Poll options cannot be empty");
      }
    }
  }
}

/**
 * Extract domain from a URL string.
 * Returns null on parse failure.
 */
export function extractLinkDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sorting & scoring
// ---------------------------------------------------------------------------

/**
 * Calculate controversy score for a thread.
 *
 * High engagement + polarized votes = high controversy.
 * Balance is highest (1) when up ~= down, lowest (0) when one dominates.
 * Requires minimum 5 total votes to avoid noise.
 */
export function calculateControversy(thread: {
  upvoteCount?: number;
  downvoteCount?: number;
}): number {
  const up = thread.upvoteCount ?? 0;
  const down = thread.downvoteCount ?? 0;
  const total = up + down;
  if (total < 5) return 0;
  const balance = 1 - Math.abs(up - down) / total;
  return total * balance;
}

/**
 * Score a thread for trending ranking.
 *
 * Combines upvotes, post count, and view count with exponential decay.
 */
export function scoreForTrending(thread: {
  upvoteCount?: number;
  postCount: number;
  viewCount: number;
  createdAt: number;
}): number {
  const upvotes = thread.upvoteCount ?? 0;
  const ageHours = (Date.now() - thread.createdAt) / 3600000;
  return (
    (upvotes * 3 + thread.postCount * 2 + thread.viewCount * 0.1) *
    Math.pow(0.95, ageHours / 24)
  );
}

/**
 * Sort threads by the given sort key (in place).
 * Returns the same array for convenience.
 */
export function sortThreads<
  T extends {
    score?: number;
    upvoteCount?: number;
    downvoteCount?: number;
    postCount: number;
    createdAt: number;
  }
>(threads: T[], sortBy: string): T[] {
  if (sortBy === "top") {
    threads.sort(
      (a, b) =>
        (b.score ?? (b.upvoteCount ?? 0)) -
        (a.score ?? (a.upvoteCount ?? 0))
    );
  } else if (sortBy === "hot") {
    threads.sort((a, b) => {
      const scoreA = (a.score ?? (a.upvoteCount ?? 0)) + a.postCount * 2;
      const scoreB = (b.score ?? (b.upvoteCount ?? 0)) + b.postCount * 2;
      const ageA = (Date.now() - a.createdAt) / 3600000;
      const ageB = (Date.now() - b.createdAt) / 3600000;
      return (
        scoreB * Math.pow(0.95, ageB / 24) -
        scoreA * Math.pow(0.95, ageA / 24)
      );
    });
  } else if (sortBy === "controversial") {
    threads.sort((a, b) => calculateControversy(b) - calculateControversy(a));
  }
  // "new" is already sorted desc by creation time
  return threads;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Format counts like "24.5K", "1.2M". */
export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
