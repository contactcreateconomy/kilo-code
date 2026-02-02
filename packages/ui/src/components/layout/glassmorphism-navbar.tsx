"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Logo, type LogoProps } from "../navbar/logo"
import { AnimatedSearch, type AnimatedSearchProps } from "../navbar/animated-search"
import { ThemeToggle, type ThemeToggleProps } from "../navbar/theme-toggle"
import { NotificationsDropdown, type NotificationsDropdownProps, type Notification } from "../navbar/notifications-dropdown"
import { ProfileDropdown, type ProfileDropdownProps, type UserProfile, type MenuItem } from "../navbar/profile-dropdown"
import { LoginButton, type LoginButtonProps } from "../navbar/login-button"

interface GlassmorphismNavbarProps {
  /** Logo configuration */
  logo?: Partial<LogoProps>
  /** Show search component */
  showSearch?: boolean
  /** Search configuration */
  searchProps?: Partial<AnimatedSearchProps>
  /** Show theme toggle */
  showThemeToggle?: boolean
  /** Theme toggle configuration */
  themeToggleProps?: Partial<ThemeToggleProps>
  /** Show notifications */
  showNotifications?: boolean
  /** Notifications configuration */
  notificationsProps?: Partial<NotificationsDropdownProps>
  /** Current user (null if not logged in) */
  user?: UserProfile | null
  /** Profile dropdown configuration */
  profileProps?: Partial<ProfileDropdownProps>
  /** Login button configuration */
  loginProps?: Partial<LoginButtonProps>
  /** Additional content to render in the navbar (e.g., cart icon) */
  children?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * GlassmorphismNavbar - Main navbar container with glass effect
 * 
 * Features:
 * - Glass effect: backdrop-blur-md, semi-transparent background
 * - Border bottom: subtle 1px with gradient
 * - Glow effect on interactive elements
 * - Height: 64px
 * - Padding: px-6
 * 
 * @example
 * ```tsx
 * <GlassmorphismNavbar
 *   logo={{ text: "Createconomy" }}
 *   showSearch
 *   showThemeToggle
 *   showNotifications
 *   user={{ name: "John", email: "john@example.com" }}
 * />
 * ```
 */
export function GlassmorphismNavbar({
  logo,
  showSearch = true,
  searchProps,
  showThemeToggle = true,
  themeToggleProps,
  showNotifications = true,
  notificationsProps,
  user,
  profileProps,
  loginProps,
  children,
  className,
}: GlassmorphismNavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "h-16 px-6",
        "flex items-center justify-between",
        // Glassmorphism effect
        "bg-[var(--navbar-bg)]",
        "backdrop-blur-md",
        "border-b border-border/50",
        // Subtle shadow
        "shadow-sm",
        className
      )}
    >
      {/* Left section: Logo */}
      <div className="flex items-center gap-4">
        <Logo {...logo} />
      </div>

      {/* Center section: Search (optional) */}
      {showSearch && (
        <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
          <AnimatedSearch {...searchProps} />
        </div>
      )}

      {/* Right section: Actions */}
      <div className="flex items-center gap-2">
        {/* Custom children (e.g., cart icon) */}
        {children}

        {/* Theme toggle */}
        {showThemeToggle && <ThemeToggle {...themeToggleProps} />}

        {/* Notifications */}
        {showNotifications && user && (
          <NotificationsDropdown {...notificationsProps} />
        )}

        {/* Profile or Login */}
        {user ? (
          <ProfileDropdown user={user} {...profileProps} />
        ) : (
          <LoginButton {...loginProps} />
        )}
      </div>
    </header>
  )
}

export type { 
  GlassmorphismNavbarProps,
  Notification,
  UserProfile,
  MenuItem,
}
