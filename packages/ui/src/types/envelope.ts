/**
 * Standardized query result envelope.
 * Wraps Convex query results with loading/error state.
 *
 * Use for hooks that return reactive data where `isLoading`
 * can transition between `true` and `false`.
 */
export type QueryEnvelope<TData> = {
  data: TData;
  isLoading: boolean;
  error: null;
};

/**
 * Standardized mutation result envelope.
 * Wraps mutation functions with consistent shape.
 *
 * `isLoading` is always `false` because mutations are
 * imperative actions — they do not have a loading state
 * on mount.
 */
export type MutationEnvelope<TData> = {
  data: TData;
  isLoading: false;
  error: null;
};
