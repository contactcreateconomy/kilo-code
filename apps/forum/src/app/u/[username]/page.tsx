import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ThreadList } from "@/components/forum/thread-list";
import { Skeleton } from "@createconomy/ui";
import type { Metadata } from "next";

// Mock function - in production, this would fetch from Convex
async function getUser(username: string) {
  const users: Record<
    string,
    {
      username: string;
      displayName: string;
      avatar: string;
      bio: string;
      role: string;
      joinedAt: string;
      threadCount: number;
      postCount: number;
      reputation: number;
    }
  > = {
    admin: {
      username: "admin",
      displayName: "Admin",
      avatar: "/avatars/admin.png",
      bio: "Createconomy team member. Here to help!",
      role: "Admin",
      joinedAt: "2024-01-01T00:00:00Z",
      threadCount: 15,
      postCount: 234,
      reputation: 1500,
    },
    johndoe: {
      username: "johndoe",
      displayName: "John Doe",
      avatar: "/avatars/johndoe.png",
      bio: "Digital creator and marketplace enthusiast.",
      role: "Member",
      joinedAt: "2024-02-15T00:00:00Z",
      threadCount: 8,
      postCount: 45,
      reputation: 320,
    },
  };

  return users[username] || null;
}

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.displayName} (@${user.username})`,
    description: user.bio || `View ${user.displayName}'s profile on Createconomy Forum`,
    openGraph: {
      title: `${user.displayName} (@${user.username}) | Createconomy Forum`,
      description: user.bio || `View ${user.displayName}'s profile on Createconomy Forum`,
    },
  };
}

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

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    notFound();
  }

  const roleColors: Record<string, string> = {
    Admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Moderator: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Member: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

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
        <span>@{user.username}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Sidebar */}
        <aside className="w-full lg:w-80">
          <div className="rounded-lg border bg-card p-6 sticky top-20">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative h-24 w-24 mb-4">
                <Image
                  src={user.avatar || "/avatars/default.png"}
                  alt={user.displayName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role] || roleColors.Member}`}
              >
                {user.role}
              </span>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-center text-muted-foreground mb-6">
                {user.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y">
              <div className="text-center">
                <div className="text-2xl font-bold">{user.threadCount}</div>
                <div className="text-xs text-muted-foreground">Threads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.postCount}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.reputation}</div>
                <div className="text-xs text-muted-foreground">Reputation</div>
              </div>
            </div>

            {/* Join Date */}
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Joined{" "}
              {new Date(user.joinedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
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
                Threads
              </button>
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
                Replies
              </button>
            </nav>
          </div>

          {/* Activity Feed */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Suspense fallback={<ActivitySkeleton />}>
              <ThreadList authorUsername={username} limit={10} />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}
