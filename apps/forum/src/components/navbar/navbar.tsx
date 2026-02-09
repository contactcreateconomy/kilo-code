'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, X, User, Settings, FileText, LogOut, Moon, Sun } from 'lucide-react';
import { cn } from '@createconomy/ui';
import { Button } from '@createconomy/ui';
import { Input } from '@createconomy/ui';
import { Avatar, AvatarImage, AvatarFallback, Badge, NotificationIcon, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@createconomy/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@createconomy/ui';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications, type NotificationItem } from '@/hooks/use-notifications';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

/**
 * Navbar - Simplified navbar matching reference design
 * Features: Logo, search bar, dark mode toggle, notifications dropdown, user avatar/login
 * Uses real Convex Auth state for authentication
 */
export function Navbar({ onMobileMenuToggle, isMobileMenuOpen }: NavbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <TooltipProvider>
    <nav className="glassmorphism-navbar sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left section: Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuToggle}
                className="lg:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground">
              <span className="text-lg font-bold text-background">C</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">Createconomy</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="relative mx-4 hidden flex-1 max-w-md md:block">
          <div
            className={cn(
              'relative transition-all duration-300',
              isSearchFocused && 'scale-[1.02]'
            )}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search discussions..."
              className="w-full pl-10 bg-secondary focus:bg-card"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right section: Dark mode + Notifications + Avatar/Login */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="transition-transform duration-200 hover:scale-110"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-warning" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isDarkMode ? 'Light mode' : 'Dark mode'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Notifications Dropdown - Only show when authenticated */}
          {isAuthenticated && (
            <NotificationsDropdown />
          )}

          {/* User Avatar Dropdown or Login Button */}
          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <UserMenu user={user} onSignOut={signOut} />
          ) : (
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
    </TooltipProvider>
  );
}

/**
 * Format relative time from epoch ms (e.g. "2m ago", "3h ago", "1d ago")
 */
function formatRelativeTime(epochMs: number): string {
  const seconds = Math.floor((Date.now() - epochMs) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(epochMs).toLocaleDateString();
}

/**
 * NotificationsDropdown - Bell icon with dropdown notification list
 * Uses the useNotifications hook for real-time Convex data.
 * Features: Red badge with count, mark as read, mark all as read, click-to-navigate
 */
function NotificationsDropdown() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(10);

  const getNotificationIconElement = (type: NotificationItem['type']) => (
    <NotificationIcon type={type} size="sm" />
  );

  /**
   * Get the navigation URL for a notification based on its target type.
   */
  const getNotificationUrl = (notification: NotificationItem): string => {
    switch (notification.targetType) {
      case 'thread':
        return `/t/${notification.targetId}`;
      case 'post':
        return `/t/${notification.targetId}`;
      case 'comment':
        return `/t/${notification.targetId}`;
      case 'user':
        return `/u/${notification.targetId}`;
      default:
        return '/account/notifications';
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    const url = getNotificationUrl(notification);
    router.push(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-[400px] overflow-y-auto bg-card border-border"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-[10px] text-primary hover:underline"
                >
                  Mark all read
                </button>
              </>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            <div className="h-8 w-8 mx-auto mb-2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p className="text-sm">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification, index) => (
              <DropdownMenuItem
                key={notification._id}
                className={cn(
                  'flex items-start gap-3 p-3 cursor-pointer transition-all duration-200',
                  !notification.read && 'bg-primary/5',
                  'hover:bg-accent'
                )}
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index * 50}ms both`,
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Avatar or Icon */}
                <div className="shrink-0">
                  {notification.actor?.avatarUrl ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.actor.avatarUrl} alt="" />
                      <AvatarFallback>
                        {getNotificationIconElement(notification.type)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {getNotificationIconElement(notification.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm line-clamp-1',
                    !notification.read && 'font-medium'
                  )}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link href="/account/notifications" className="text-sm text-primary hover:text-primary/80">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * UserMenu - User avatar with dropdown menu using shadcn/ui DropdownMenu
 * Features: Profile, Settings, My Discussions, Logout
 * Uses real user data from Convex Auth
 */
interface UserMenuProps {
  user: {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
    profile?: {
      displayName?: string;
      avatarUrl?: string;
    } | null;
  };
  onSignOut: () => Promise<void>;
}

function UserMenu({ user, onSignOut }: UserMenuProps) {
  // Get user display info from Google profile or fallback
  const displayName = user.name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.image || user.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'default'}`;
  const username = user.profile?.displayName || user.email?.split('@')[0] || 'user';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await onSignOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all duration-200 hover:ring-primary/30">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border-border" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={avatarUrl}
                alt={displayName}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">@{username}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/u/${username}`} className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/u/${username}/discussions`} className="flex items-center gap-2 cursor-pointer">
            <FileText className="h-4 w-4" />
            My Discussions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Navbar;
