'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@createconomy/ui';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFollow } from '@/hooks/use-follow';
import { Loader2, ArrowLeft, UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

/**
 * FollowingCard — Shows a single followed user with follow/unfollow button.
 */
function FollowingCard({ followee }: { followee: { userId: string; username: string; displayName: string; avatarUrl: string | null; followedAt: number } }) {
  const { isFollowing, isToggling, toggle } = useFollow(followee.userId);
  const { user } = useAuth();
  const isOwnProfile = user?.id === followee.userId;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <Link href={`/u/${followee.username}`} className="shrink-0">
        {followee.avatarUrl ? (
          <Image
            src={followee.avatarUrl}
            alt={followee.displayName}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
            {followee.displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/u/${followee.username}`} className="hover:underline">
          <p className="font-medium truncate">{followee.displayName}</p>
          <p className="text-sm text-muted-foreground truncate">@{followee.username}</p>
        </Link>
      </div>
      {!isOwnProfile && user && (
        <Button
          onClick={toggle}
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            <UserCheck className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * FollowingPage - Shows list of users that a user follows
 */
export default function FollowingPage() {
  const params = useParams<{ username: string }>();
  const { profile, isLoading: profileLoading } = useUserProfile(params.username);

  const following = useQuery(
    api.functions.social.getFollowing,
    profile?.userId ? { userId: profile.userId as never, limit: 50 } : "skip"
  );

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <Link href="/" className="text-primary hover:underline">
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back link */}
      <Link
        href={`/u/${params.username}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to @{params.username}
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        Following · {profile.followingCount ?? 0}
      </h1>

      {following === undefined ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : following.following.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Not following anyone yet.
        </p>
      ) : (
        <div className="space-y-2">
          {following.following.map((followee) => (
            <FollowingCard key={followee.userId} followee={followee} />
          ))}
        </div>
      )}
    </div>
  );
}
