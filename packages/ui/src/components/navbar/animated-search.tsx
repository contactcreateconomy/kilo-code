"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface AnimatedSearchProps {
  /** Placeholder text for the search input */
  placeholder?: string
  /** Callback when search is submitted */
  onSearch?: (query: string) => void
  /** Callback when search value changes */
  onChange?: (value: string) => void
  /** Additional CSS classes */
  className?: string
  /** Default expanded state */
  defaultExpanded?: boolean
}

/**
 * AnimatedSearch - Expandable search input with glow effects
 * 
 * States:
 * - Closed: Just search icon with glow on hover
 * - Open: Expands to full search bar (smooth width transition)
 * - Focused: Indigo glow effect
 * 
 * @example
 * ```tsx
 * <AnimatedSearch 
 *   placeholder="Search..." 
 *   onSearch={(query) => console.log(query)} 
 * />
 * ```
 */
export function AnimatedSearch({
  placeholder = "Search...",
  onSearch,
  onChange,
  className,
  defaultExpanded = false,
}: AnimatedSearchProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  const [value, setValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleClose = () => {
    setIsExpanded(false)
    setValue("")
    onChange?.("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch?.(value.trim())
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onChange?.(e.target.value)
  }

  const handleBlur = () => {
    // Only collapse if empty
    if (!value.trim()) {
      setIsExpanded(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center overflow-hidden rounded-full",
          "border border-transparent",
          "transition-all duration-300 ease-in-out",
          // Collapsed state
          !isExpanded && [
            "w-10 h-10",
            "bg-transparent",
            "hover:bg-muted/50",
            "cursor-pointer",
            "glow-hover",
          ],
          // Expanded state
          isExpanded && [
            "w-64 h-10",
            "bg-background/80 backdrop-blur-sm",
            "border-border",
            "glow-focus",
          ]
        )}
        onClick={!isExpanded ? handleToggle : undefined}
      >
        {/* Search Icon */}
        <button
          type={isExpanded ? "submit" : "button"}
          className={cn(
            "flex items-center justify-center shrink-0",
            "w-10 h-10",
            "text-muted-foreground",
            "transition-colors duration-200",
            isExpanded && "hover:text-foreground"
          )}
          onClick={!isExpanded ? handleToggle : undefined}
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "flex-1 h-full bg-transparent",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "outline-none border-none",
            "transition-opacity duration-200",
            !isExpanded && "opacity-0 w-0",
            isExpanded && "opacity-100 pr-2"
          )}
        />

        {/* Close button */}
        {isExpanded && value && (
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              "flex items-center justify-center shrink-0",
              "w-8 h-8 mr-1",
              "rounded-full",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted/50",
              "transition-colors duration-200"
            )}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </form>
  )
}

export type { AnimatedSearchProps }
