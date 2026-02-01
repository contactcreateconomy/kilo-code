import { ThreadCard } from "@/components/forum/thread-card";

interface Thread {
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

interface ThreadListProps {
  threads: Thread[];
  emptyMessage?: string;
  showCategory?: boolean;
}

export function ThreadList({
  threads,
  emptyMessage = "No threads found",
  showCategory = true,
}: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Separate pinned and regular threads
  const pinnedThreads = threads.filter((t) => t.isPinned);
  const regularThreads = threads.filter((t) => !t.isPinned);

  return (
    <div className="space-y-4">
      {/* Pinned Threads */}
      {pinnedThreads.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            📌 Pinned
          </h2>
          <div className="space-y-3">
            {pinnedThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                {...thread}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Threads */}
      {regularThreads.length > 0 && (
        <div className="space-y-2">
          {pinnedThreads.length > 0 && (
            <h2 className="text-sm font-medium text-muted-foreground px-1 mt-6">
              Recent Threads
            </h2>
          )}
          <div className="space-y-3">
            {regularThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                {...thread}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
