"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";

interface PostData {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  isPublished: boolean;
  publishedAt?: number;
  viewCount: number;
  createdAt: number;
}

export default function PostsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postsResult = useQuery(api.functions.sellerPosts.getMyPosts, {});
  const createPost = useMutation(api.functions.sellerPosts.createPost);
  const deletePost = useMutation(api.functions.sellerPosts.deletePost);
  const updatePost = useMutation(api.functions.sellerPosts.updatePost);

  const posts = (postsResult?.items ?? []) as PostData[];
  const publishedCount = posts.filter((p) => p.isPublished).length;
  const draftCount = posts.filter((p) => !p.isPublished).length;

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost({
        title: title.trim(),
        slug: slug || generateSlug(title),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        isPublished: false,
      });
      setTitle("");
      setSlug("");
      setContent("");
      setExcerpt("");
      setShowCreateForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost({ postId: postId as Id<"sellerPosts"> });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete");
    }
  }

  async function handleTogglePublish(post: PostData) {
    try {
      await updatePost({
        postId: post._id as Id<"sellerPosts">,
        isPublished: !post.isPublished,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-[var(--muted-foreground)]">
            Write blog posts and updates for your followers
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
        >
          {showCreateForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Total Posts</p>
          <p className="text-3xl font-bold mt-1">{posts.length}</p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Published</p>
          <p className="text-3xl font-bold mt-1">{publishedCount}</p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Drafts</p>
          <p className="text-3xl font-bold mt-1">{draftCount}</p>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="seller-card space-y-4">
          <h2 className="text-lg font-semibold">Create New Post</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) setSlug(generateSlug(e.target.value));
              }}
              placeholder="Post title"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Excerpt (optional)</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={10}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Save as Draft"}
          </button>
        </form>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="seller-card text-center py-12">
            <p className="text-[var(--muted-foreground)]">
              No posts yet. Create your first post to engage with your audience!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="seller-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        post.isPublished
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {post.viewCount} views · Created{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                    {post.publishedAt && ` · Published ${new Date(post.publishedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    {post.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
