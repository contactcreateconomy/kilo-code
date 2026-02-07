'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { cn, Button, Input, Badge } from '@createconomy/ui';
import { CommunityDropdown } from './community-dropdown';
import { EditorToolbar } from './editor-toolbar';
import { useForum, useCategories } from '@/hooks/use-forum';

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
  
  const [community, setCommunity] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maxTitleLength = 300;
  const maxTags = 5;

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

  // Add tag
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setTagInput('');
    }
  };

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
      const threadId = await createThread({
        title: title.trim(),
        content: body || title.trim(),
        categoryId,
      });

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

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pl-2 pr-1 py-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {showTagInput ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => {
                    if (tagInput.trim()) addTag();
                    setShowTagInput(false);
                  }}
                  placeholder="Add tag..."
                  className="h-7 w-32 text-sm"
                  autoFocus
                />
              </div>
            ) : (
              tags.length < maxTags && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTagInput(true)}
                  className="h-7 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add tags
                </Button>
              )
            )}
          </div>
          {tags.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {tags.length}/{maxTags} tags
            </p>
          )}
        </div>

        {/* Editor */}
        <div>
          <EditorToolbar
            onInsertText={insertAtCursor}
            onInsertLink={insertLink}
            onInsertImage={insertImage}
          />
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Body text (optional)"
            className={cn(
              'w-full min-h-[200px] resize-y rounded-b-lg border border-border bg-transparent p-4',
              'text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
            )}
          />
        </div>

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
