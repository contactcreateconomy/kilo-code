"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "../../lib/utils"

interface ThemeToggleProps {
  /** Current theme */
  theme?: "light" | "dark" | "system"
  /** Callback when theme changes */
  onThemeChange?: (theme: "light" | "dark") => void
  /** Additional CSS classes */
  className?: string
}

/**
 * ThemeToggle - Animated sun/moon icon toggle for dark/light mode
 * 
 * Features:
 * - Smooth rotation + scale animation (300ms)
 * - Subtle glow when hovered
 * 
 * @example
 * ```tsx
 * <ThemeToggle 
 *   theme="light" 
 *   onThemeChange={(theme) => setTheme(theme)} 
 * />
 * ```
 */
export function ThemeToggle({
  theme = "light",
  onThemeChange,
  className,
}: ThemeToggleProps) {
  const [mounted, setMounted] = React.useState(false)
  const isDark = theme === "dark"

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    onThemeChange?.(isDark ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <button
        className={cn(
          "relative flex items-center justify-center",
          "w-10 h-10 rounded-full",
          "bg-transparent",
          "transition-all duration-300",
          className
        )}
        disabled
      >
        <div className="h-5 w-5 bg-muted rounded-full animate-pulse" />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative flex items-center justify-center",
        "w-10 h-10 rounded-full",
        "bg-transparent hover:bg-muted/50",
        "transition-all duration-300",
        "glow-hover",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon */}
      <Sun
        className={cn(
          "absolute h-5 w-5",
          "text-amber-500",
          "transition-all duration-300 ease-in-out",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        )}
      />

      {/* Moon icon */}
      <Moon
        className={cn(
          "absolute h-5 w-5",
          "text-indigo-400",
          "transition-all duration-300 ease-in-out",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
    </button>
  )
}

export type { ThemeToggleProps }
