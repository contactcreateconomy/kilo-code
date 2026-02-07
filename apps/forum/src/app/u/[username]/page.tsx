'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ThreadList } from '@/components/forum/thread-list';
import { Skeleton } from '@createconomy/ui';
import { useUserProfile, useUserThreads } from '@/hooks/use-user-profile';
import { Loader2 } from 'lucide-react';

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

/**
 * UserProfilePage - Public user profile page
 *
 * Fetches user profile and threads from Convex via hooks.
 */
export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const { profile, isLoading } = useUserProfile(username);
  const { threads } = useUserThreads(username, 10);

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    moderator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    customer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    seller: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  if (isLoading) {
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
        <p className="text-muted-foreground mb-4">
          This user doesn&apos;t exist or their profile is private.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Back to Forum
        </Link>
      </div>
    );
  }

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
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-center text-muted-foreground mb-6">
                {profile.bio}
              </p>
            )}

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
            <nav className="flex gap-4">
              <button className="px-4 py-2 border-b-2 border-primary font-medium">
                Recent Activity
              </button>
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
                Threads ({profile.threadCount})
              </button>
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
                Replies ({profile.postCount})
              </button>
            </nav>
          </div>

          {/* Activity Feed */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {threads.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <Suspense fallback={<ActivitySkeleton />}>
                <ThreadList limit={10} emptyMessage="No recent activity" />
              </Suspense>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
