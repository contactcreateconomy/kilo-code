"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

interface DotGridBackgroundProps {
  children: React.ReactNode
  /** Enable radial fade from center */
  fadeCenter?: boolean
  /** Additional CSS classes */
  className?: string
  /** Custom dot color (CSS color value) */
  dotColor?: string
  /** Custom dot spacing in pixels */
  dotSpacing?: number
}

/**
 * DotGridBackground - A full-page dot grid pattern with optional fade-center mask
 * 
 * Reference: 21st.dev bg-pattern with fade effect
 * 
 * @example
 * ```tsx
 * <DotGridBackground fadeCenter>
 *   <YourContent />
 * </DotGridBackground>
 * ```
 */
export function DotGridBackground({
  children,
  fadeCenter = true,
  className,
  dotColor,
  dotSpacing,
}: DotGridBackgroundProps) {
  const style = React.useMemo(() => {
    const customStyles: Record<string, string> = {}
    if (dotColor) {
      customStyles["--dot-color"] = dotColor
    }
    if (dotSpacing) {
      customStyles["--dot-spacing"] = `${dotSpacing}px`
    }
    return customStyles
  }, [dotColor, dotSpacing])

  return (
    <div
      className={cn(
        "relative min-h-screen w-full",
        className
      )}
    >
      {/* Dot grid layer */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-0",
          "dot-grid",
          fadeCenter && "dot-grid-fade"
        )}
        style={style}
        aria-hidden="true"
      />
      
      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export type { DotGridBackgroundProps }
