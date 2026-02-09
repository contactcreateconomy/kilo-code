'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { Button, Input, Spinner, Label } from '@createconomy/ui';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, Save } from 'lucide-react';
import type { Id } from '@createconomy/convex/dataModel';

/**
 * EditThreadPage — Allows thread authors (or moderators) to edit a thread title
 * and the first post's content.
 *
 * Uses:
 * - `getThread` query to fetch thread data with posts
 * - `updateThread` mutation to update the title
 * - `updatePost` mutation to update the first post content
 */
export default function EditThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const thread = useQuery(
    api.functions.forum.getThread,
    params.id ? { threadId: params.id as Id<"forumThreads"> } : 'skip'
  );

  const updateThread = useMutation(api.functions.forum.updateThread);
  const updatePost = useMutation(api.functions.forum.updatePost);

  const [title, setTitle] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form values from thread data
  if (thread && title === null) {
    setTitle(thread.title);
  }
  if (thread && content === null) {
    const firstPost = thread.posts?.find((p) => p.isFirstPost);
    if (firstPost) {
      setContent(firstPost.content);
    }
  }

  if (thread === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-16">
          <Spinner size="xl" className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Thread Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This thread doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Back to Forum
        </Link>
      </div>
    );
  }

  // Check authorization
  const isAuthor = user?.id === thread.authorId;
  if (!isAuthor && user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Not Authorized</h1>
        <p className="text-muted-foreground mb-4">
          Only the thread author can edit this thread.
        </p>
        <Link href={`/t/${params.id}`} className="text-primary hover:underline">
          Back to Thread
        </Link>
      </div>
    );
  }

  const firstPost = thread.posts?.find((p) => p.isFirstPost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Update thread title if changed
      if (title && title !== thread.title) {
        await updateThread({
          threadId: params.id as Id<"forumThreads">,
          title,
        });
      }

      // Update first post content if changed
      if (firstPost && content && content !== firstPost.content) {
        await updatePost({
          postId: firstPost._id,
          content,
        });
      }

      router.push(`/t/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update thread');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/t/${params.id}`} className="hover:text-foreground">
          {thread.title}
        </Link>
        <span className="mx-2">/</span>
        <span>Edit</span>
      </nav>

      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/t/${params.id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Thread</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Thread Title</Label>
            <Input
              id="title"
              value={title ?? ''}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thread title..."
              minLength={5}
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground">
              {(title ?? '').length}/200 characters (minimum 5)
            </p>
          </div>

          {/* Content */}
          {firstPost && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={content ?? ''}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Thread content..."
                minLength={10}
                required
                rows={12}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {(content ?? '').length} characters (minimum 10)
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/t/${params.id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
