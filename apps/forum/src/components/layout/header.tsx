"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { UserMenu } from "@/components/auth/user-menu";
import {
  Button,
  GlassmorphismNavbar,
  Logo,
  AnimatedSearch,
  ThemeToggle,
  NotificationsDropdown,
  type Notification,
} from "@createconomy/ui";
import { MessageSquarePlus } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/c" },
  { name: "Search", href: "/search" },
];

export function Header() {
  const { theme, setTheme } = useTheme();

  // Mock notifications - in production, fetch from API
  const notifications: Notification[] = [
    {
      id: "1",
      title: "New Reply",
      message: "Someone replied to your thread",
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      read: false,
      type: "info",
    },
    {
      id: "2",
      title: "Thread Mentioned",
      message: "You were mentioned in a discussion",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: true,
      type: "info",
    },
  ];

  const handleSearch = (query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);
  };

  const handleMarkAllRead = () => {
    console.log("Mark all as read");
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  return (
    <>
      <GlassmorphismNavbar>
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center gap-6">
          <Logo
            text="Forum"
            href="/"
            icon="💬"
            showIcon={false}
            iconClassName="bg-gradient-to-br from-blue-500 to-purple-600"
          />
          
          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="hidden flex-1 justify-center px-8 lg:flex">
          <AnimatedSearch
            placeholder="Search forum..."
            onSearch={handleSearch}
            className="max-w-md"
          />
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle
            theme={(theme as "light" | "dark") || "light"}
            onThemeChange={handleThemeChange}
          />
          <NotificationsDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />
          
          {/* New Thread Button */}
          <Button asChild size="sm" className="hidden sm:inline-flex gap-2">
            <Link href="/t/new">
              <MessageSquarePlus className="h-4 w-4" />
              New Thread
            </Link>
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </GlassmorphismNavbar>

      {/* Back to Main Site Banner */}
      <div className="sticky top-16 z-40 border-b bg-muted/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-8 items-center justify-between text-xs">
            <Link
              href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://createconomy.com"}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              ← Back to Createconomy
            </Link>
            <span className="text-muted-foreground hidden sm:inline">
              Community Discussion Forum
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
