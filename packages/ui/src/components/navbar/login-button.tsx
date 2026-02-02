"use client"

import * as React from "react"
import { LogIn } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../button"

interface LoginButtonProps {
  /** Button text */
  text?: string
  /** Callback when clicked */
  onClick?: () => void
  /** Link destination (alternative to onClick) */
  href?: string
  /** Additional CSS classes */
  className?: string
  /** Show icon */
  showIcon?: boolean
  /** Button variant */
  variant?: "default" | "outline" | "ghost"
}

/**
 * LoginButton - Primary login button for navbar
 * 
 * @example
 * ```tsx
 * <LoginButton onClick={() => router.push('/auth/signin')} />
 * ```
 */
export function LoginButton({
  text = "Login",
  onClick,
  href,
  className,
  showIcon = false,
  variant = "default",
}: LoginButtonProps) {
  const content = (
    <>
      {showIcon && <LogIn className="h-4 w-4 mr-2" />}
      {text}
    </>
  )

  if (href) {
    return (
      <Button
        variant={variant}
        size="sm"
        className={cn("glow-hover", className)}
        asChild
      >
        <a href={href}>{content}</a>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={cn("glow-hover", className)}
    >
      {content}
    </Button>
  )
}

export type { LoginButtonProps }
