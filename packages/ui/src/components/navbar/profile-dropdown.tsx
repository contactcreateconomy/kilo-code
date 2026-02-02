"use client"

import * as React from "react"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu"

export interface UserProfile {
  name: string
  email: string
  avatar?: string
  role?: string
}

export interface MenuItem {
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
}

interface ProfileDropdownProps {
  /** User profile data */
  user: UserProfile
  /** Additional menu items */
  menuItems?: MenuItem[]
  /** Callback when logout is clicked */
  onLogout?: () => void
  /** Callback when profile is clicked */
  onProfileClick?: () => void
  /** Callback when settings is clicked */
  onSettingsClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * ProfileDropdown - Avatar with dropdown menu
 * 
 * Features:
 * - Avatar with fallback initials
 * - Dropdown with Profile, Settings, Logout
 * - Custom menu items support
 * 
 * @example
 * ```tsx
 * <ProfileDropdown 
 *   user={{ name: "John Doe", email: "john@example.com" }}
 *   onLogout={() => signOut()}
 * />
 * ```
 */
export function ProfileDropdown({
  user,
  menuItems = [],
  onLogout,
  onProfileClick,
  onSettingsClick,
  className,
}: ProfileDropdownProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 p-1.5 rounded-full",
            "hover:bg-muted/50",
            "transition-all duration-300",
            "glow-hover",
            className
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 animate-slide-in-top">
        {/* User info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.role && (
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {user.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Default items */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onProfileClick}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Custom menu items */}
        {menuItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuItems.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={item.onClick}
                  asChild={!!item.href}
                >
                  {item.href ? (
                    <a href={item.href}>
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </a>
                  ) : (
                    <>
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {/* Logout */}
        {onLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type { ProfileDropdownProps }
