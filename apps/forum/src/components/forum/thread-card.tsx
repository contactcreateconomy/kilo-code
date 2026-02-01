import Link from "next/link";
import { UserBadge } from "@/components/forum/user-badge";
import { formatDistanceToNow } from "@/lib/utils";

interface ThreadCardProps {
  id: string;
  title: string;
  excerpt?: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    role?: string;
  };
  category: {
    name: string;
    slug: string;
    icon?: string;
  };
  createdAt: Date | string;
  replyCount: number;
  viewCount: number;
  lastReply?: {
    author: {
      username: string;
      avatar?: string;
    };
    createdAt: Date | string;
  };
  isPinned?: boolean;
  isLocked?: boolean;
  isHot?: boolean;
  tags?: string[];
}

export function ThreadCard({
  id,
  title,
  excerpt,
  author,
  category,
  createdAt,
  replyCount,
  viewCount,
  lastReply,
  isPinned,
  isLocked,
  isHot,
  tags,
}: ThreadCardProps) {
  return (
    <article className="group relative bg-card rounded-lg border p-4 hover:border-primary/50 transition-colors">
      {/* Status Indicators */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {isPinned && (
          <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full">
            📌 Pinned
          </span>
        )}
        {isLocked && (
          <span className="text-xs bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full">
            🔒 Locked
          </span>
        )}
        {isHot && (
          <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">
            🔥 Hot
          </span>
        )}
      </div>

      <div className="flex gap-4">
        {/* Author Avatar */}
        <div className="hidden sm:block shrink-0">
          <UserBadge
            username={author.username}
            avatar={author.avatar}
            role={author.role}
            showName={false}
            size="md"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category */}
          <Link
            href={`/c/${category.slug}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            {category.icon && <span>{category.icon}</span>}
            <span>{category.name}</span>
          </Link>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-1 pr-24">
            <Link
              href={`/t/${id}`}
              className="hover:text-primary transition-colors line-clamp-2"
            >
              {title}
            </Link>
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {excerpt}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.slice(0, 4).map((tag) => (
                <Link
                  key={tag}
                  href={`/search?tag=${tag}`}
                  className="text-xs bg-accent px-2 py-0.5 rounded hover:bg-accent/80"
                >
                  #{tag}
                </Link>
              ))}
              {tags.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {/* Author */}
            <span className="flex items-center gap-1">
              <span className="sm:hidden">
                <UserBadge
                  username={author.username}
                  avatar={author.avatar}
                  showName={false}
                  size="xs"
                />
              </span>
              <Link
                href={`/u/${author.username}`}
                className="hover:text-foreground"
              >
                {author.username}
              </Link>
              <span>•</span>
              <time dateTime={new Date(createdAt).toISOString()}>
                {formatDistanceToNow(new Date(createdAt))}
              </time>
            </span>

            {/* Stats */}
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {replyCount}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {viewCount}
              </span>
            </span>

            {/* Last Reply */}
            {lastReply && (
              <span className="hidden md:flex items-center gap-1">
                <span>Last reply by</span>
                <Link
                  href={`/u/${lastReply.author.username}`}
                  className="hover:text-foreground"
                >
                  {lastReply.author.username}
                </Link>
                <span>•</span>
                <time dateTime={new Date(lastReply.createdAt).toISOString()}>
                  {formatDistanceToNow(new Date(lastReply.createdAt))}
                </time>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
