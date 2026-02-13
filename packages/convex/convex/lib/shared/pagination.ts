/**
 * Shared Pagination Utilities
 *
 * Cursor-based pagination helpers used across domain function files.
 * Replaces ~6 inline "take limit+1, check hasMore" patterns.
 */

/**
 * Result of a cursor-paginated query.
 */
export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Apply cursor-based pagination to a pre-fetched array.
 *
 * The caller fetches `limit + 1` items from the DB. This function
 * splits the result into a page of `limit` items and a `hasMore` flag.
 *
 * @param items - Array fetched with `take(limit + 1)`
 * @param limit - The desired page size
 * @param getCursor - Extracts a cursor string from the last item (defaults to `_id`)
 */
export function paginateWithCursor<T extends { _id: string }>(
  items: T[],
  limit: number,
  getCursor?: (item: T) => string
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  const lastItem = page[page.length - 1];
  const nextCursor = hasMore && lastItem
    ? (getCursor ? getCursor(lastItem) : lastItem._id)
    : null;

  return { items: page, hasMore, nextCursor };
}
