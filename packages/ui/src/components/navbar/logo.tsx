"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "../../lib/utils"

interface LogoProps {
  /** The text to display next to the icon */
  text?: string
  /** Link destination */
  href?: string
  /** Icon to display (defaults to a circle) */
  icon?: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: "sm" | "md" | "lg"
}

/**
 * Logo - Circle icon + text for navbar branding
 * 
 * @example
 * ```tsx
 * <Logo text="Createconomy" href="/" />
 * ```
 */
export function Logo({
  text = "Createconomy",
  href = "/",
  icon,
  className,
  size = "md",
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: "gap-1.5",
      icon: "h-6 w-6",
      text: "text-sm font-semibold",
    },
    md: {
      container: "gap-2",
      icon: "h-8 w-8",
      text: "text-lg font-bold",
    },
    lg: {
      container: "gap-3",
      icon: "h-10 w-10",
      text: "text-xl font-bold",
    },
  }

  const sizes = sizeClasses[size]

  const content = (
    <>
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          "bg-gradient-to-br from-indigo-500 to-purple-600",
          "text-white shadow-md",
          sizes.icon
        )}
      >
        {icon || (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-1/2 w-1/2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
        )}
      </div>

      {/* Text */}
      {text && (
        <span
          className={cn(
            "hidden sm:inline-block",
            "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
            sizes.text
          )}
        >
          {text}
        </span>
      )}
    </>
  )

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center transition-opacity hover:opacity-80",
        sizes.container,
        className
      )}
    >
      {content}
    </Link>
  )
}

export type { LogoProps }
