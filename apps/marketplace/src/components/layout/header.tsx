"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Navigation } from "./navigation";
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
import { ShoppingCart } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();

  // Mock notifications - in production, fetch from API
  const notifications: Notification[] = [
    {
      id: "1",
      title: "Order Confirmed",
      message: "Your order #12345 has been confirmed",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      type: "success",
    },
    {
      id: "2",
      title: "New Product Available",
      message: "Check out the latest digital templates",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: false,
      type: "info",
    },
  ];

  const handleSearch = (query: string) => {
    // Navigate to search results
    window.location.href = `/products?search=${encodeURIComponent(query)}`;
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);
    // Handle notification click - navigate to relevant page
  };

  const handleMarkAllRead = () => {
    console.log("Mark all as read");
    // Mark all notifications as read
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  return (
    <GlassmorphismNavbar>
      {/* Left Section - Logo */}
      <div className="flex items-center gap-6">
        <Logo
          text="Createconomy"
          href="/"
          iconClassName="bg-gradient-to-br from-primary to-primary/70"
        />
        <Navigation />
      </div>

      {/* Center Section - Search */}
      <div className="hidden flex-1 justify-center px-8 md:flex">
        <AnimatedSearch
          placeholder="Search products..."
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
        <Link href="/cart" className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
            <CartBadge />
          </Button>
        </Link>
        <UserMenu />
      </div>
    </GlassmorphismNavbar>
  );
}

function CartBadge() {
  // In production, this would use the cart hook to get the count
  const count = 0;

  if (count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
      {count > 9 ? "9+" : count}
    </span>
  );
}
