"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@createconomy/ui";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ReplyFormProps {
  threadId: string;
  replyToPostId?: string;
  replyToUsername?: string;
  onSubmit?: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
}

export function ReplyForm({
  threadId,
  replyToPostId,
  replyToUsername,
  onSubmit,
  onCancel,
  placeholder = "Write your reply...",
}: ReplyFormProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [content, setContent] = useState(
    replyToUsername ? `@${replyToUsername} ` : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Please enter a reply");
      return;
    }

    if (content.trim().length < 10) {
      setError("Reply must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit(content);
      } else {
        // Default behavior: placeholder (for development)
        // TODO: Call a Convex mutation to submit the reply
      }
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-card rounded-lg border p-6 text-center">
        <p className="text-muted-foreground mb-4">
          You must be signed in to reply to this thread.
        </p>
        <Button asChild>
          <Link href={`/auth/signin?returnTo=${encodeURIComponent(`/t/${threadId}`)}`}>Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-4">
      {replyToUsername && (
        <div className="mb-2 text-sm text-muted-foreground">
          Replying to <span className="font-medium">@{replyToUsername}</span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-2 text-primary hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2 pb-2 border-b">
        <button
          type="button"
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Bold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Italic"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0v16m-4 0h8" />
          </svg>
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Code"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Quote"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">Markdown supported</span>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full px-3 py-2 bg-background border rounded-md resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
        disabled={isSubmitting}
      />

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-muted-foreground">
          {content.length} characters
        </p>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Posting..." : "Post Reply"}
          </Button>
        </div>
      </div>
    </form>
  );
}
