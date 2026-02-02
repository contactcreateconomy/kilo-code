"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Button,
  GlassmorphismNavbar,
  AnimatedSearch,
  ThemeToggle,
  NotificationsDropdown,
  ProfileDropdown,
  type Notification,
  type UserProfile,
  type MenuItem,
} from "@createconomy/ui";
import { Plus, Settings, LogOut, User, HelpCircle, ExternalLink } from "lucide-react";

export function SellerHeader() {
  const { theme, setTheme } = useTheme();

  // Mock notifications - in production, fetch from API
  const notifications: Notification[] = [
    {
      id: "1",
      title: "New Order Received",
      message: "Order #ORD-12350 has been placed",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      type: "success",
    },
    {
      id: "2",
      title: "Low Stock Alert",
      message: "Product 'Wooden Bowl' is low on stock",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
      type: "warning",
    },
    {
      id: "3",
      title: "Payout Processed",
      message: "Payout of $1,250.00 has been processed",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      type: "info",
    },
  ];

  const userProfile: UserProfile = {
    name: "John Doe",
    email: "john@artisancrafts.com",
    role: "Artisan Crafts Co.",
  };

  const menuItems: MenuItem[] = [
    {
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      href: "/settings/profile",
    },
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      href: "/settings",
    },
    {
      label: "Help & Support",
      icon: <HelpCircle className="h-4 w-4" />,
      href: "/support",
    },
    {
      label: "View Store",
      icon: <ExternalLink className="h-4 w-4" />,
      href: "https://createconomy.com/store/artisan-crafts",
      external: true,
    },
    {
      label: "Sign Out",
      icon: <LogOut className="h-4 w-4" />,
      href: "/auth/signout",
      variant: "destructive",
    },
  ];

  const handleSearch = (query: string) => {
    console.log("Seller search:", query);
    // Implement seller search functionality
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
    <GlassmorphismNavbar className="border-b">
      {/* Left Section - Search */}
      <div className="flex-1 max-w-md">
        <AnimatedSearch
          placeholder="Search products, orders..."
          onSearch={handleSearch}
          defaultExpanded
        />
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Add Product */}
        <Button asChild size="sm" className="gap-2">
          <Link href="/products/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Link>
        </Button>

        <ThemeToggle
          theme={(theme as "light" | "dark") || "light"}
          onThemeChange={handleThemeChange}
        />
        
        <NotificationsDropdown
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
        />
        
        <ProfileDropdown user={userProfile} menuItems={menuItems} />
      </div>
    </GlassmorphismNavbar>
  );
}
