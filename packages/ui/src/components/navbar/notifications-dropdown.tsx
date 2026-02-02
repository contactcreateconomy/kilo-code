"use client"

import * as React from "react"
import { Bell, Check, MessageSquare, Package, AlertCircle, Info } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../popover"
import { ScrollArea } from "../scroll-area"
import { Separator } from "../separator"

export interface Notification {
  id: string
  message: string
  time: string
  unread: boolean
  type?: "order" | "message" | "alert" | "info"
}

interface NotificationsDropdownProps {
  /** List of notifications */
  notifications?: Notification[]
  /** Callback when a notification is clicked */
  onNotificationClick?: (notification: Notification) => void
  /** Callback when mark all as read is clicked */
  onMarkAllAsRead?: () => void
  /** Callback when view all is clicked */
  onViewAll?: () => void
  /** Additional CSS classes */
  className?: string
}

const notificationIcons = {
  order: Package,
  message: MessageSquare,
  alert: AlertCircle,
  info: Info,
}

/**
 * NotificationsDropdown - Bell icon with badge count and dropdown
 * 
 * Features:
 * - Bell icon with red badge (number count)
 * - Smooth slide-down animation on click
 * - Reference: ruixen.ui notifications-1 style
 * - Max height with scroll for many notifications
 * 
 * @example
 * ```tsx
 * <NotificationsDropdown 
 *   notifications={[
 *     { id: "1", message: "New order received", time: "5 min ago", unread: true, type: "order" }
 *   ]}
 *   onNotificationClick={(n) => console.log(n)}
 * />
 * ```
 */
export function NotificationsDropdown({
  notifications = [],
  onNotificationClick,
  onMarkAllAsRead,
  onViewAll,
  className,
}: NotificationsDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const unreadCount = notifications.filter((n) => n.unread).length

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative flex items-center justify-center",
            "w-10 h-10 rounded-full",
            "bg-transparent hover:bg-muted/50",
            "transition-all duration-300",
            "glow-hover",
            className
          )}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          
          {/* Badge */}
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5",
                "flex items-center justify-center",
                "min-w-[18px] h-[18px] px-1",
                "rounded-full",
                "bg-destructive text-destructive-foreground",
                "text-[10px] font-semibold",
                "animate-scale-in"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className={cn(
          "w-80 p-0",
          "animate-slide-in-top"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type || "info"]
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 text-left",
                      "hover:bg-muted/50 transition-colors",
                      notification.unread && "bg-primary/5"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex items-center justify-center shrink-0",
                        "w-8 h-8 rounded-full",
                        "bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm",
                          notification.unread ? "font-medium" : "text-muted-foreground"
                        )}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.time}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {notification.unread && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && onViewAll && (
          <>
            <Separator />
            <div className="p-2">
              <button
                onClick={onViewAll}
                className={cn(
                  "w-full py-2 px-3 rounded-md",
                  "text-sm text-center",
                  "text-primary hover:bg-muted/50",
                  "transition-colors"
                )}
              >
                View all notifications
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export type { NotificationsDropdownProps }
