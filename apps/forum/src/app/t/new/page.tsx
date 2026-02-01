"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label } from "@createconomy/ui";
import type { Metadata } from "next";

// Note: Metadata export doesn't work in client components
// This would need to be in a separate layout or page wrapper

const categories = [
  { slug: "general", name: "General Discussion", icon: "💬" },
  { slug: "product-help", name: "Product Help", icon: "❓" },
  { slug: "creator-tools", name: "Creator Tools", icon: "🛠️" },
  { slug: "feedback", name: "Feedback & Suggestions", icon: "💡" },
  { slug: "showcase", name: "Showcase", icon: "🎨" },
];

export default function NewThreadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get("category") || "";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(preselectedCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title for your thread.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter some content for your thread.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, this would call a Convex mutation
      // const threadId = await createThread({ title, content, category });
      // router.push(`/t/${threadId}`);

      // Simulated success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/c/${category}`);
    } catch {
      setError("Failed to create thread. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>New Thread</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Start a New Discussion
        </h1>
        <p className="text-muted-foreground">
          Share your thoughts, ask questions, or start a conversation with the
          community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2"
            required
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground">
            Choose the most relevant category for your discussion.
          </p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title..."
            maxLength={200}
            required
          />
          <p className="text-sm text-muted-foreground">
            {title.length}/200 characters
          </p>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here... Markdown is supported."
            className="w-full min-h-[300px] rounded-md border bg-background px-3 py-2 resize-y"
            required
          />
          <p className="text-sm text-muted-foreground">
            You can use Markdown for formatting. Be clear and respectful.
          </p>
        </div>

        {/* Guidelines */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="font-medium mb-2">Posting Guidelines</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Search before posting to avoid duplicates</li>
            <li>• Use a clear, descriptive title</li>
            <li>• Be respectful and constructive</li>
            <li>• Include relevant details and context</li>
            <li>• Use code blocks for code snippets</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button type="button" variant="ghost" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Preview
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Thread"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
