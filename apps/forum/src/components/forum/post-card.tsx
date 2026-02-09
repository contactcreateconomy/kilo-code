"use client";

import Link from "next/link";
import { UserBadge } from "@/components/forum/user-badge";
import { formatDistanceToNow } from "@/lib/utils";

interface PostCardProps {
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
  isOriginalPost?: boolean;
  likeCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function PostCard({
  id,
  content,
  author,
  createdAt,
  updatedAt,
  isOriginalPost,
  likeCount = 0,
  isLiked = false,
  onLike,
  onReply,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: PostCardProps) {
  return (
    <article
      id={`post-${id}`}
      className={`bg-card rounded-lg border ${isOriginalPost ? "border-primary/20" : ""}`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Author Sidebar */}
        <div className="md:w-48 p-4 md:border-r bg-muted/30 rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
          <div className="flex md:flex-col items-center md:items-start gap-3">
            <UserBadge
              username={author.username}
              avatar={author.avatar}
              role={author.role}
              size="lg"
              showName={false}
            />
            <div className="flex-1 md:flex-none">
              <Link
                href={`/u/${author.username}`}
                className="font-semibold hover:text-primary transition-colors"
              >
                {author.username}
              </Link>
              {author.role && (
                <span
                  className={`ml-2 md:ml-0 md:block text-xs px-2 py-0.5 rounded-full ${
                    author.role === "admin"
                      ? "bg-destructive/10 text-destructive"
                      : author.role === "moderator"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {author.role}
                </span>
              )}
              <div className="hidden md:block mt-2 text-xs text-muted-foreground space-y-1">
                {author.joinedAt && (
                  <p>Joined {formatDistanceToNow(new Date(author.joinedAt))}</p>
                )}
                {author.postCount !== undefined && (
                  <p>{author.postCount} posts</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-1 p-4">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <time dateTime={new Date(createdAt).toISOString()}>
                {formatDistanceToNow(new Date(createdAt))}
              </time>
              {updatedAt && new Date(updatedAt) > new Date(createdAt) && (
                <span className="text-xs">(edited)</span>
              )}
              {isOriginalPost && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  OP
                </span>
              )}
            </div>
            <Link
              href={`#post-${id}`}
              className="hover:text-foreground"
              title="Link to this post"
            >
              #{id.slice(-6)}
            </Link>
          </div>

          {/* Post Body */}
          <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
            {/* In a real app, this would render markdown */}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={onLike}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isLiked
                    ? "bg-destructive/10 text-destructive"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{likeCount}</span>
              </button>

              {/* Reply Button */}
              <button
                onClick={onReply}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                <span>Reply</span>
              </button>
            </div>

            {/* Edit/Delete Actions */}
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="px-3 py-1.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
