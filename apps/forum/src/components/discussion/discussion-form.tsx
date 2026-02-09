'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, X, FileText, Link2, ImageIcon, BarChart } from 'lucide-react';
import { cn, Button, Input, Badge } from '@createconomy/ui';
import { CommunityDropdown } from './community-dropdown';
import { EditorToolbar } from './editor-toolbar';
import { RichTextEditor } from '@/components/editor';
import { TagInput } from '@/components/tags';
import { FlairSelector } from '@/components/flairs';
import { useForum, useCategories } from '@/hooks/use-forum';
import { useTagMutations } from '@/hooks/use-tags';
import type { PostType } from '@/types/forum';

interface DiscussionFormProps {
  className?: string;
}

/**
 * DiscussionForm - Main form for creating a new discussion
 * Includes community selector, title, tags, and rich text editor
 *
 * Submits to Convex via useForum().createThread mutation.
 */
export function DiscussionForm({ className }: DiscussionFormProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createThread } = useForum();
  const { categories } = useCategories();
  const { addTagsToThread } = useTagMutations();
  
  const [community, setCommunity] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [flairId, setFlairId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Phase 3: Post type state
  const [postType, setPostType] = useState<PostType>('text');
  const [linkUrl, setLinkUrl] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('3'); // days
  const [pollMultiSelect, setPollMultiSelect] = useState(false);

  const maxTitleLength = 300;

  // Insert text at cursor position in textarea
  const insertAtCursor = useCallback((before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    const newText = body.substring(0, start) + before + selectedText + after + body.substring(end);
    
    setBody(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [body]);

  // Insert link at cursor
  const insertLink = useCallback((url: string, text: string) => {
    const markdown = `[${text}](${url})`;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = body.substring(0, start) + markdown + body.substring(start);
    setBody(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + markdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [body]);

  // Insert image at cursor
  const insertImage = useCallback((url: string, alt: string) => {
    const markdown = `![${alt}](${url})`;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = body.substring(0, start) + markdown + body.substring(start);
    setBody(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + markdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [body]);

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      community,
      title,
      body,
      tags,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('discussion-draft', JSON.stringify(draft));
    alert('Draft saved!');
  };

  // Find category ID from slug
  const getCategoryIdFromSlug = (slug: string): string | null => {
    const cat = (categories as Array<{ _id: string; slug: string }>).find(
      (c) => c.slug === slug
    );
    return cat?._id ?? null;
  };

  // Submit form — calls Convex createThread mutation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!community) {
      setError('Please select a community.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your discussion.');
      return;
    }

    const categoryId = getCategoryIdFromSlug(community);
    if (!categoryId) {
      setError('Invalid community selected.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build type-specific arguments
      const threadArgs: Record<string, unknown> = {
        title: title.trim(),
        content: body || title.trim(),
        categoryId: categoryId,
        postType,
      };

      if (postType === 'link') {
        threadArgs['linkUrl'] = linkUrl;
      } else if (postType === 'poll') {
        const validOptions = pollOptions
          .map((o) => o.trim())
          .filter((o) => o.length > 0);
        if (validOptions.length < 2) {
          setError('Polls need at least 2 non-empty options.');
          setIsSubmitting(false);
          return;
        }
        threadArgs['pollOptions'] = validOptions;
        threadArgs['pollEndsAt'] =
          Date.now() + parseInt(pollDuration) * 24 * 60 * 60 * 1000;
        threadArgs['pollMultiSelect'] = pollMultiSelect;
      }

      const threadId = await createThread(threadArgs as Parameters<typeof createThread>[0]);

      // Add tags to the thread (after creation since tags are a separate table)
      if (threadId && tags.length > 0) {
        try {
          await addTagsToThread(threadId as string, tags);
        } catch {
          // Non-critical: don't block thread creation if tags fail
          console.warn('Failed to add tags to thread');
        }
      }

      // Clear draft
      localStorage.removeItem('discussion-draft');

      // Navigate to the new thread
      if (threadId) {
        router.push(`/t/${threadId}`);
      } else {
        router.push(`/c/${community}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create discussion. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = community && title.trim();

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold text-primary">Create post</h1>
        <Link 
          href="/account/drafts" 
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Drafts
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Community Selector */}
        <CommunityDropdown value={community} onChange={setCommunity} />

        {/* Post Type Tabs */}
        <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30">
          {([
            { type: 'text' as PostType, label: 'Text', icon: FileText },
            { type: 'link' as PostType, label: 'Link', icon: Link2 },
            { type: 'image' as PostType, label: 'Image', icon: ImageIcon },
            { type: 'poll' as PostType, label: 'Poll', icon: BarChart },
          ]).map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                postType === type
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
              placeholder="Title*"
              className="text-lg py-6 bg-transparent border-border focus:border-primary"
              required
            />
          </div>
          <div className="flex justify-end">
            <span className={cn(
              'text-xs',
              title.length >= maxTitleLength ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {title.length}/{maxTitleLength}
            </span>
          </div>
        </div>

        {/* Tags & Flair */}
        <div className="space-y-3">
          <TagInput value={tags} onChange={setTags} />
          <FlairSelector
            categoryId={getCategoryIdFromSlug(community) ?? undefined}
            value={flairId}
            onChange={setFlairId}
          />
        </div>

        {/* Editor — type-specific */}
        {postType === 'text' && (
          <RichTextEditor
            content={body}
            onChange={(_html, text) => setBody(text)}
            placeholder="Body text (optional)"
            minHeight="200px"
          />
        )}

        {postType === 'link' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL*</label>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="bg-transparent"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add context about this link..."
                className={cn(
                  'w-full min-h-[100px] resize-y rounded-lg border border-border bg-transparent p-4 mt-2',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
                )}
              />
            </div>
          </div>
        )}

        {postType === 'image' && (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Image upload coming soon
              </p>
              <p className="text-xs text-muted-foreground">
                For now, use markdown syntax in a text post: ![alt](url)
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Caption (optional)</label>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add a caption..."
                className={cn(
                  'w-full min-h-[80px] resize-y rounded-lg border border-border bg-transparent p-4 mt-2',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
                )}
              />
            </div>
          </div>
        )}

        {postType === 'poll' && (
          <div className="space-y-4">
            {/* Poll options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Options*</label>
              {pollOptions.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[i] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="bg-transparent"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setPollOptions(
                          pollOptions.filter((_, idx) => idx !== i)
                        )
                      }
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add option
                </Button>
              )}
            </div>

            {/* Poll settings */}
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Duration</label>
                <select
                  value={pollDuration}
                  onChange={(e) => setPollDuration(e.target.value)}
                  className="block rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                >
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input
                  type="checkbox"
                  checked={pollMultiSelect}
                  onChange={(e) => setPollMultiSelect(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Allow multiple selections</span>
              </label>
            </div>

            {/* Poll body */}
            <div>
              <label className="text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add context about this poll..."
                className={cn(
                  'w-full min-h-[80px] resize-y rounded-lg border border-border bg-transparent p-4 mt-2',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
                )}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={saveDraft}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="min-w-[80px]"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default DiscussionForm;
