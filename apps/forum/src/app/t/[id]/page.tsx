import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/forum/post-list";
import { ReplyForm } from "@/components/forum/reply-form";
import { UserBadge } from "@/components/forum/user-badge";
import { Sidebar } from "@/components/layout/sidebar";
import { Button, Skeleton } from "@createconomy/ui";
import type { Metadata } from "next";

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    role?: string;
    joinedAt?: Date | string;
    postCount?: number;
  };
  createdAt: Date | string;
  updatedAt?: Date | string;
  likeCount?: number;
  isLiked?: boolean;
}

// Mock function - in production, this would fetch from Convex
async function getThread(id: string) {
  // Simulated thread data
  const threads: Record<
    string,
    {
      id: string;
      title: string;
      content: string;
      category: { slug: string; name: string };
      author: { id: string; username: string; avatar: string; role: string };
      createdAt: string;
      isPinned: boolean;
      isLocked: boolean;
      viewCount: number;
      replyCount: number;
    }
  > = {
    "1": {
      id: "1",
      title: "Welcome to Createconomy Forum!",
      content: `
# Welcome to our community! 👋

We're excited to have you here. This forum is a place for creators and buyers to connect, share knowledge, and help each other succeed.

## Forum Guidelines

1. **Be respectful** - Treat others as you'd like to be treated
2. **Stay on topic** - Keep discussions relevant to the category
3. **No spam** - Self-promotion should be limited to the Showcase category
4. **Search first** - Check if your question has been answered before posting

## Getting Started

- Browse the [categories](/c) to find topics that interest you
- Introduce yourself in the General Discussion category
- Don't hesitate to ask questions - we're here to help!

Happy creating! 🎨
      `.trim(),
      category: { slug: "announcements", name: "Announcements" },
      author: { id: "admin-1", username: "admin", avatar: "/avatars/admin.png", role: "Admin" },
      createdAt: "2024-01-15T10:00:00Z",
      isPinned: true,
      isLocked: false,
      viewCount: 1234,
      replyCount: 45,
    },
  };

  return threads[id] || null;
}

// Mock function to get posts for a thread
async function getThreadPosts(threadId: string, page: number): Promise<Post[]> {
  // In production, this would fetch from Convex with pagination
  const mockPosts: Record<string, Post[]> = {
    "1": [
      {
        id: "post-1",
        content: "Welcome everyone! Excited to be part of this community. Looking forward to learning and sharing with all of you.",
        author: {
          id: "user-1",
          username: "sarah_creator",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
          role: "Member",
          joinedAt: "2024-01-10T00:00:00Z",
          postCount: 15,
        },
        createdAt: "2024-01-15T12:30:00Z",
        likeCount: 12,
        isLiked: false,
      },
      {
        id: "post-2",
        content: "Great to see such clear guidelines! This will help keep the community positive and productive.",
        author: {
          id: "user-2",
          username: "mike_dev",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
          role: "Member",
          joinedAt: "2024-01-08T00:00:00Z",
          postCount: 28,
        },
        createdAt: "2024-01-15T14:45:00Z",
        likeCount: 8,
        isLiked: true,
      },
      {
        id: "post-3",
        content: "Thanks for the warm welcome! I have a question - where's the best place to share my first digital product for feedback?",
        author: {
          id: "user-3",
          username: "emma_design",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
          role: "Member",
          joinedAt: "2024-01-14T00:00:00Z",
          postCount: 3,
        },
        createdAt: "2024-01-16T09:15:00Z",
        likeCount: 5,
        isLiked: false,
      },
    ],
  };

  return mockPosts[threadId] || [];
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const thread = await getThread(id);

  if (!thread) {
    return {
      title: "Thread Not Found",
    };
  }

  return {
    title: thread.title,
    description: thread.content.substring(0, 160),
    openGraph: {
      title: `${thread.title} | Createconomy Forum`,
      description: thread.content.substring(0, 160),
      type: "article",
      authors: [thread.author.username],
    },
  };
}

function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ThreadPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page = "1" } = await searchParams;
  const thread = await getThread(id);

  if (!thread) {
    notFound();
  }

  const currentPage = parseInt(page, 10);
  const posts = await getThreadPosts(id, currentPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/c/${thread.category.slug}`}
          className="hover:text-foreground"
        >
          {thread.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="truncate max-w-[200px] inline-block align-bottom">
          {thread.title}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Thread Header */}
          <article className="mb-8">
            <div className="flex items-start gap-2 mb-2">
              {thread.isPinned && (
                <span className="text-primary" title="Pinned">
                  📌
                </span>
              )}
              {thread.isLocked && (
                <span className="text-muted-foreground" title="Locked">
                  🔒
                </span>
              )}
              <h1 className="text-3xl font-bold tracking-tight">
                {thread.title}
              </h1>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <UserBadge
                username={thread.author.username}
                avatar={thread.author.avatar}
                role={thread.author.role}
              />
              <span>•</span>
              <time dateTime={thread.createdAt}>
                {new Date(thread.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>•</span>
              <span>{thread.viewCount} views</span>
              <span>•</span>
              <span>{thread.replyCount} replies</span>
            </div>

            {/* Thread Content */}
            <div className="rounded-lg border bg-card p-6">
              <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                {/* In production, this would be rendered markdown */}
                <div className="whitespace-pre-wrap">{thread.content}</div>
              </div>
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    👍 Like
                  </Button>
                  <Button variant="ghost" size="sm">
                    🔗 Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    🚩 Report
                  </Button>
                </div>
              </div>
            </div>
          </article>

          {/* Replies Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Replies ({thread.replyCount})
            </h2>

            <Suspense fallback={<PostListSkeleton />}>
              <PostList posts={posts} originalPostId={thread.id} />
            </Suspense>

            {/* Pagination */}
            {thread.replyCount > 10 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  asChild={currentPage > 1}
                >
                  {currentPage > 1 ? (
                    <Link href={`/t/${id}?page=${currentPage - 1}`}>
                      Previous
                    </Link>
                  ) : (
                    "Previous"
                  )}
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {currentPage}
                </span>
                <Button variant="outline" asChild>
                  <Link href={`/t/${id}?page=${currentPage + 1}`}>Next</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Reply Form */}
          {!thread.isLocked ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Post a Reply</h2>
              <ReplyForm threadId={id} />
            </section>
          ) : (
            <div className="mt-8 rounded-lg border bg-muted/50 p-6 text-center">
              <span className="text-2xl mb-2 block">🔒</span>
              <p className="text-muted-foreground">
                This thread is locked. No new replies can be posted.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80">
          <Sidebar currentCategory={thread.category.slug} />
        </aside>
      </div>
    </div>
  );
}
