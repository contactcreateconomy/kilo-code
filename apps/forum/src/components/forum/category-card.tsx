import Link from "next/link";

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  threadCount: number;
  postCount: number;
  icon?: string;
  color?: string;
  lastThread?: {
    id: string;
    title: string;
    author: {
      username: string;
    };
    createdAt: Date | string;
  };
}

const colorClasses: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  green: "bg-green-500/10 text-green-600 border-green-500/20",
  yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  red: "bg-red-500/10 text-red-600 border-red-500/20",
  purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  pink: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  gray: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function CategoryCard({
  id,
  name,
  slug,
  description,
  threadCount,
  postCount,
  icon = "📁",
  color = "gray",
  lastThread,
}: CategoryCardProps) {
  return (
    <Link
      href={`/c/${slug}`}
      className="block bg-card rounded-lg border p-4 hover:border-primary/50 transition-colors group"
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 border ${colorClasses[color] || colorClasses['gray']}`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              {threadCount} threads
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {postCount} posts
            </span>
          </div>
        </div>

        {/* Last Thread */}
        {lastThread && (
          <div className="hidden lg:block w-48 text-right">
            <p className="text-sm font-medium truncate">{lastThread.title}</p>
            <p className="text-xs text-muted-foreground">
              by {lastThread.author.username}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
