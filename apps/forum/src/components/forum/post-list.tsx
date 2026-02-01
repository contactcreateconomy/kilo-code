import { PostCard } from "@/components/forum/post-card";

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

interface PostListProps {
  posts: Post[];
  originalPostId?: string;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onReply?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostList({
  posts,
  originalPostId,
  currentUserId,
  onLike,
  onReply,
  onEdit,
  onDelete,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-muted-foreground">No posts yet. Be the first to reply!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          {...post}
          isOriginalPost={post.id === originalPostId || index === 0}
          canEdit={currentUserId === post.author.id}
          canDelete={currentUserId === post.author.id}
          onLike={() => onLike?.(post.id)}
          onReply={() => onReply?.(post.id)}
          onEdit={() => onEdit?.(post.id)}
          onDelete={() => onDelete?.(post.id)}
        />
      ))}
    </div>
  );
}
