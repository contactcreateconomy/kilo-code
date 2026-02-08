"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageSquare,
  Heart,
  AtSign,
  Users,
  Trophy,
  Pin,
  Lock,
  Shield,
  CheckCheck,
  Filter,
} from "lucide-react";
import { cn } from "@createconomy/ui";
import { Button } from "@createconomy/ui";
import { Badge } from "@createconomy/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@createconomy/ui";
import {
  useNotifications,
  type NotificationItem,
} from "@/hooks/use-notifications";

/**
 * Format relative time from epoch ms
 */
function formatRelativeTime(epochMs: number): string {
  const seconds = Math.floor((Date.now() - epochMs) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(epochMs).toLocaleDateString();
}

/**
 * Group notifications by date: Today, Yesterday, This Week, Older
 */
function groupByDate(
  notifications: NotificationItem[]
): { label: string; items: NotificationItem[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, NotificationItem[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: [],
  };

  for (const notification of notifications) {
    const date = new Date(notification.createdAt);
    if (date >= today) {
      groups["Today"].push(notification);
    } else if (date >= yesterday) {
      groups["Yesterday"].push(notification);
    } else if (date >= weekAgo) {
      groups["This Week"].push(notification);
    } else {
      groups["Older"].push(notification);
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export default function NotificationInboxPage() {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications(50, unreadOnly);

  const groups = groupByDate(notifications);

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "reply":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "upvote":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "mention":
        return <AtSign className="h-4 w-4 text-purple-500" />;
      case "follow":
        return <Users className="h-4 w-4 text-green-500" />;
      case "campaign":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "thread_pin":
        return <Pin className="h-4 w-4 text-orange-500" />;
      case "thread_lock":
        return <Lock className="h-4 w-4 text-orange-500" />;
      case "mod_action":
        return <Shield className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationUrl = (notification: NotificationItem): string => {
    switch (notification.targetType) {
      case "thread":
        return `/t/${notification.targetId}`;
      case "post":
        return `/t/${notification.targetId}`;
      case "comment":
        return `/t/${notification.targetId}`;
      case "user":
        return `/u/${notification.targetId}`;
      default:
        return "#";
    }
  };

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    router.push(getNotificationUrl(notification));
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <Button
            variant={unreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {unreadOnly ? "Unread" : "All"}
          </Button>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">
            {unreadOnly ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-sm mt-1">
            {unreadOnly
              ? "You're all caught up!"
              : "When someone replies, upvotes, or mentions you, it'll show up here."}
          </p>
          {unreadOnly && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setUnreadOnly(false)}
            >
              Show all notifications
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                {group.label}
              </h2>
              <div className="space-y-1 rounded-lg border bg-card overflow-hidden">
                {group.items.map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => handleClick(notification)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 text-left transition-colors border-b last:border-b-0",
                      !notification.read
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-accent"
                    )}
                  >
                    {/* Avatar or Icon */}
                    <div className="shrink-0 mt-0.5">
                      {notification.actor?.avatarUrl ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={notification.actor.avatarUrl}
                            alt=""
                          />
                          <AvatarFallback>
                            {getNotificationIcon(notification.type)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-sm",
                            !notification.read && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] shrink-0"
                        >
                          {notification.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="shrink-0 mt-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Scroll down or visit{" "}
                <Link
                  href="/account/notifications"
                  className="text-primary hover:underline"
                >
                  settings
                </Link>{" "}
                to manage preferences.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Settings Link */}
      <div className="mt-8 text-center">
        <Link
          href="/account/notifications"
          className="text-sm text-primary hover:underline"
        >
          Manage notification settings →
        </Link>
      </div>
    </div>
  );
}
