'use client';

import { useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';
import { api } from '@createconomy/convex';
import {
  forumThreadQueryArgs,
  toForumTagId,
  toForumThreadId,
} from './forum-id-helpers';
import type { QueryEnvelope, MutationEnvelope } from '@createconomy/ui/types/envelope';

type TagSearchData = FunctionReturnType<typeof api.functions.tags.searchTags>;
type PopularTagsData = FunctionReturnType<typeof api.functions.tags.getPopularTags>;
type ThreadTagsData = FunctionReturnType<typeof api.functions.tags.getThreadTags>;

type UseTagSearchResult = QueryEnvelope<TagSearchData> & {
  suggestions: TagSearchData;
};

type UsePopularTagsResult = QueryEnvelope<PopularTagsData> & {
  tags: PopularTagsData;
};

type UseThreadTagsResult = QueryEnvelope<ThreadTagsData> & {
  tags: ThreadTagsData;
};

type TagMutationActions = {
  addTagsToThread: (threadId: string, tagNames: string[]) => Promise<void>;
  removeTagFromThread: (threadId: string, tagId: string) => Promise<void>;
};

type UseTagMutationsResult = MutationEnvelope<TagMutationActions> & TagMutationActions;

/**
 * Hook for searching tags (autocomplete).
 */
export function useTagSearch(queryStr: string): UseTagSearchResult {
  const results = useQuery(
    api.functions.tags.searchTags,
    queryStr.length >= 1 ? { queryStr } : 'skip'
  );
  const data = results ?? [];

  return {
    suggestions: data,
    data,
    isLoading: results === undefined && queryStr.length >= 1,
    error: null,
  };
}

/**
 * Hook for popular tags (sidebar widget).
 */
export function usePopularTags(limit?: number): UsePopularTagsResult {
  const tags = useQuery(api.functions.tags.getPopularTags, { limit });
  const data = tags ?? [];

  return {
    tags: data,
    data,
    isLoading: tags === undefined,
    error: null,
  };
}

/**
 * Hook for getting tags on a specific thread.
 */
export function useThreadTags(threadId: string | undefined): UseThreadTagsResult {
  const tags = useQuery(api.functions.tags.getThreadTags, forumThreadQueryArgs(threadId));
  const data = tags ?? [];

  return {
    tags: data,
    data,
    isLoading: !!threadId && tags === undefined,
    error: null,
  };
}

/**
 * Hook for managing tags on a thread (add/remove).
 */
export function useTagMutations(): UseTagMutationsResult {
  const addTags = useMutation(api.functions.tags.addTagsToThread);
  const removeTag = useMutation(api.functions.tags.removeTagFromThread);

  const addTagsToThread = useCallback(async (threadId: string, tagNames: string[]) => {
    await addTags({
      threadId: toForumThreadId(threadId),
      tagNames,
    });
  }, [addTags]);

  const removeTagFromThread = useCallback(async (threadId: string, tagId: string) => {
    await removeTag({
      threadId: toForumThreadId(threadId),
      tagId: toForumTagId(tagId),
    });
  }, [removeTag]);

  const data: TagMutationActions = {
    addTagsToThread,
    removeTagFromThread,
  };

  return {
    ...data,
    data,
    isLoading: false,
    error: null,
  };
}
