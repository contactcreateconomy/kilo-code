'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import type { Id } from '@createconomy/convex';

/**
 * Hook for searching tags (autocomplete).
 */
export function useTagSearch(queryStr: string) {
  const results = useQuery(
    api.functions.tags.searchTags,
    queryStr.length >= 1 ? { queryStr } : 'skip'
  );

  return {
    suggestions: results ?? [],
    isLoading: results === undefined && queryStr.length >= 1,
  };
}

/**
 * Hook for popular tags (sidebar widget).
 */
export function usePopularTags(limit?: number) {
  const tags = useQuery(api.functions.tags.getPopularTags, { limit });

  return {
    tags: tags ?? [],
    isLoading: tags === undefined,
  };
}

/**
 * Hook for getting tags on a specific thread.
 */
export function useThreadTags(threadId: string | undefined) {
  const tags = useQuery(
    api.functions.tags.getThreadTags,
    threadId ? { threadId: threadId as Id<'forumThreads'> } : 'skip'
  );

  return {
    tags: tags ?? [],
    isLoading: tags === undefined,
  };
}

/**
 * Hook for managing tags on a thread (add/remove).
 */
export function useTagMutations() {
  const addTags = useMutation(api.functions.tags.addTagsToThread);
  const removeTag = useMutation(api.functions.tags.removeTagFromThread);

  return {
    addTagsToThread: async (threadId: string, tagNames: string[]) => {
      await addTags({
        threadId: threadId as never,
        tagNames,
      });
    },
    removeTagFromThread: async (threadId: string, tagId: string) => {
      await removeTag({
        threadId: threadId as never,
        tagId: tagId as never,
      });
    },
  };
}
