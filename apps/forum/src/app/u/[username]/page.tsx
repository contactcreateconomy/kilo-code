'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Skeleton, Button, Spinner } from '@createconomy/ui';
import { useUserProfile, useUserThreads } from '@/hooks/use-user-profile';
import { useFollow } from '@/hooks/use-follow';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { UserPlus, UserCheck, Users, Settings, MessageSquare, FileText } from 'lucide-react';

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

type TabId = 'activity' | 'threads' | 'replies';

/**
 * ThreadItem — Compact thread display for profile tabs.
 */
function ThreadItem({
  thread,
}: {
  thread: {
    id: string;
    title: string;
    slug: string;
    createdAt: number;
    postCount: number;
    viewCount: number;
    upvoteCount: number;
    isPinned: boolean;
    isLocked: boolean;
    category: { name: string; slug: string; icon: string | null } | null;
  };
}) {
  return (
    <Link
      href={`/t/${thread.id}`}
      className="block rounded-lg border p-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        {thread.category && (
          <span className="text-sm shrink-0">
            {thread.category.icon ?? '💬'}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2">
            {thread.isPinned && <span className="text-primary mr-1">📌</span>}
            {thread.isLocked && <span className="text-muted-foreground mr-1">🔒</span>}
            {thread.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {thread.category && (
              <span>{thread.category.name}</span>
            )}
            <span>↑ {thread.upvoteCount}</span>
            <span>{thread.postCount} replies</span>
            <span>{thread.viewCount} views</span>
            <span>
              {new Date(thread.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * ReplyItem — Compact reply display for profile Replies tab.
 */
function ReplyItem({
  reply,
}: {
  reply: {
    id: string;
    content: string;
    createdAt: number;
    threadId: string;
    threadTitle: string;
  };
}) {
  return (
    <Link
      href={`/t/${reply.threadId}`}
      className="block rounded-lg border p-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">
            Replied in <span className="font-medium text-foreground">{reply.threadTitle}</span>
          </p>
          <p className="text-sm line-clamp-2">{reply.content}</p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {new Date(reply.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * UserProfilePage - Public user profile page with functional tabs.
 *
 * Fetches user profile and threads from Convex via hooks.
 * Includes follow/unfollow functionality, follower/following counts,
 * and working tabs for Recent Activity, Threads, and Replies.
 */
export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const { profile, isLoading } = useUserProfile(username);
  const { threads } = useUserThreads(username, 20);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('activity');

  // Fetch replies for the user
  const replies = useQuery(
    api.functions.forum.getUserReplies,
    username ? { username, limit: 20 } : 'skip'
  );

  // Follow hook — pass the profile's userId (or undefined while loading)
  const { isFollowing, isToggling, toggle } = useFollow(
    profile?.userId as string | undefined
  );

  const isOwnProfile = user?.id === profile?.userId;

  const roleColors: Record<string, string> = {
    admin: 'bg-destructive/10 text-destructive',
    moderator: 'bg-primary/10 text-primary',
    customer: 'bg-muted text-muted-foreground',
    seller: 'bg-green-500/10 text-green-600 dark:text-green-400',
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-16">
          <Spinner size="xl" className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This user doesn&apos;t exist or their profile is private.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Back to Forum
        </Link>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'activity', label: 'Recent Activity', icon: <FileText className="h-4 w-4" /> },
    { id: 'threads', label: 'Threads', count: profile.threadCount, icon: <FileText className="h-4 w-4" /> },
    { id: 'replies', label: 'Replies', count: profile.postCount, icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>Users</span>
        <span className="mx-2">/</span>
        <span>@{profile.username}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Sidebar */}
        <aside className="w-full lg:w-80">
          <div className="rounded-lg border bg-card p-6 sticky top-20">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative h-24 w-24 mb-4">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[profile.role] || roleColors['customer']}`}
              >
                {profile.role}
              </span>

              {/* Follow / Edit Profile Button */}
              {isOwnProfile ? (
                <Button asChild variant="outline" size="sm" className="mt-3 w-full max-w-[180px]">
                  <Link href="/account">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              ) : user ? (
                <Button
                  onClick={toggle}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  disabled={isToggling}
                  className="mt-3 w-full max-w-[180px]"
                >
                  {isToggling ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : isFollowing ? (
                    <UserCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              ) : null}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-center text-muted-foreground mb-6">
                {profile.bio}
              </p>
            )}

            {/* Follower / Following Counts */}
            <div className="flex justify-center gap-6 mb-4">
              <Link
                href={`/u/${profile.username}/followers`}
                className="text-center hover:text-primary transition-colors"
              >
                <span className="font-bold text-lg block">
                  {profile.followerCount ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">followers</span>
              </Link>
              <Link
                href={`/u/${profile.username}/following`}
                className="text-center hover:text-primary transition-colors"
              >
                <span className="font-bold text-lg block">
                  {profile.followingCount ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">following</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y">
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.threadCount}</div>
                <div className="text-xs text-muted-foreground">Threads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.postCount}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.reputation}</div>
                <div className="text-xs text-muted-foreground">Reputation</div>
              </div>
            </div>

            {/* Join Date */}
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Joined{' '}
              {new Date(profile.joinedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="border-b mb-6">
            <nav className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'activity' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              {threads.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-2">
                  {threads.map((thread) => (
                    <ThreadItem key={thread.id} thread={thread} />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'threads' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Threads by @{profile.username}
              </h2>
              {threads.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No threads yet
                </div>
              ) : (
                <div className="space-y-2">
                  {threads.map((thread) => (
                    <ThreadItem key={thread.id} thread={thread} />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'replies' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Replies by @{profile.username}
              </h2>
              {replies === undefined ? (
                <ActivitySkeleton />
              ) : replies.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No replies yet
                </div>
              ) : (
                <div className="space-y-2">
                  {replies.map((reply) => (
                    <ReplyItem key={reply.id} reply={reply} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
